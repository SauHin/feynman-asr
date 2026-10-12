import os
import site
from pathlib import Path

# Windows: CTranslate2 mencari cublas64_12.dll lewat PATH. DLL itu berasal dari paket pip
# nvidia-cublas-cu12, jadi foldernya didaftarkan di sini sebelum faster_whisper dimuat.
if os.name == "nt":
    for sp in site.getsitepackages():
        for bin_dir in Path(sp).glob("nvidia/*/bin"):
            os.environ["PATH"] = f"{bin_dir}{os.pathsep}{os.environ['PATH']}"
