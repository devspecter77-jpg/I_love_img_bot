"""
AI Background Removal — Yuqori sifat versiyasi
- Oddiy rejim: 768px (tez, yaxshi sifat)
- HD rejim: to'liq o'lcham (sekin, eng yuqori sifat)
- Mask chetlari silliq
"""

import os
import io
import logging
import asyncio
from contextlib import asynccontextmanager
from concurrent.futures import ThreadPoolExecutor

import uvicorn
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.responses import Response
from PIL import Image, ImageFilter

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

_session = None
_executor = ThreadPoolExecutor(max_workers=8)

MAX_SIZE = int(os.getenv("MAX_SIZE", "384"))
REMBG_MODEL = os.getenv("REMBG_MODEL", "u2net")


def _configure_onnx():
    try:
        import onnxruntime as ort
        ort.set_default_logger_severity(3)
        logger.info(f"ONNX: {os.cpu_count()} CPU core")
    except Exception:
        pass


def load_model():
    global _session
    _configure_onnx()
    try:
        from rembg import new_session
        logger.info(f"Model yuklanmoqda: {REMBG_MODEL}...")
        _session = new_session(REMBG_MODEL)
        logger.info(f"Model tayyor: {REMBG_MODEL}")
    except Exception as e:
        logger.error(f"Model yuklanmadi: {e}")
        _session = None


def _smooth_mask(result_bytes: bytes) -> bytes:
    """Mask chetlarini silliqlashtirish — shaffof qismlar aniq bo'lsin"""
    img = Image.open(io.BytesIO(result_bytes)).convert("RGBA")
    r, g, b, a = img.split()
    a_smooth = a.filter(ImageFilter.GaussianBlur(radius=0.6))
    img_smooth = Image.merge("RGBA", (r, g, b, a_smooth))
    out = io.BytesIO()
    img_smooth.save(out, format="PNG", optimize=True)
    return out.getvalue()


def _remove_bg_sync(image_bytes: bytes, max_size: int) -> bytes:
    """
    BG olib tashlash:
    max_size=0  → HD: to'liq o'lchamda (sekin, eng sifatli)
    max_size>0  → Tez: kichraytirish bilan
    """
    from rembg import remove

    img = Image.open(io.BytesIO(image_bytes)).convert("RGBA")
    orig_w, orig_h = img.size

    if max_size > 0:
        scale = min(max_size / orig_w, max_size / orig_h, 1.0)
    else:
        scale = 1.0

    if scale < 1.0:
        new_w = max(int(orig_w * scale), 32)
        new_h = max(int(orig_h * scale), 32)
        img_proc = img.resize((new_w, new_h), Image.LANCZOS)
        logger.info(f"  {orig_w}x{orig_h} -> {new_w}x{new_h}")
    else:
        img_proc = img
        logger.info(f"  HD rejim: {orig_w}x{orig_h}")

    buf = io.BytesIO()
    img_proc.save(buf, format="PNG")
    result_bytes = remove(buf.getvalue(), session=_session)

    # Mask silliqlashtirish
    result_bytes = _smooth_mask(result_bytes)

    # Asl o'lchamga qaytarish
    if scale < 1.0:
        result_img = Image.open(io.BytesIO(result_bytes)).convert("RGBA")
        result_img = result_img.resize((orig_w, orig_h), Image.LANCZOS)
        out = io.BytesIO()
        result_img.save(out, format="PNG", optimize=True)
        return out.getvalue()

    return result_bytes


@asynccontextmanager
async def lifespan(app: FastAPI):
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(_executor, load_model)
    yield


app = FastAPI(title="AI BG Removal", version="4.0.0", lifespan=lifespan)


@app.get("/health")
async def health():
    return {
        "status": "ok" if _session else "loading",
        "model_ready": _session is not None,
        "model": REMBG_MODEL,
        "max_size": MAX_SIZE,
    }


@app.post("/remove-background")
async def remove_background(
    image: UploadFile = File(...),
    model: str = Form(default="u2net"),
    hd_mode: str = Form(default="false"),
):
    allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if image.content_type not in allowed:
        raise HTTPException(400, f"Format qollab-quvvatlanmaydi: {image.content_type}")

    if _session is None:
        raise HTTPException(503, "Model yuklanmoqda...")

    image_bytes = await image.read()
    size_kb = len(image_bytes) // 1024
    logger.info(f"Ishlanmoqda: {image.filename} | {size_kb}KB | hd={hd_mode}")

    max_size = 0 if hd_mode == "true" else MAX_SIZE

    try:
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(
            _executor, _remove_bg_sync, image_bytes, max_size
        )
        logger.info(f"Tayyor: {image.filename} -> {len(result)//1024}KB")
        return Response(content=result, media_type="image/png")

    except Exception as e:
        logger.error(f"Xato ({image.filename}): {e}")
        raise HTTPException(500, str(e))


if __name__ == "__main__":
    port = int(os.getenv("AI_SERVICE_PORT", 8000))
    host = os.getenv("AI_SERVICE_HOST", "0.0.0.0")
    logger.info(f"AI service: {host}:{port} | model={REMBG_MODEL} | max_size={MAX_SIZE}px")
    uvicorn.run(app, host=host, port=port, workers=1)
