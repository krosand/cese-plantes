import os
from pathlib import Path
from PIL import Image, ImageOps
from rembg import remove

# Réglages
SIZE = (500, 500)  # sortie carrée
INPUT_DIR = Path("input")   # mets tes 12 images ici
OUTPUT_DIR = Path("output") # les résultats iront ici
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

def process_one(img_path: Path):
    name = img_path.stem

    # Ouvre en RGBA
    img = Image.open(img_path).convert("RGBA")

    # Détourage (suppression fond)
    cut = remove(img)  # conserve alpha sur le sujet

    # Ajuste dans un carré 500x500 sans déformer
    # Version transparente
    canvas_trans = Image.new("RGBA", SIZE, (255, 255, 255, 0))
    fitted_trans = ImageOps.contain(cut, SIZE)
    canvas_trans.paste(
        fitted_trans,
        ((SIZE[0] - fitted_trans.width) // 2, (SIZE[1] - fitted_trans.height) // 2),
        mask=fitted_trans
    )
    out_trans = OUTPUT_DIR / f"{name}_transparent.png"
    canvas_trans.save(out_trans, "PNG", optimize=True)

    # Version fond blanc (#FFFFFF)
    canvas_white = Image.new("RGB", SIZE, (255, 255, 255))
    fitted_white = ImageOps.contain(cut, SIZE)
    # Si fitted_white est RGBA, coller avec son alpha pour préserver les contours
    if fitted_white.mode != "RGBA":
        fitted_white = fitted_white.convert("RGBA")
    canvas_white.paste(
        fitted_white,
        ((SIZE[0] - fitted_white.width) // 2, (SIZE[1] - fitted_white.height) // 2),
        mask=fitted_white.split()[3]
    )
    out_white = OUTPUT_DIR / f"{name}_blanc.png"
    canvas_white.save(out_white, "PNG", optimize=True)

def main():
    exts = {".png", ".jpg", ".jpeg", ".webp"}
    files = [p for p in INPUT_DIR.iterdir() if p.suffix.lower() in exts]
    if not files:
        print(f"Aucune image trouvée dans {INPUT_DIR.resolve()}")
        return
    for p in files:
        try:
            process_one(p)
            print(f"OK: {p.name}")
        except Exception as e:
            print(f"ERREUR: {p.name} -> {e}")

if __name__ == "__main__":
    main()

