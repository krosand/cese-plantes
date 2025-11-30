const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const BASE_PATH = process.env.BASE_PATH || ''; // Chemin de base configurable via variable d'environnement

// Identifiants admin (depuis .env ou par défaut)
const ADMIN_USER = process.env.ADMIN_USER || 'admlecese';
const ADMIN_PASS = process.env.ADMIN_PASS || 'Lecese2025.';

// Middleware d'authentification Basic
function basicAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Administration CESE"');
    return res.status(401).send('Authentification requise');
  }

  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('utf8');
  const [username, password] = credentials.split(':');

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    next();
  } else {
    res.setHeader('WWW-Authenticate', 'Basic realm="Administration CESE"');
    return res.status(401).send('Identifiants incorrects');
  }
}

// Configuration multer pour upload d'images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'public', 'images', 'plantes');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Seules les images sont acceptées'));
    }
  }
});

// Middleware
app.use(express.json());

// Routes protégées par authentification (stats et admin)
app.get((BASE_PATH || '') + '/stats.html', basicAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'stats.html'));
});

app.get((BASE_PATH || '') + '/admin.html', basicAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Servir les fichiers statiques avec ou sans BASE_PATH
if (BASE_PATH) {
  app.use(BASE_PATH, express.static('public'));
} else {
  app.use(express.static('public'));
}

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

// Endpoint pour fournir la config au frontend
app.get((BASE_PATH || '') + '/api/config', (req, res) => {
  res.json({ basePath: BASE_PATH });
});

// GET /api/questions - Liste des questions
app.get((BASE_PATH || '') + '/api/questions', (req, res) => {
  const questions = readJSON(QUESTIONS_FILE);
  if (questions) {
    res.json(questions);
  } else {
    res.status(500).json({ error: 'Impossible de charger les questions' });
  }
});

// POST /plante/api/submit - Soumettre les réponses
app.post((BASE_PATH || '') + '/api/submit', (req, res) => {
  const { answers, user } = req.body;

  if (!answers || !Array.isArray(answers)) {
    return res.status(400).json({ error: 'Format de réponses invalide' });
  }

  if (!user || !user.firstName || !user.lastName) {
    return res.status(400).json({ error: 'Nom et prénom requis' });
  }

  if (!user.email) {
    return res.status(400).json({ error: 'Email requis' });
  }

  // Validation du domaine @lecese.fr
  if (!user.email.toLowerCase().endsWith('@lecese.fr')) {
    return res.status(403).json({ error: 'Seuls les emails @lecese.fr sont autorisés' });
  }

  // Calculer la famille recommandée
  const { family, scores } = calculateFamily(answers);

  // Récupérer les plantes de cette famille
  const plants = readJSON(PLANTS_FILE);
  const recommendations = plants[family] || [];

  // Enregistrer le résultat
  const result = {
    timestamp: new Date().toISOString(),
    user: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email.toLowerCase()
    },
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

// GET /plante/api/plants/:family - Récupérer plantes d'une famille
app.get((BASE_PATH || '') + '/api/plants/:family', (req, res) => {
  const plants = readJSON(PLANTS_FILE);
  const family = req.params.family;

  if (plants[family]) {
    res.json(plants[family]);
  } else {
    res.status(404).json({ error: 'Famille non trouvée' });
  }
});

// GET /plante/api/stats/summary - Statistiques agrégées (protégé)
app.get((BASE_PATH || '') + '/api/stats/summary', basicAuth, (req, res) => {
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

// GET /plante/api/stats/adoptions - Liste des adoptions avec utilisateurs (protégé)
app.get((BASE_PATH || '') + '/api/stats/adoptions', basicAuth, (req, res) => {
  const results = readNDJSON(RESULTS_FILE);

  const adoptions = results
    .filter(r => r.user && r.family)
    .map(r => ({
      timestamp: r.timestamp,
      firstName: r.user.firstName,
      lastName: r.user.lastName,
      email: r.user.email || null,
      family: r.family,
      plantName: r.plantName || null
    }))
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  res.json(adoptions);
});

// POST /plante/api/adopt - Enregistrer le choix de plante
app.post((BASE_PATH || '') + '/api/adopt', (req, res) => {
  const { user, plantName } = req.body;

  if (!user || !user.firstName || !user.lastName) {
    return res.status(400).json({ error: 'Utilisateur requis' });
  }

  if (!plantName) {
    return res.status(400).json({ error: 'Nom de plante requis' });
  }

  // Lire tous les résultats
  const results = readNDJSON(RESULTS_FILE);

  // Trouver le dernier résultat de cet utilisateur
  const userResults = results.filter(r =>
    r.user &&
    r.user.firstName === user.firstName &&
    r.user.lastName === user.lastName
  );

  if (userResults.length === 0) {
    return res.status(404).json({ error: 'Aucun résultat trouvé pour cet utilisateur' });
  }

  // Mettre à jour le dernier résultat avec la plante choisie
  const lastResult = userResults[userResults.length - 1];
  lastResult.plantName = plantName;
  lastResult.adoptionTimestamp = new Date().toISOString();

  // Réécrire le fichier NDJSON
  try {
    const content = results.map(r => JSON.stringify(r)).join('\n') + '\n';
    fs.writeFileSync(RESULTS_FILE, content, 'utf8');

    res.json({
      success: true,
      message: `Plante "${plantName}" adoptée avec succès !`
    });
  } catch (err) {
    console.error('Erreur lors de la sauvegarde:', err);
    res.status(500).json({ error: 'Erreur lors de la sauvegarde' });
  }
});

// === ROUTES ADMIN ===

// GET /plante/api/admin/questions - Récupérer questions pour édition
app.get((BASE_PATH || '') + '/api/admin/questions', basicAuth, (req, res) => {
  const questions = readJSON(QUESTIONS_FILE);
  res.json(questions || []);
});

// PUT /plante/api/admin/questions - Modifier questions
app.put((BASE_PATH || '') + '/api/admin/questions', basicAuth, (req, res) => {
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

// GET /plante/api/admin/plants - Récupérer plantes pour édition
app.get((BASE_PATH || '') + '/api/admin/plants', basicAuth, (req, res) => {
  const plants = readJSON(PLANTS_FILE);
  res.json(plants || {});
});

// PUT /plante/api/admin/plants - Modifier plantes
app.put((BASE_PATH || '') + '/api/admin/plants', basicAuth, (req, res) => {
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

// POST /plante/api/admin/upload-image - Upload image de plante
app.post((BASE_PATH || '') + '/api/admin/upload-image', basicAuth, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucune image fournie' });
    }

    res.json({
      success: true,
      filename: req.file.filename,
      path: `images/plantes/${req.file.filename}`
    });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de l\'upload: ' + err.message });
  }
});

// POST /plante/api/admin/seed - Générer données simulées
app.post((BASE_PATH || '') + '/api/admin/seed', basicAuth, (req, res) => {
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

// DELETE /plante/api/admin/clear-all - Supprimer toutes les données
app.delete((BASE_PATH || '') + '/api/admin/clear-all', basicAuth, (req, res) => {
  try {
    // Vider le fichier results.ndjson
    fs.writeFileSync(RESULTS_FILE, '', 'utf8');

    res.json({
      success: true,
      message: 'Toutes les données ont été supprimées avec succès'
    });
  } catch (err) {
    console.error('Erreur lors de la suppression:', err);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la suppression des données'
    });
  }
});

// GET /plante/api/admin/export - Exporter résultats
app.get((BASE_PATH || '') + '/api/admin/export', basicAuth, (req, res) => {
  const { format = 'csv' } = req.query;
  const results = readNDJSON(RESULTS_FILE);

  if (format === 'csv') {
    // Convertir en CSV
    let csv = 'Timestamp,Prénom,Nom,Email,Family,PlanteName,Completed,Scores\n';
    results.forEach(r => {
      const scoresStr = JSON.stringify(r.scores).replace(/,/g, ';');
      const firstName = r.user ? r.user.firstName : '';
      const lastName = r.user ? r.user.lastName : '';
      const email = r.user && r.user.email ? r.user.email : '';
      const plantName = r.plantName || '';
      csv += `${r.timestamp},"${firstName}","${lastName}","${email}",${r.family},"${plantName}",${r.completed},${scoresStr}\n`;
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
