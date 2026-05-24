"use client";
import { useState, useRef } from "react";

interface Props {
  onGenerate: (mode: "github" | "upload", value: string | File[]) => void;
}

export default function InputForm({ onGenerate }: Props) {
  const [mode, setMode] = useState<"github" | "upload">("github");
  const [url, setUrl] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if (mode === "github" && url.trim()) onGenerate("github", url.trim());
    else if (mode === "upload" && files.length > 0) onGenerate("upload", files);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    setFiles(Array.from(e.dataTransfer.files));
  };

  const isReady = mode === "github" ? url.trim().length > 0 : files.length > 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

      {/* Mode toggle */}
      <div style={{ display: "flex", border: "1px solid var(--border)" }}>
        {(["github", "upload"] as const).map((m, i) => {
          const active = mode === m;
          return (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                flex: 1, padding: "0.6rem",
                background: active ? "rgba(163,255,71,0.08)" : "transparent",
                border: "none",
                borderRight: i === 0 ? "1px solid var(--border)" : "none",
                color: active ? "var(--accent)" : "var(--muted)",
                cursor: "pointer", fontSize: 10,
                letterSpacing: "0.1em", fontFamily: "var(--mono)",
                fontWeight: active ? 700 : 400,
                transition: "all 0.15s",
              }}
            >
              {m === "github" ? "⬡ GITHUB URL" : "⬡ UPLOAD FILES"}
            </button>
          );
        })}
      </div>

      {mode === "github" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ fontSize: 9, color: "var(--muted)", letterSpacing: "0.1em" }}>
            REPOSITORY URL
          </div>
          <input
            type="text"
            placeholder="https://github.com/owner/repo"
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
            style={{
              width: "100%", padding: "0.8rem 1rem",
              background: "var(--surface2)",
              border: "1px solid var(--border)",
              color: "var(--text)", fontSize: 12,
              fontFamily: "var(--mono)", outline: "none",
              transition: "border-color 0.15s",
            }}
            onFocus={e => (e.currentTarget.style.borderColor = "var(--accent)")}
            onBlur={e  => (e.currentTarget.style.borderColor = "var(--border)")}
          />
          <div style={{ fontSize: 9, color: "var(--muted)", letterSpacing: "0.04em" }}>
            PUBLIC REPOS FREE · PRIVATE NEEDS GITHUB TOKEN IN .ENV.LOCAL
          </div>
        </div>
      ) : (
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          style={{
            border: `1px dashed ${dragging ? "var(--accent)" : "var(--border)"}`,
            padding: "2rem 1rem", textAlign: "center",
            cursor: "pointer",
            background: dragging ? "rgba(163,255,71,0.04)" : "transparent",
            transition: "all 0.15s",
          }}
        >
          <input
            ref={fileRef} type="file" multiple
            accept=".ts,.tsx,.js,.jsx,.py,.go,.java,.rs,.cpp,.c,.cs,.rb,.php,.md,.json,.yaml,.yml,.zip"
            onChange={e => setFiles(Array.from(e.target.files || []))}
            style={{ display: "none" }}
          />
          <div style={{ fontSize: 24, marginBottom: 8, color: "var(--accent)" }}>⬡</div>
          <div style={{ fontSize: 12, color: "var(--text)", marginBottom: 4 }}>
            {files.length > 0
              ? `${files.length} FILE(S) SELECTED`
              : "DROP FILES OR CLICK TO BROWSE"}
          </div>
          <div style={{ fontSize: 9, color: "var(--muted)", letterSpacing: "0.06em" }}>
            .ZIP .TS .JS .PY .GO .JAVA .RS .MD AND MORE
          </div>
          {files.length > 0 && (
            <div style={{
              marginTop: 10, display: "flex",
              flexWrap: "wrap", gap: 4, justifyContent: "center",
            }}>
              {files.slice(0, 6).map(f => (
                <span key={f.name} style={{
                  fontSize: 9, padding: "2px 6px",
                  background: "var(--surface2)",
                  border: "1px solid var(--border)", color: "var(--muted)",
                }}>{f.name}</span>
              ))}
              {files.length > 6 && (
                <span style={{ fontSize: 9, color: "var(--muted)" }}>
                  +{files.length - 6} MORE
                </span>
              )}
            </div>
          )}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!isReady}
        style={{
          width: "100%", padding: "0.875rem",
          background: isReady ? "var(--accent)" : "var(--surface2)",
          border: `1px solid ${isReady ? "var(--accent)" : "var(--border)"}`,
          color: isReady ? "var(--bg)" : "var(--muted)",
          fontSize: 11, fontWeight: 700,
          letterSpacing: "0.12em", fontFamily: "var(--mono)",
          cursor: isReady ? "pointer" : "not-allowed",
          transition: "all 0.15s",
        }}
      >
        {isReady ? "► GENERATE DOCUMENTATION" : "SELECT SOURCE FIRST"}
      </button>
    </div>
  );
}