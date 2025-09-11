// "use client";

// import { useMemo, useState } from "react";

// type TabKey = "text" | "file" | "url";

// export default function Home() {
//   const [activeTab, setActiveTab] = useState<TabKey>("text");
//   const [textInput, setTextInput] = useState("");
//   const [fileObj, setFileObj] = useState<File | null>(null);
//   const [urlInput, setUrlInput] = useState("");
//   const [length, setLength] = useState("Medium (300-500 words)");
//   const [style, setStyle] = useState("Professional");
//   const [model, setModel] = useState("llama3.2:latest");
//   const [loading, setLoading] = useState(false);
//   const [summary, setSummary] = useState<string | null>(null);
//   type ResultMeta = { model: string; length: string; style: string };
//   const [resultMeta, setResultMeta] = useState<ResultMeta | null>(null);

//   const canSummarize = useMemo(() => {
//     if (activeTab === "text") return textInput.trim().length > 0;
//     if (activeTab === "file") return Boolean(fileObj);
//     return urlInput.trim().length > 0;
//   }, [activeTab, textInput, fileObj, urlInput]);

//   const apiBase = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

//   async function onGenerate() {
//     if (!canSummarize) return;
//     setLoading(true);
//     setSummary(null);
//     setResultMeta(null);
//     try {
//       const requestModel = model;
//       const requestLength = length;
//       const requestStyle = style;
//       if (activeTab === "text") {
//         const res = await fetch(`${apiBase}/summarize/text`, {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ text: textInput, model: requestModel, length: requestLength, style: requestStyle }),
//         });
//         const data = await res.json();
//         setSummary(data.summary || "");
//         setResultMeta({ model: requestModel, length: requestLength, style: requestStyle });
//       } else if (activeTab === "url") {
//         const res = await fetch(`${apiBase}/summarize/url`, {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ url: urlInput, model: requestModel, length: requestLength, style: requestStyle }),
//         });
//         const data = await res.json();
//         setSummary(data.summary || "");
//         setResultMeta({ model: requestModel, length: requestLength, style: requestStyle });
//       } else if (activeTab === "file" && fileObj) {
//         const form = new FormData();
//         form.append("file", fileObj);
//         form.append("model", requestModel);
//         form.append("length", requestLength);
//         form.append("style", requestStyle);
//         const res = await fetch(`${apiBase}/summarize/file`, { method: "POST", body: form });
//         const data = await res.json();
//         setSummary(data.summary || "");
//         setResultMeta({ model: requestModel, length: requestLength, style: requestStyle });
//       }
//     } catch (err) {
//       setSummary("Failed to generate summary. Ensure the API server is running on 8000.");
//     }
//     setLoading(false);
//   }

//   function onDownload() {
//     if (!summary) return;
//     const blob = new Blob([summary], { type: "text/markdown;charset=utf-8" });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = "summary.md";
//     document.body.appendChild(a);
//     a.click();
//     a.remove();
//     URL.revokeObjectURL(url);
//   }

//   return (
//     <div className="gradient-bg">
//       <div className="mb-8 text-center">
//         <div className="badge mx-auto">⚡ AI Summarizer</div>
//         <h1 className="mt-3 text-3xl md:text-4xl section-title">Summarize text, files, and URLs</h1>
//         <p className="mt-2 subtitle">Clean, fast summaries with your local models via Ollama</p>
//       </div>
//       <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
//       <aside className="card glass p-5 h-max">
//         <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Configuration</h2>
//         <div className="mt-4 space-y-4">
//           <div>
//             <label className="text-sm font-medium">AI Model</label>
//             <select
//               className="select mt-2"
//               value={model}
//               onChange={(e) => setModel(e.target.value)}
//             >
//               <option value="llama3.2:latest">llama3.2:latest</option>
//               <option value="deepseek-r1:latest">deepseek-r1:latest</option>
//             </select>
//           </div>
//           <div>
//             <label className="text-sm font-medium">Summary Length</label>
//             <select
//               className="select mt-2"
//               value={length}
//               onChange={(e) => setLength(e.target.value)}
//             >
//               <option>Small (100-200 words)</option>
//               <option>Medium (300-500 words)</option>
//               <option>Large (600-800 words)</option>
//             </select>
//           </div>
//           <div>
//             <label className="text-sm font-medium">Summary Style</label>
//             <select
//               className="select mt-2"
//               value={style}
//               onChange={(e) => setStyle(e.target.value)}
//             >
//               <option>Professional</option>
//               <option>Academic</option>
//               <option>Simple</option>
//               <option>Bullet Points</option>
//               <option>Executive Summary</option>
//             </select>
//           </div>
//         </div>
//       </aside>

//       <section className="space-y-6">
//         <div className="flex items-center justify-between">
//           <div className="tabs">
//             <button
//               className={`tab ${activeTab === "text" ? "tab-active" : ""}`}
//               onClick={() => setActiveTab("text")}
//             >
//               Text
//             </button>
//             <button
//               className={`tab ${activeTab === "file" ? "tab-active" : ""}`}
//               onClick={() => setActiveTab("file")}
//             >
//               File
//             </button>
//             <button
//               className={`tab ${activeTab === "url" ? "tab-active" : ""}`}
//               onClick={() => setActiveTab("url")}
//             >
//               URL
//             </button>
//           </div>

//           <button
//             className={`btn btn-primary ${!canSummarize || loading ? "opacity-60 cursor-not-allowed" : ""}`}
//             onClick={onGenerate}
//             disabled={!canSummarize || loading}
//           >
//             {loading ? <span className="spinner" /> : null}
//             <span className="ml-2">{loading ? "Generating..." : "Generate Summary"}</span>
//           </button>
//         </div>

//         <div className="card glass p-5">
//           {activeTab === "text" && (
//             <div>
//               <label className="text-sm font-medium">Paste your text</label>
//               <textarea
//                 className="textarea mt-2 h-56"
//                 placeholder="Enter or paste the text you want to summarize..."
//                 value={textInput}
//                 onChange={(e) => setTextInput(e.target.value)}
//               />
//             </div>
//           )}
//           {activeTab === "file" && (
//             <div>
//               <label className="text-sm font-medium">Upload a document</label>
//               <div className="mt-2 flex items-center gap-3">
//                 <input
//                   id="file"
//                   type="file"
//                   className="hidden"
//                   onChange={(e) => {
//                     const file = e.target.files?.[0] || null;
//                     setFileObj(file);
//                   }}
//                 />
//                 <label htmlFor="file" className="btn btn-ghost border border-border">
//                   Choose File
//                 </label>
//                 <span className="text-sm text-gray-500">
//                   {fileObj?.name ?? "No file selected"}
//                 </span>
//               </div>
//             </div>
//           )}
//           {activeTab === "url" && (
//             <div>
//               <label className="text-sm font-medium">Enter webpage URL</label>
//               <input
//                 className="input mt-2"
//                 placeholder="https://example.com/article"
//                 value={urlInput}
//                 onChange={(e) => setUrlInput(e.target.value)}
//               />
//             </div>
//           )}
//         </div>

//         <div className="card glass p-5">
//           <div className="flex items-center justify-between">
//             <h3 className="font-semibold">Result</h3>
//             {summary && (
//               <button onClick={onDownload} className="btn">Download .md</button>
//             )}
//           </div>
//           {loading ? (
//             <div className="mt-4 space-y-3">
//               <div className="skeleton h-5 w-2/3"></div>
//               <div className="skeleton h-5 w-3/4"></div>
//               <div className="skeleton h-5 w-1/2"></div>
//               <div className="skeleton h-5 w-full"></div>
//             </div>
//           ) : (
//             <div className="mt-4 text-sm leading-6">
//               {summary ? (
//                 <div className="space-y-4">
//                   {resultMeta && (
//                     <div className="flex flex-wrap gap-2">
//                       <span className="chip">Model: {resultMeta.model}</span>
//                       <span className="chip">Length: {resultMeta.length}</span>
//                       <span className="chip">Style: {resultMeta.style}</span>
//                     </div>
//                   )}
//                   <div className="prose prose-sm max-w-none">
//                     <p>{summary}</p>
//                   </div>
//                 </div>
//               ) : (
//                 <p className="text-gray-500">No summary yet. Configure options and provide input, then click Generate.</p>
//               )}
//             </div>
//           )}
//         </div>
//       </section>
//       </div>
//     </div>
//   );
// }


"use client";
import { useMemo, useState } from "react";
import { DocumentTextIcon, LinkIcon, DocumentArrowDownIcon, ArrowLeftOnRectangleIcon } from "@heroicons/react/24/outline";
import LogoutButton from "@/app/components/LogoutButton";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
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

  function handleLogout() {
    localStorage.removeItem('auth');
    router.replace('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="border-b border-border/60 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">

                {/* <span className="font-semibold tracking-tight">AI Summarizer</span> */}
                <img className="h-8 w-auto" src="/logo.png" alt="AI Summarizer" />
              </div>
              <LogoutButton/>

            </div>
          </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Summarize text, files, and URLs</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Clean, fast summaries with your local models via Ollama
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8">
          {/* Configuration Panel */}
          <aside className="bg-white rounded-xl shadow-sm p-6 h-fit">
            <h2 className="text-lg font-Mobile text-gray-900 mb-6">Configuration</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">AI Model</label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                >
                  <option value="llama3.2:latest">llama3.2:latest</option>
                  <option value="deepseek-r1:latest">deepseek-r1:latest</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Summary Length</label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                >
                  <option>Small (100-200 words)</option>
                  <option>Medium (300-500 words)</option>
                  <option>Large (600-800 words)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Summary Style</label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
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

          {/* Main Content Area */}
          <section className="space-y-8">
            {/* Tabs */}
            <div className="flex items-center justify-between">
              <div className="flex border border-gray-200 rounded-lg p-1 bg-gray-50">
                <button
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                    activeTab === "text" 
                      ? "bg-white shadow-sm text-blue-600" 
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  onClick={() => setActiveTab("text")}
                >
                  <DocumentTextIcon className="h-5 w-5" />
                  <span>Text</span>
                </button>
                
                <button
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                    activeTab === "file" 
                      ? "bg-white shadow-sm text-blue-600" 
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  onClick={() => setActiveTab("file")}
                >
                  <DocumentArrowDownIcon className="h-5 w-5" />
                  <span>File</span>
                </button>
                
                <button
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                    activeTab === "url" 
                      ? "bg-white shadow-sm text-blue-600" 
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  onClick={() => setActiveTab("url")}
                >
                  <LinkIcon className="h-5 w-5" />
                  <span>URL</span>
                </button>
              </div>
              
              <button
                className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg font-medium transition-colors ${
                  canSummarize && !loading
                    ? "bg-green-600 text-white hover:bg-blue-700"
                    : "bg-green-200 text-green-500 cursor-not-allowed"
                }`}
                onClick={onGenerate}
                disabled={!canSummarize || loading}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Generating...</span>
                  </>
                ) : (
                  <span>Generate Summary</span>
                )}
              </button>
            </div>

            {/* Input Area */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              {activeTab === "text" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Paste your text</label>
                  <textarea
                    className="w-full h-56 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Enter or paste the text you want to summarize..."
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                  />
                </div>
              )}
              
              {activeTab === "file" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Upload a document</label>
                  <div className="flex items-center gap-4">
                    <label className="flex-1 cursor-pointer">
                      <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                        <DocumentArrowDownIcon className="h-10 w-10 text-gray-400 mb-2" />
                        <span className="text-sm font-medium text-gray-700">
                          {fileObj ? fileObj.name : "Click to upload a file"}
                        </span>
                        <span className="text-xs text-gray-500 mt-1">
                          PDF, DOCX, TXT (Max 10MB)
                        </span>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setFileObj(file);
                        }}
                      />
                    </label>
                  </div>
                </div>
              )}
              
              {activeTab === "url" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Enter webpage URL</label>
                  <input
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="https://example.com/article"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* Result Area */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-Mobile text-gray-900">Result</h3>
                {summary && (
                  <button 
                    onClick={onDownload}
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <DocumentArrowDownIcon className="h-5 w-5" />
                    <span>Download .md</span>
                  </button>
                )}
              </div>
              
              {loading ? (
                <div className="mt-4 space-y-4">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6 mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ) : (
                <div className="mt-4">
                  {summary ? (
                    <div className="space-y-6">
                      {resultMeta && (
                        <div className="flex flex-wrap gap-3">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            Model: {resultMeta.model}
                          </span>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            Length: {resultMeta.length}
                          </span>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            Style: {resultMeta.style}
                          </span>
                        </div>
                      )}
                      <div className="prose prose-sm max-w-none text-gray-700">
                        <p className="whitespace-pre-line">{summary}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <DocumentTextIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No summary yet. Configure options and provide input, then click Generate.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border border-gray-200 py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} Data Panther. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}