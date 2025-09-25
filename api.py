from typing import Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from content_loader import ContentLoader
from summarizer import DocumentSummarizer
import yaml
from pathlib import Path


app = FastAPI(title="AI Summarizer API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


ALLOWED_MODELS = {"gpt-4o-mini", "gpt-4o", "gpt-4.1"}


class TextPayload(BaseModel):
    text: str
    model: str
    length: str = "Medium (300-500 words)"
    style: str = "Professional"
    language: str | None = None  # "en" or "ar"
    openai_api_key: Optional[str] = None


class UrlPayload(BaseModel):
    url: str
    model: str
    length: str = "Medium (300-500 words)"
    style: str = "Professional"
    language: str | None = None
    openai_api_key: Optional[str] = None


############ OpenAI API key storage ############
CREDS_FILE = Path(__file__).parent / "credentials.yaml"

def _read_yaml() -> dict:
    if CREDS_FILE.exists():
        with CREDS_FILE.open("r", encoding="utf-8") as f:
            return yaml.safe_load(f) or {}
    return {}

def _write_yaml(data: dict) -> None:
    with CREDS_FILE.open("w", encoding="utf-8") as f:
        yaml.safe_dump(data, f, sort_keys=False, allow_unicode=True)

class ApiKeyPayload(BaseModel):
    api_key: str

@app.get("/config/openai-key")
def get_openai_key():
    data = _read_yaml()
    key = (data.get("openai") or {}).get("api_key")
    return {"api_key": key or None}

@app.post("/config/openai-key")
def set_openai_key(payload: ApiKeyPayload):
    data = _read_yaml()
    if "openai" not in data or not isinstance(data["openai"], dict):
        data["openai"] = {}
    data["openai"]["api_key"] = payload.api_key
    _write_yaml(data)
    return {"status": "ok"}

@app.delete("/config/openai-key")
def delete_openai_key():
    data = _read_yaml()
    if "openai" in data and isinstance(data["openai"], dict) and "api_key" in data["openai"]:
        del data["openai"]["api_key"]
        if not data["openai"]:
            del data["openai"]
        _write_yaml(data)
    return {"status": "ok"}


def map_length_to_instruction(length: str, custom: Optional[int] = None) -> str:
    if length.startswith("Small"):
        return "Write a detailed and in-depth summary between 100-200 words"
    if length.startswith("Medium"):
        return "Write a detailed and in-depth summary between 300-500 words"
    if length.startswith("Large"):
        return "Write a detailed and in-depth summary between 600-800 words"
    if custom:
        return f"Write a detailed and in-depth summary that should be {custom} words"
    return "Write a detailed and in-depth summary between 300-500 words"


@app.post("/summarize/text")
def summarize_text(payload: TextPayload):
    if payload.model not in ALLOWED_MODELS:
        raise HTTPException(status_code=400, detail=f"Unsupported model. Allowed: {sorted(ALLOWED_MODELS)}")
    try:
        loader = ContentLoader()
        docs = loader.load_text(payload.text)
        # Prefer per-request key from client; fallback to server-stored (if any)
        key_data = _read_yaml()
        openai_key = payload.openai_api_key or (key_data.get("openai") or {}).get("api_key")
        summarizer = DocumentSummarizer(model_name=payload.model, openai_api_key=openai_key)
        summary = summarizer.summarize_documents(
            docs,
            target_length=map_length_to_instruction(payload.length),
            style=payload.style,
            language=payload.language or "en",
        )
        return {"summary": summary}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/summarize/url")
def summarize_url(payload: UrlPayload):
    if payload.model not in ALLOWED_MODELS:
        raise HTTPException(status_code=400, detail=f"Unsupported model. Allowed: {sorted(ALLOWED_MODELS)}")
    try:
        loader = ContentLoader()
        docs = loader.load_url(payload.url)
        key_data = _read_yaml()
        openai_key = payload.openai_api_key or (key_data.get("openai") or {}).get("api_key")
        summarizer = DocumentSummarizer(model_name=payload.model, openai_api_key=openai_key)
        summary = summarizer.summarize_documents(
            docs,
            target_length=map_length_to_instruction(payload.length),
            style=payload.style,
            language=payload.language or "en",
        )
        return {"summary": summary}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/summarize/file")
async def summarize_file(
    file: UploadFile = File(...),
    model: str = Form(...),
    length: str = Form("Medium (300-500 words)"),
    style: str = Form("Professional"),
    language: str = Form("en"),
    openai_api_key: Optional[str] = Form(None),
):
    if model not in ALLOWED_MODELS:
        raise HTTPException(status_code=400, detail=f"Unsupported model. Allowed: {sorted(ALLOWED_MODELS)}")
    try:
        loader = ContentLoader()
        # FastAPI UploadFile provides .file-like interface; wrap to mimic Streamlit's attribute used in loader
        class TempUpload:
            def __init__(self, uf: UploadFile):
                self._uf = uf
                self.name = uf.filename
                self.type = uf.content_type

            def getbuffer(self):
                return self._uf.file.read()

        docs = loader.load_file(TempUpload(file))
        key_data = _read_yaml()
        openai_key = openai_api_key or (key_data.get("openai") or {}).get("api_key")
        summarizer = DocumentSummarizer(model_name=model, openai_api_key=openai_key)
        summary = summarizer.summarize_documents(
            docs,
            target_length=map_length_to_instruction(length),
            style=style,
            language=language or "en",
        )
        return {"summary": summary}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# Run with: uvicorn api:app --host 0.0.0.0 --port 8000

