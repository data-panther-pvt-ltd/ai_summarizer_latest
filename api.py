from typing import Optional
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from content_loader import ContentLoader
from summarizer import DocumentSummarizer


app = FastAPI(title="AI Summarizer API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class TextPayload(BaseModel):
    text: str
    model: str = "deepseek-r1:latest"
    length: str = "Medium (300-500 words)"
    style: str = "Professional"


class UrlPayload(BaseModel):
    url: str
    model: str = "deepseek-r1:latest"
    length: str = "Medium (300-500 words)"
    style: str = "Professional"


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
    loader = ContentLoader()
    docs = loader.load_text(payload.text)
    summarizer = DocumentSummarizer(model_name=payload.model)
    summary = summarizer.summarize_documents(
        docs,
        target_length=map_length_to_instruction(payload.length),
        style=payload.style,
    )
    return {"summary": summary}


@app.post("/summarize/url")
def summarize_url(payload: UrlPayload):
    loader = ContentLoader()
    docs = loader.load_url(payload.url)
    summarizer = DocumentSummarizer(model_name=payload.model)
    summary = summarizer.summarize_documents(
        docs,
        target_length=map_length_to_instruction(payload.length),
        style=payload.style,
    )
    return {"summary": summary}


@app.post("/summarize/file")
async def summarize_file(
    file: UploadFile = File(...),
    model: str = Form("deepseek-r1:latest"),
    length: str = Form("Medium (300-500 words)"),
    style: str = Form("Professional"),
):
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
    summarizer = DocumentSummarizer(model_name=model)
    summary = summarizer.summarize_documents(
        docs,
        target_length=map_length_to_instruction(length),
        style=style,
    )
    return {"summary": summary}


# Run with: uvicorn api:app --host 0.0.0.0 --port 8000

