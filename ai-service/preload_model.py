"""
Modelni oldindan yuklash skripti
Bir marta ishga tushiring: python preload_model.py
"""
import os
print("=" * 50)
print("Model yuklanmoqda, biroz kuting...")
print("(Bu faqat bir marta bo'ladi)")
print("=" * 50)

try:
    from rembg import new_session
    model = os.getenv("REMBG_MODEL", "u2net")
    print(f"\nModel: {model}")
    session = new_session(model)
    print(f"\n✅ {model} muvaffaqiyatli yuklandi!")
    print("Endi 'python main.py' ni ishga tushiring.")
except Exception as e:
    print(f"\n❌ Xato: {e}")
    print("pip install rembg onnxruntime ni tekshiring")
