"""
Prepara los recursos cinematográficos de The Last Spartan.

Toma las ilustraciones originales de `art-source/` (fuera de la carpeta que se
publica) y genera copias optimizadas para el runtime en
`mi-primer-juego/assets/cine/`:

  * Plates cinematográficos (ilustraciones de hito) a 1920 px de ancho.
  * Retratos cuadrados de personaje (recorte de rostro + grado de color) a 512 px.
  * Hojas de sprites de los GIF animados (Phaser no reproduce GIF en canvas).

Los originales nunca se modifican: siguen siendo la fuente de verdad.

Uso:
    python tools/prepare_cinematics.py
    python tools/prepare_cinematics.py --only plates
    python tools/prepare_cinematics.py --only portraits
    python tools/prepare_cinematics.py --only gifs
"""

import argparse
import os

from PIL import Image, ImageEnhance, ImageFilter, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ART_SOURCE = os.path.join(ROOT, "art-source")
OUT_DIR = os.path.join(ROOT, "mi-primer-juego", "assets", "cine")

PLATE_WIDTH = 1920
PLATE_QUALITY = 82
PORTRAIT_SIZE = 512
PORTRAIT_QUALITY = 86

# Ilustraciones de hito -> clave de textura de runtime
PLATES = [
    ("Escena 1 El Escudo del Pueblo y el Llamado de la Sangre/hito1_1.webp", "cine_hito1_1"),
    ("Escena 1 El Escudo del Pueblo y el Llamado de la Sangre/hito1_2.webp", "cine_hito1_2"),
    ("Escena 1 El Escudo del Pueblo y el Llamado de la Sangre/hito1_3.webp", "cine_hito1_3"),
    ("Escena 2 El Barro, la Lanza y la Caída/Hito2_1.webp", "cine_hito2_1"),
    ("Escena 2 El Barro, la Lanza y la Caída/Hito2_2.webp", "cine_hito2_2"),
    ("Escena 2 El Barro, la Lanza y la Caída/Hito2_3.webp", "cine_hito2_3"),
    ("Escena 3 Cenizas del Deber/Hito3_1.webp", "cine_hito3_1"),
    ("Escena 3 Cenizas del Deber/Hito3_2.webp", "cine_hito3_2"),
]

# Retratos: (archivo, clave, centroX, centroY, lado de recorte, grado)
# centroX / centroY son relativos (0..1) al tamaño de la imagen original.
PORTRAITS = [
    ("esposa/esposa.webp", "hd_portrait_wife", 0.52, 0.44, 1320, "warm"),
    ("soldado/soldado.webp", "hd_portrait_soldier", 0.47, 0.21, 980, "resolve"),
    ("soldado/soldado.webp", "hd_portrait_soldier_thought", 0.47, 0.21, 1120, "thought"),
    ("soldado/soldado.webp", "hd_portrait_soldier_shock", 0.47, 0.20, 1040, "shock"),
    ("soldado/soldado.webp", "hd_portrait_soldier_despair", 0.47, 0.21, 1120, "despair"),
    ("soldado/soldado.webp", "hd_portrait_soldier_penance", 0.47, 0.19, 980, "penance"),
    ("general/general.webp", "hd_portrait_general_sepia", 0.50, 0.20, 1000, "sepia"),
    ("general/general.webp", "hd_portrait_general_fierce", 0.50, 0.19, 900, "fierce"),
    ("general/general.webp", "hd_portrait_general_frown", 0.50, 0.20, 1040, "frown"),
    ("general/general.webp", "hd_portrait_general_smirk", 0.50, 0.21, 1180, "smirk"),
    ("hijos/hijos.webp", "hd_portrait_children", 0.50, 0.44, 1400, "warm"),
    ("familia/familia.webp", "hd_portrait_family", 0.50, 0.50, 1520, "warm"),
]

# GIF animados -> hoja de sprites (Phaser no reproduce GIF animados en canvas).
# (archivo, clave, ancho de frame, alto de frame, columnas, filas)
GIF_SHEETS = [
    ("Escena 3 Cenizas del Deber/Hito3_3.gif", "cine_hito3_3_sheet", 900, 506, 4, 8),
]

GRADES = {
    "fierce": {"contrast": 1.14, "color": 1.12, "brightness": 1.0, "tint": None},
    "frown": {"contrast": 1.08, "color": 0.82, "brightness": 0.86, "tint": (0x22, 0x33, 0x4d, 0.10)},
    "smirk": {"contrast": 1.05, "color": 1.06, "brightness": 1.05, "tint": (0x8a, 0x4a, 0x1e, 0.07)},
    "thought": {"contrast": 0.98, "color": 0.62, "brightness": 1.02, "tint": (0x33, 0x4a, 0x66, 0.12)},
    "shock": {"contrast": 1.22, "color": 0.3, "brightness": 0.9, "tint": (0x1c, 0x28, 0x38, 0.2)},
    "despair": {"contrast": 1.16, "color": 0.4, "brightness": 0.82, "tint": (0x24, 0x1a, 0x18, 0.22)},
    "penance": {"contrast": 1.24, "color": 0.32, "brightness": 0.74, "tint": (0x2a, 0x12, 0x10, 0.26)},
    "sepia": {"contrast": 1.05, "color": 1.0, "brightness": 1.0, "tint": None, "mode": "sepia"},
    "resolve": {"contrast": 1.07, "color": 1.04, "brightness": 1.01, "tint": None},
    "warm": {"contrast": 1.02, "color": 1.03, "brightness": 1.02, "tint": (0x9a, 0x5a, 0x28, 0.05)},
}


def apply_grade(image, grade_name):
    grade = GRADES.get(grade_name)
    if not grade:
        return image

    if grade.get("mode") == "sepia":
        gray = image.convert("L")
        result = ImageOps.colorize(gray, black=(38, 24, 14), white=(236, 216, 182))
        return ImageEnhance.Contrast(result).enhance(grade["contrast"])

    result = ImageEnhance.Brightness(image).enhance(grade["brightness"])
    result = ImageEnhance.Contrast(result).enhance(grade["contrast"])
    result = ImageEnhance.Color(result).enhance(grade["color"])

    if grade["tint"]:
        r, g, b, alpha = grade["tint"]
        layer = Image.new("RGB", result.size, (r, g, b))
        result = Image.blend(result, layer, alpha)

    return result


def ensure_out_dir():
    os.makedirs(OUT_DIR, exist_ok=True)


def build_plates():
    for relative_path, key in PLATES:
        source = os.path.join(ART_SOURCE, relative_path)
        if not os.path.exists(source):
            print(f"  ! falta {relative_path}")
            continue

        image = Image.open(source).convert("RGB")
        width, height = image.size
        target_height = round(height * (PLATE_WIDTH / width))
        image = image.resize((PLATE_WIDTH, target_height), Image.LANCZOS)

        destination = os.path.join(OUT_DIR, f"{key}.webp")
        image.save(destination, "WEBP", quality=PLATE_QUALITY, method=6)
        size_kb = os.path.getsize(destination) / 1024
        print(f"  plate  {key:18s} {image.size[0]}x{image.size[1]}  {size_kb:6.0f} KB")


def build_portraits():
    for relative_path, key, cx, cy, side, grade in PORTRAITS:
        source = os.path.join(ART_SOURCE, relative_path)
        if not os.path.exists(source):
            print(f"  ! falta {relative_path}")
            continue

        image = Image.open(source).convert("RGB")
        width, height = image.size
        crop_side = min(side, width, height)

        left = int(cx * width - crop_side / 2)
        top = int(cy * height - crop_side / 2)
        left = max(0, min(left, width - crop_side))
        top = max(0, min(top, height - crop_side))

        portrait = image.crop((left, top, left + crop_side, top + crop_side))
        portrait = portrait.resize((PORTRAIT_SIZE, PORTRAIT_SIZE), Image.LANCZOS)
        portrait = apply_grade(portrait, grade)

        destination = os.path.join(OUT_DIR, f"{key}.webp")
        portrait.save(destination, "WEBP", quality=PORTRAIT_QUALITY, method=6)
        size_kb = os.path.getsize(destination) / 1024
        print(f"  portrait {key:26s} {size_kb:6.0f} KB")


def build_gif_sheets():
    for relative_path, key, frame_width, frame_height, cols, rows in GIF_SHEETS:
        source = os.path.join(ART_SOURCE, relative_path)
        if not os.path.exists(source):
            print(f"  ! falta {relative_path}")
            continue

        gif = Image.open(source)
        frame_count = getattr(gif, "n_frames", 1)
        capacity = cols * rows
        if frame_count > capacity:
            print(f"  ! {key}: {frame_count} frames no caben en {cols}x{rows}")
            continue

        sheet = Image.new("RGB", (frame_width * cols, frame_height * rows), (8, 6, 8))
        for index in range(frame_count):
            gif.seek(index)
            frame = gif.convert("RGB").resize((frame_width, frame_height), Image.LANCZOS)
            # Compensa la ampliación desde 640x360 con un enfoque suave
            frame = frame.filter(ImageFilter.UnsharpMask(radius=1.6, percent=65, threshold=2))
            sheet.paste(frame, ((index % cols) * frame_width, (index // cols) * frame_height))

        destination = os.path.join(OUT_DIR, f"{key}.webp")
        sheet.save(destination, "WEBP", quality=82, method=6)
        size_kb = os.path.getsize(destination) / 1024
        print(
            f"  gif    {key:18s} {sheet.size[0]}x{sheet.size[1]}  "
            f"{frame_count} frames de {frame_width}x{frame_height}  {size_kb:6.0f} KB"
        )


def main():
    parser = argparse.ArgumentParser(description="Genera los recursos cinematográficos optimizados.")
    parser.add_argument("--only", choices=["plates", "portraits", "gifs"], help="Genera solo un grupo de recursos.")
    arguments = parser.parse_args()

    ensure_out_dir()
    print(f"Salida: {OUT_DIR}")

    if arguments.only in (None, "plates"):
        print("Plates cinematográficos:")
        build_plates()

    if arguments.only in (None, "portraits"):
        print("Retratos HD:")
        build_portraits()

    if arguments.only in (None, "gifs"):
        print("Hojas de sprites animadas:")
        build_gif_sheets()

    print("Listo.")


if __name__ == "__main__":
    main()
