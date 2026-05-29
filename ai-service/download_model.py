"""
u2net modelini yuklab olish skripti.
Brauzerdan ham yuklab olsa boladi:
https://github.com/danielgatis/rembg/releases/download/v0.0.0/u2net.onnx
Faylni C:/Users/Javohir/.u2net/u2net.onnx ga saqlang
"""
import os
import urllib.request

MODEL_URL = "https://github.com/danielgatis/rembg/releases/download/v0.0.0/u2net.onnx"
SAVE_DIR = os.path.join(os.path.expanduser("~"), ".u2net")
SAVE_PATH = os.path.join(SAVE_DIR, "u2net.onnx")
EXPECTED_SIZE = 176 * 1024 * 1024  # ~176MB

os.makedirs(SAVE_DIR, exist_ok=True)

# Allaqachon to'liq yuklangan bo'lsa
if os.path.exists(SAVE_PATH):
    size = os.path.getsize(SAVE_PATH)
    if size > 170 * 1024 * 1024:
        print(f"✅ Model allaqachon mavjud: {size // (1024*1024)}MB")
        print(f"   Joyi: {SAVE_PATH}")
        exit(0)
    else:
        print(f"⚠️  Yarim yuklangan fayl ({size // (1024*1024)}MB), qayta yuklanmoqda...")
        os.remove(SAVE_PATH)

print("=" * 55)
print("u2net.onnx modeli yuklanmoqda (~176MB)")
print("=" * 55)
print(f"URL: {MODEL_URL}")
print(f"Saqlash joyi: {SAVE_PATH}")
print()

downloaded = [0]

def show_progress(block_num, block_size, total_size):
    downloaded[0] += block_size
    mb = downloaded[0] / (1024 * 1024)
    total_mb = total_size / (1024 * 1024)
    pct = min(100, int(downloaded[0] / total_size * 100))
    bar = "█" * (pct // 5) + "░" * (20 - pct // 5)
    print(f"\r  [{bar}] {pct}% — {mb:.1f}/{total_mb:.1f} MB", end="", flush=True)

try:
    urllib.request.urlretrieve(MODEL_URL, SAVE_PATH, show_progress)
    size = os.path.getsize(SAVE_PATH)
    print(f"\n\n✅ Muvaffaqiyatli yuklandi: {size // (1024*1024)}MB")
    print(f"   Joyi: {SAVE_PATH}")
    print("\nEndi 'python main.py' ni ishga tushiring!")
except Exception as e:
    print(f"\n\n❌ Xato: {e}")
    print("\nBrauzerdan yuklab oling:")
    print(f"  {MODEL_URL}")
    print(f"\nFaylni shu joyga saqlang:")
    print(f"  {SAVE_PATH}")
