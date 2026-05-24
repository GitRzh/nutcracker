"use client";
import { useState, useCallback } from "react";
import InputForm from "@/components/InputForm";
import DocPreview from "@/components/DocPreview";
import ProgressBar from "@/components/ProgressBar";
import FileTree from "@/components/FileTree";
import DownloadButton from "@/components/DownloadButton";

export type AppState = "idle" | "fetching" | "generating" | "done" | "error";

export interface DocResult {
  readme: string;
  apiDocs: string;
  overview: {
    projectName: string;
    description: string;
    techStack: string[];
    mainFeatures: string[];
    projectType: string;
  };
  fileCount: number;
}

// ── LED Ticker ──────────────────────────────────────────────────────────────
function Ticker() {
  const text = "NUTCRACKER // TECHNICAL DOCUMENTATION GENERATOR // PASTE REPO — GET DOCS //   ";
  return (
    <div style={{
      width: "100%", overflow: "hidden",
      background: "var(--surface)",
      borderBottom: "1px solid var(--border)",
      padding: "4px 0",
    }}>
      <div style={{
        display: "inline-block",
        whiteSpace: "nowrap",
        animation: "ticker 24s linear infinite",
        fontSize: 10,
        color: "var(--accent)",
        letterSpacing: "0.12em",
      }}>
        {(text + text).repeat(2)}
      </div>
    </div>
  );
}

// ── Block grid loader ───────────────────────────────────────────────────────
function BlockLoader({ value }: { value: number }) {
  const COLS = 16, ROWS = 5;
  const total = COLS * ROWS;
  const filled = Math.floor((value / 100) * total);
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: `repeat(${COLS}, 1fr)`,
      gap: 3,
      width: "100%",
    }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          height: 16,
          background: i < filled ? "var(--accent)" : "var(--surface2)",
          border: "1px solid var(--border)",
          opacity: i < filled ? 1 : 0.45,
          transition: i < filled ? "background 0.2s" : "none",
        }} />
      ))}
    </div>
  );
}

// ── Style selector ──────────────────────────────────────────────────────────
function StyleSelector({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (s: string) => void;
}) {
  const opts = [
    { id: "brief",    icon: "▪",   label: "BRIEF",    desc: "Essentials only" },
    { id: "balanced", icon: "▪▪",  label: "BALANCED", desc: "Standard depth"  },
    { id: "complex",  icon: "▪▪▪", label: "COMPLEX",  desc: "Full deep-dive"  },
  ];
  return (
    <div>
      <div style={{ fontSize: 9, color: "var(--muted)", letterSpacing: "0.12em", marginBottom: 8 }}>
        SELECT DOC STYLE
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        {opts.map(o => {
          const active = selected === o.id;
          return (
            <button
              key={o.id}
              onClick={() => onSelect(o.id)}
              style={{
                padding: "0.65rem 0.5rem",
                background: active ? "rgba(163,255,71,0.08)" : "var(--surface2)",
                border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
                color: active ? "var(--accent)" : "var(--muted)",
                cursor: "pointer", textAlign: "left",
                transition: "all 0.15s", fontFamily: "var(--mono)",
              }}
            >
              <div style={{ fontSize: 13, marginBottom: 3 }}>{o.icon}</div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em" }}>{o.label}</div>
              <div style={{ fontSize: 9, color: "var(--muted)", marginTop: 2 }}>{o.desc}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Main page ───────────────────────────────────────────────────────────────
export default function Home() {
  const [state, setState] = useState<AppState>("idle");
  const [result, setResult] = useState<DocResult | null>(null);
  const [error, setError] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [fileList, setFileList] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"readme" | "api">("readme");
  const [docStyle, setDocStyle] = useState("balanced");

  const handleGenerate = useCallback(async (
    mode: "github" | "upload",
    value: string | File[]
  ) => {
    setError(""); setResult(null); setFileList([]);

    try {
      let files: any[] = [];

      setState("fetching"); setProgress(15);

      if (mode === "github") {
        const res = await fetch("/api/github", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ repoUrl: value as string }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        files = data.files;
        setFileList(files.map((f: any) => f.path));
      }

      setProgress(35);
      setState("generating"); setProgress(50);

      let res: Response;
      if (mode === "github") {
        res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ files, docStyle }),
        });
      } else {
        const formData = new FormData();
        (value as File[]).forEach(f => {
          if (f.name.endsWith(".zip")) formData.append("zip", f);
          else formData.append("files", f);
        });
        formData.append("docStyle", docStyle);
        res = await fetch("/api/generate", { method: "POST", body: formData });
      }

      setProgress(85);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (mode === "upload" && data.files) {
        setFileList((data.files as any[]).map(f => f.path));
      }

      setProgress(100);
      setResult(data);
      setState("done");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setState("error");
      setProgress(0);
    }
  }, [docStyle]);

  const reset = () => {
    setState("idle"); setResult(null);
    setFileList([]); setProgress(0);
  };

  // ── shared header
  const header = (
    <header style={{
      borderBottom: "1px solid var(--border)",
      background: "var(--surface)",
      position: "relative", zIndex: 10,
    }}>
      <Ticker />
      <div style={{
        padding: "0.75rem 2rem",
        display: "flex", alignItems: "center", gap: "1rem",
      }}>
        <div style={{
          width: 34, height: 34,
          border: "2px solid var(--accent)",
          display: "flex", alignItems: "center",
          justifyContent: "center",
          fontSize: 18, color: "var(--accent)", flexShrink: 0,
        }}>✦</div>
        <div>
          <div style={{
            fontFamily: "var(--mono)", fontWeight: 700,
            fontSize: 15, letterSpacing: "0.08em",
          }}>
            NUT<span style={{ color: "var(--accent)" }}>CRACK</span>ER
          </div>
          <div style={{ fontSize: 9, color: "var(--muted)", letterSpacing: "0.1em" }}>
            AUTO-DOC SYSTEM v2.0
          </div>
        </div>
      </div>
    </header>
  );

  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative" }}>
      {header}

      <div style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative", zIndex: 1 }}>

        {/* ── IDLE / ERROR ── */}
        {(state === "idle" || state === "error") && (
          <div style={{ maxWidth: 620, margin: "3rem auto", padding: "0 1.5rem", width: "100%" }}>
            <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
              <div style={{
                fontSize: 9, color: "var(--muted)",
                letterSpacing: "0.18em", marginBottom: "1rem",
                animation: "blink 2s step-end infinite",
              }}>
                ◈ SYSTEM READY ◈
              </div>
              <h1 style={{
                fontSize: "2.1rem", fontWeight: 700,
                letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: "1rem",
              }}>
                PASTE A REPO.<br />
                <span style={{ color: "var(--accent)" }}>GET PERFECT DOCS.</span>
              </h1>
              <p style={{ color: "var(--muted)", fontSize: 12, lineHeight: 1.7, letterSpacing: "0.03em" }}>
                DROP A GITHUB URL OR UPLOAD YOUR CODE FILES. NUTCRACKER READS EVERY FILE
                AND WRITES A README + FULL API REFERENCE AUTOMATICALLY.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <InputForm onGenerate={handleGenerate} />
              <StyleSelector selected={docStyle} onSelect={setDocStyle} />
            </div>

            {state === "error" && (
              <div style={{
                marginTop: "1.25rem", padding: "0.875rem 1rem",
                background: "rgba(201,92,26,0.08)",
                border: "1px solid rgba(201,92,26,0.3)",
                color: "var(--rust)", fontSize: 12, letterSpacing: "0.04em",
              }}>
                ▲ ERROR: {error}
              </div>
            )}

            <div style={{
              display: "flex", gap: 6, justifyContent: "center",
              marginTop: "2.5rem", flexWrap: "wrap",
            }}>
              {["README.MD","API DOCS","FUNCTION REFS","TECH STACK","USAGE EXAMPLES","PROJECT STRUCTURE"].map(f => (
                <span key={f} style={{
                  fontSize: 9, padding: "3px 8px",
                  border: "1px solid var(--border)", color: "var(--muted)",
                  letterSpacing: "0.08em",
                }}>{f}</span>
              ))}
            </div>
          </div>
        )}

        {/* ── LOADING ── */}
        {(state === "fetching" || state === "generating") && (
          <div style={{
            maxWidth: 520, margin: "4rem auto",
            padding: "0 1.5rem", width: "100%", textAlign: "center",
          }}>
            <div style={{
              fontSize: 9, color: "var(--accent)",
              letterSpacing: "0.18em", marginBottom: "1.25rem",
              animation: "blink 1s step-end infinite",
            }}>
              {state === "fetching" ? "◈ FETCHING REPOSITORY..." : "◈ GENERATING DOCUMENTATION..."}
            </div>
            <h2 style={{ fontSize: "1.15rem", fontWeight: 700, marginBottom: "0.4rem", letterSpacing: "0.05em" }}>
              {state === "fetching" ? "READING CODEBASE" : "AI ANALYSIS IN PROGRESS"}
            </h2>
            <p style={{ color: "var(--muted)", marginBottom: "1.75rem", fontSize: 11, letterSpacing: "0.05em" }}>
              {state === "fetching"
                ? "SCANNING REPOSITORY FILES — THIS TAKES A FEW SECONDS"
                : "WRITING DOCS — USUALLY 20–40 SECONDS"}
            </p>

            <BlockLoader value={progress} />
            <div style={{ marginTop: "1rem" }}>
              <ProgressBar value={progress} />
            </div>

            {fileList.length > 0 && (
              <div style={{ marginTop: "1.75rem", textAlign: "left" }}>
                <div style={{ fontSize: 9, color: "var(--muted)", letterSpacing: "0.12em", marginBottom: 6 }}>
                  FILES DETECTED
                </div>
                <FileTree files={fileList} />
              </div>
            )}
          </div>
        )}

        {/* ── DONE ── */}
        {state === "done" && result && (
          <div style={{ display: "flex", flex: 1, height: "calc(100vh - 90px)" }}>

            {/* Sidebar */}
            <aside style={{
              width: 240, borderRight: "1px solid var(--border)",
              padding: "1rem", overflowY: "auto",
              background: "var(--surface)",
              display: "flex", flexDirection: "column",
              gap: "1rem", flexShrink: 0,
            }}>
              <div style={{
                padding: "0.75rem", background: "var(--surface2)",
                border: "1px solid var(--border)",
              }}>
                <div style={{ fontSize: 9, color: "var(--accent)", letterSpacing: "0.1em", marginBottom: 4 }}>
                  PROJECT
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 2 }}>
                  {result.overview.projectName}
                </div>
                <div style={{ fontSize: 9, color: "var(--muted)", marginBottom: "0.5rem", letterSpacing: "0.06em" }}>
                  {result.overview.projectType}
                </div>
                <div style={{ fontSize: 11, color: "rgba(232,237,242,0.65)", lineHeight: 1.6 }}>
                  {result.overview.description}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {[
                  { label: "FILES",    value: result.fileCount },
                  { label: "SECTIONS", value: "FULL" },
                ].map(s => (
                  <div key={s.label} style={{
                    padding: "0.6rem", background: "var(--surface2)",
                    border: "1px solid var(--border)",
                  }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "var(--accent)" }}>{s.value}</div>
                    <div style={{ fontSize: 9, color: "var(--muted)", letterSpacing: "0.08em" }}>{s.label}</div>
                  </div>
                ))}
              </div>

              <div>
                <div style={{ fontSize: 9, color: "var(--muted)", marginBottom: 6, letterSpacing: "0.1em" }}>
                  TECH STACK
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {result.overview.techStack.map(t => (
                    <span key={t} style={{
                      fontSize: 10, padding: "2px 6px",
                      background: "rgba(201,92,26,0.1)",
                      border: "1px solid rgba(201,92,26,0.3)",
                      color: "var(--rust)",
                    }}>{t}</span>
                  ))}
                </div>
              </div>

              {result.overview.mainFeatures?.length > 0 && (
                <div>
                  <div style={{ fontSize: 9, color: "var(--muted)", marginBottom: 6, letterSpacing: "0.1em" }}>
                    FEATURES
                  </div>
                  {result.overview.mainFeatures.slice(0, 5).map((f, i) => (
                    <div key={i} style={{ fontSize: 10, color: "rgba(232,237,242,0.65)", padding: "2px 0" }}>
                      <span style={{ color: "var(--slate)" }}>▸ </span>{f}
                    </div>
                  ))}
                </div>
              )}

              {fileList.length > 0 && (
                <div>
                  <div style={{ fontSize: 9, color: "var(--muted)", marginBottom: 6, letterSpacing: "0.1em" }}>
                    FILES ANALYZED
                  </div>
                  <FileTree files={fileList} compact />
                </div>
              )}

              <button
                onClick={reset}
                style={{
                  marginTop: "auto", padding: "0.5rem",
                  border: "1px solid var(--border)", background: "transparent",
                  color: "var(--muted)", cursor: "pointer",
                  fontSize: 10, letterSpacing: "0.1em",
                  width: "100%", fontFamily: "var(--mono)",
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--accent)";
                  (e.currentTarget as HTMLButtonElement).style.color = "var(--accent)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
                  (e.currentTarget as HTMLButtonElement).style.color = "var(--muted)";
                }}
              >
                ← NEW GENERATION
              </button>
            </aside>

            {/* Main content */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
              <div style={{
                display: "flex", borderBottom: "1px solid var(--border)",
                padding: "0 1.5rem", background: "var(--surface)",
                gap: 0, alignItems: "center",
              }}>
                {(["readme", "api"] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      padding: "0.7rem 1rem",
                      background: "transparent", border: "none",
                      borderBottom: activeTab === tab
                        ? "2px solid var(--accent)"
                        : "2px solid transparent",
                      color: activeTab === tab ? "var(--accent)" : "var(--muted)",
                      cursor: "pointer", fontSize: 10,
                      fontFamily: "var(--mono)", letterSpacing: "0.1em",
                      marginBottom: -1, transition: "all 0.15s",
                    }}
                  >
                    {tab === "readme" ? "README.MD" : "API REFERENCE"}
                  </button>
                ))}
                <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                  <DownloadButton
                    content={activeTab === "readme" ? result.readme : result.apiDocs}
                    filename={activeTab === "readme" ? "README.md" : "API_REFERENCE.md"}
                  />
                  <DownloadButton
                    content={result.readme + "\n\n---\n\n" + result.apiDocs}
                    filename="FULL_DOCS.md"
                    label="DOWNLOAD ALL"
                  />
                </div>
              </div>

              <div style={{ flex: 1, overflow: "auto", padding: "2rem 2.5rem" }}>
                <DocPreview content={activeTab === "readme" ? result.readme : result.apiDocs} />
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}