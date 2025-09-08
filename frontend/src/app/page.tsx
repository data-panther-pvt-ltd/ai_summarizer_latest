"use client";

import { useMemo, useState } from "react";

type TabKey = "text" | "file" | "url";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabKey>("text");
  const [textInput, setTextInput] = useState("");
  const [fileObj, setFileObj] = useState<File | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const [length, setLength] = useState("Medium (300-500 words)");
  const [style, setStyle] = useState("Professional");
  const [model, setModel] = useState("llama3.2:latest");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  type ResultMeta = { model: string; length: string; style: string };
  const [resultMeta, setResultMeta] = useState<ResultMeta | null>(null);

  const canSummarize = useMemo(() => {
    if (activeTab === "text") return textInput.trim().length > 0;
    if (activeTab === "file") return Boolean(fileObj);
    return urlInput.trim().length > 0;
  }, [activeTab, textInput, fileObj, urlInput]);

  const apiBase = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

  async function onGenerate() {
    if (!canSummarize) return;
    setLoading(true);
    setSummary(null);
    setResultMeta(null);
    try {
      const requestModel = model;
      const requestLength = length;
      const requestStyle = style;
      if (activeTab === "text") {
        const res = await fetch(`${apiBase}/summarize/text`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: textInput, model: requestModel, length: requestLength, style: requestStyle }),
        });
        const data = await res.json();
        setSummary(data.summary || "");
        setResultMeta({ model: requestModel, length: requestLength, style: requestStyle });
      } else if (activeTab === "url") {
        const res = await fetch(`${apiBase}/summarize/url`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: urlInput, model: requestModel, length: requestLength, style: requestStyle }),
        });
        const data = await res.json();
        setSummary(data.summary || "");
        setResultMeta({ model: requestModel, length: requestLength, style: requestStyle });
      } else if (activeTab === "file" && fileObj) {
        const form = new FormData();
        form.append("file", fileObj);
        form.append("model", requestModel);
        form.append("length", requestLength);
        form.append("style", requestStyle);
        const res = await fetch(`${apiBase}/summarize/file`, { method: "POST", body: form });
        const data = await res.json();
        setSummary(data.summary || "");
        setResultMeta({ model: requestModel, length: requestLength, style: requestStyle });
      }
    } catch (err) {
      setSummary("Failed to generate summary. Ensure the API server is running on 8000.");
    }
    setLoading(false);
  }

  function onDownload() {
    if (!summary) return;
    const blob = new Blob([summary], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "summary.md";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="gradient-bg">
      <div className="mb-8 text-center">
        <div className="badge mx-auto">⚡ AI Summarizer</div>
        <h1 className="mt-3 text-3xl md:text-4xl section-title">Summarize text, files, and URLs</h1>
        <p className="mt-2 subtitle">Clean, fast summaries with your local models via Ollama</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
      <aside className="card glass p-5 h-max">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Configuration</h2>
        <div className="mt-4 space-y-4">
          <div>
            <label className="text-sm font-medium">AI Model</label>
            <select
              className="select mt-2"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            >
              <option value="llama3.2:latest">llama3.2:latest</option>
              <option value="deepseek-r1:latest">deepseek-r1:latest</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Summary Length</label>
            <select
              className="select mt-2"
              value={length}
              onChange={(e) => setLength(e.target.value)}
            >
              <option>Small (100-200 words)</option>
              <option>Medium (300-500 words)</option>
              <option>Large (600-800 words)</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Summary Style</label>
            <select
              className="select mt-2"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
            >
              <option>Professional</option>
              <option>Academic</option>
              <option>Simple</option>
              <option>Bullet Points</option>
              <option>Executive Summary</option>
            </select>
          </div>
        </div>
      </aside>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="tabs">
            <button
              className={`tab ${activeTab === "text" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("text")}
            >
              Text
            </button>
            <button
              className={`tab ${activeTab === "file" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("file")}
            >
              File
            </button>
            <button
              className={`tab ${activeTab === "url" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("url")}
            >
              URL
            </button>
          </div>

          <button
            className={`btn btn-primary ${!canSummarize || loading ? "opacity-60 cursor-not-allowed" : ""}`}
            onClick={onGenerate}
            disabled={!canSummarize || loading}
          >
            {loading ? <span className="spinner" /> : null}
            <span className="ml-2">{loading ? "Generating..." : "Generate Summary"}</span>
          </button>
        </div>

        <div className="card glass p-5">
          {activeTab === "text" && (
            <div>
              <label className="text-sm font-medium">Paste your text</label>
              <textarea
                className="textarea mt-2 h-56"
                placeholder="Enter or paste the text you want to summarize..."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
              />
            </div>
          )}
          {activeTab === "file" && (
            <div>
              <label className="text-sm font-medium">Upload a document</label>
              <div className="mt-2 flex items-center gap-3">
                <input
                  id="file"
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setFileObj(file);
                  }}
                />
                <label htmlFor="file" className="btn btn-ghost border border-border">
                  Choose File
                </label>
                <span className="text-sm text-gray-500">
                  {fileObj?.name ?? "No file selected"}
                </span>
              </div>
            </div>
          )}
          {activeTab === "url" && (
            <div>
              <label className="text-sm font-medium">Enter webpage URL</label>
              <input
                className="input mt-2"
                placeholder="https://example.com/article"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
              />
            </div>
          )}
        </div>

        <div className="card glass p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Result</h3>
            {summary && (
              <button onClick={onDownload} className="btn">Download .md</button>
            )}
          </div>
          {loading ? (
            <div className="mt-4 space-y-3">
              <div className="skeleton h-5 w-2/3"></div>
              <div className="skeleton h-5 w-3/4"></div>
              <div className="skeleton h-5 w-1/2"></div>
              <div className="skeleton h-5 w-full"></div>
            </div>
          ) : (
            <div className="mt-4 text-sm leading-6">
              {summary ? (
                <div className="space-y-4">
                  {resultMeta && (
                    <div className="flex flex-wrap gap-2">
                      <span className="chip">Model: {resultMeta.model}</span>
                      <span className="chip">Length: {resultMeta.length}</span>
                      <span className="chip">Style: {resultMeta.style}</span>
                    </div>
                  )}
                  <div className="prose prose-sm max-w-none">
                    <p>{summary}</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No summary yet. Configure options and provide input, then click Generate.</p>
              )}
            </div>
          )}
        </div>
      </section>
      </div>
    </div>
  );
}
