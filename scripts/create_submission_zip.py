import os
import zipfile
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
OUTPUT_ZIP = ROOT_DIR / "CareOBrain-Submission.zip"
DESKTOP_ZIP = Path(r"C:\Users\Victus\Desktop\careObrain.zip")
DESKTOP_ZIP2 = Path(r"C:\Users\Victus\Desktop\careObrain (2).zip")

# Exclude patterns
EXCLUDE_DIRS = {
    "node_modules",
    ".git",
    "dist",
    "__pycache__",
    ".venv",
    "venv",
    ".idea",
    ".vscode"
}
EXCLUDE_EXTS = {".zip", ".pyc"}

def should_exclude(rel_path: Path):
    for part in rel_path.parts:
        if part in EXCLUDE_DIRS:
            return True
    if rel_path.suffix.lower() in EXCLUDE_EXTS:
        return True
    return False

def make_zip(out_path):
    print(f"Creating zip at {out_path}...")
    with zipfile.ZipFile(out_path, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as zipf:
        for file in ROOT_DIR.rglob("*"):
            if file.is_file():
                rel = file.relative_to(ROOT_DIR)
                if not should_exclude(rel):
                    zipf.write(file, arcname=str(rel))

    size_mb = out_path.stat().st_size / (1024 * 1024)
    print(f"Created {out_path.name}: {size_mb:.2f} MB")
    return size_mb

size1 = make_zip(OUTPUT_ZIP)
if size1 < 50:
    import shutil
    shutil.copy2(OUTPUT_ZIP, DESKTOP_ZIP)
    shutil.copy2(OUTPUT_ZIP, DESKTOP_ZIP2)
    print(f"Copied updated zip to Desktop ({size1:.2f} MB, < 50 MB target met).")
