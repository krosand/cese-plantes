const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Chemins des fichiers de données
const QUESTIONS_FILE = path.join(__dirname, 'data', 'questions.json');
const PLANTS_FILE = path.join(__dirname, 'data', 'plants.json');
const RESULTS_FILE = path.join(__dirname, 'data', 'results.ndjson');

// === UTILITAIRES ===

// Lire fichier JSON
function readJSON(filepath) {
  try {
    const data = fs.readFileSync(filepath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Erreur lecture ${filepath}:`, err.message);
    return null;
  }
}

// Écrire fichier JSON
function writeJSON(filepath, data) {
  try {
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error(`Erreur écriture ${filepath}:`, err.message);
    return false;
  }
}

// Lire toutes les lignes NDJSON
function readNDJSON(filepath) {
  try {
    if (!fs.existsSync(filepath)) return [];
    const content = fs.readFileSync(filepath, 'utf8').trim();
    if (!content) return [];
    return content.split('\n').map(line => JSON.parse(line));
  } catch (err) {
    console.error(`Erreur lecture NDJSON ${filepath}:`, err.message);
    return [];
  }
}

// Ajouter une ligne NDJSON
function appendNDJSON(filepath, data) {
  try {
    fs.appendFileSync(filepath, JSON.stringify(data) + '\n', 'utf8');
    return true;
  } catch (err) {
    console.error(`Erreur ajout NDJSON ${filepath}:`, err.message);
    return false;
  }
}

// Calculer la famille de plante recommandée
function calculateFamily(answers) {
  const scores = {
    'Dépolluante': 0,
    'Grimpante': 0,
    'Exotique': 0,
    'Résistante': 0
  };

  const questions = readJSON(QUESTIONS_FILE);

  answers.forEach((answerIndex, questionIndex) => {
    const question = questions[questionIndex];
    if (question && question.choices[answerIndex]) {
      const choiceScores = question.choices[answerIndex].scores;
      Object.keys(choiceScores).forEach(family => {
        scores[family] += choiceScores[family];
      });
    }
  });

  // Trouver la famille avec le score max
  let maxScore = -1;
  let selectedFamily = 'Résistante';

  Object.entries(scores).forEach(([family, score]) => {
    if (score > maxScore) {
      maxScore = score;
      selectedFamily = family;
    }
  });

  return { family: selectedFamily, scores };
}

// === ROUTES API ===

// GET /api/questions - Liste des questions
app.get('/api/questions', (req, res) => {
  const questions = readJSON(QUESTIONS_FILE);
  if (questions) {
    res.json(questions);
  } else {
    res.status(500).json({ error: 'Impossible de charger les questions' });
  }
});

// POST /api/submit - Soumettre les réponses
app.post('/api/submit', (req, res) => {
  const { answers } = req.body;

  if (!answers || !Array.isArray(answers)) {
    return res.status(400).json({ error: 'Format de réponses invalide' });
  }

  // Calculer la famille recommandée
  const { family, scores } = calculateFamily(answers);

  // Récupérer les plantes de cette famille
  const plants = readJSON(PLANTS_FILE);
  const recommendations = plants[family] || [];

  // Enregistrer le résultat
  const result = {
    timestamp: new Date().toISOString(),
    answers,
    family,
    scores,
    completed: answers.length === readJSON(QUESTIONS_FILE).length
  };

  appendNDJSON(RESULTS_FILE, result);

  res.json({
    family,
    scores,
    plants: recommendations
  });
});

// GET /api/plants/:family - Récupérer plantes d'une famille
app.get('/api/plants/:family', (req, res) => {
  const plants = readJSON(PLANTS_FILE);
  const family = req.params.family;

  if (plants[family]) {
    res.json(plants[family]);
  } else {
    res.status(404).json({ error: 'Famille non trouvée' });
  }
});

// GET /api/stats/summary - Statistiques agrégées
app.get('/api/stats/summary', (req, res) => {
  const results = readNDJSON(RESULTS_FILE);

  const summary = {
    totalParticipants: results.length,
    completionRate: 0,
    familyDistribution: {
      'Dépolluante': 0,
      'Grimpante': 0,
      'Exotique': 0,
      'Résistante': 0
    },
    questionAnswers: {},
    timeline: []
  };

  const questions = readJSON(QUESTIONS_FILE);
  const totalQuestions = questions.length;

  // Initialiser questionAnswers
  questions.forEach((q, idx) => {
    summary.questionAnswers[idx] = {};
    q.choices.forEach((choice, choiceIdx) => {
      summary.questionAnswers[idx][choiceIdx] = 0;
    });
  });

  let completedCount = 0;

  results.forEach(result => {
    // Taux de complétion
    if (result.completed) completedCount++;

    // Distribution par famille
    if (result.family) {
      summary.familyDistribution[result.family]++;
    }

    // Réponses par question
    result.answers.forEach((answerIdx, questionIdx) => {
      if (summary.questionAnswers[questionIdx]) {
        summary.questionAnswers[questionIdx][answerIdx]++;
      }
    });

    // Timeline (agrégation par date)
    const date = result.timestamp.split('T')[0];
    const existing = summary.timeline.find(t => t.date === date);
    if (existing) {
      existing.count++;
    } else {
      summary.timeline.push({ date, count: 1 });
    }
  });

  summary.completionRate = results.length > 0
    ? Math.round((completedCount / results.length) * 100)
    : 0;

  // Trouver la famille la plus choisie
  let maxCount = 0;
  let topFamily = null;
  Object.entries(summary.familyDistribution).forEach(([family, count]) => {
    if (count > maxCount) {
      maxCount = count;
      topFamily = family;
    }
  });
  summary.topFamily = topFamily;

  res.json(summary);
});

// === ROUTES ADMIN ===

// GET /api/admin/questions - Récupérer questions pour édition
app.get('/api/admin/questions', (req, res) => {
  const questions = readJSON(QUESTIONS_FILE);
  res.json(questions || []);
});

// PUT /api/admin/questions - Modifier questions
app.put('/api/admin/questions', (req, res) => {
  const { questions } = req.body;

  if (!questions || !Array.isArray(questions)) {
    return res.status(400).json({ error: 'Format invalide' });
  }

  if (writeJSON(QUESTIONS_FILE, questions)) {
    res.json({ success: true, message: 'Questions mises à jour' });
  } else {
    res.status(500).json({ error: 'Erreur lors de la sauvegarde' });
  }
});

// GET /api/admin/plants - Récupérer plantes pour édition
app.get('/api/admin/plants', (req, res) => {
  const plants = readJSON(PLANTS_FILE);
  res.json(plants || {});
});

// PUT /api/admin/plants - Modifier plantes
app.put('/api/admin/plants', (req, res) => {
  const { plants } = req.body;

  if (!plants || typeof plants !== 'object') {
    return res.status(400).json({ error: 'Format invalide' });
  }

  if (writeJSON(PLANTS_FILE, plants)) {
    res.json({ success: true, message: 'Plantes mises à jour' });
  } else {
    res.status(500).json({ error: 'Erreur lors de la sauvegarde' });
  }
});

// POST /api/admin/seed - Générer données simulées
app.post('/api/admin/seed', (req, res) => {
  const { count = 50 } = req.body;
  const questions = readJSON(QUESTIONS_FILE);
  const families = ['Dépolluante', 'Grimpante', 'Exotique', 'Résistante'];

  let generated = 0;

  for (let i = 0; i < count; i++) {
    // Générer réponses aléatoires
    const answers = questions.map(q => {
      return Math.floor(Math.random() * q.choices.length);
    });

    const { family, scores } = calculateFamily(answers);

    // Générer timestamp aléatoire dans les 30 derniers jours
    const randomDays = Math.floor(Math.random() * 30);
    const timestamp = new Date();
    timestamp.setDate(timestamp.getDate() - randomDays);

    const result = {
      timestamp: timestamp.toISOString(),
      answers,
      family,
      scores,
      completed: true
    };

    if (appendNDJSON(RESULTS_FILE, result)) {
      generated++;
    }
  }

  res.json({
    success: true,
    message: `${generated} résultats simulés générés`
  });
});

// GET /api/admin/export - Exporter résultats
app.get('/api/admin/export', (req, res) => {
  const { format = 'csv' } = req.query;
  const results = readNDJSON(RESULTS_FILE);

  if (format === 'csv') {
    // Convertir en CSV
    let csv = 'Timestamp,Family,Completed,Scores\n';
    results.forEach(r => {
      const scoresStr = JSON.stringify(r.scores).replace(/,/g, ';');
      csv += `${r.timestamp},${r.family},${r.completed},${scoresStr}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=results.csv');
    res.send(csv);
  } else if (format === 'ndjson') {
    res.setHeader('Content-Type', 'application/x-ndjson');
    res.setHeader('Content-Disposition', 'attachment; filename=results.ndjson');
    res.send(results.map(r => JSON.stringify(r)).join('\n'));
  } else {
    res.status(400).json({ error: 'Format non supporté (csv ou ndjson)' });
  }
});

// === DÉMARRAGE SERVEUR ===

app.listen(PORT, () => {
  console.log(`✅ Serveur "Adopte une Plante" démarré sur http://localhost:${PORT}`);
  console.log(`📊 Statistiques : http://localhost:${PORT}/stats.html`);
  console.log(`⚙️  Administration : http://localhost:${PORT}/admin.html`);
});
