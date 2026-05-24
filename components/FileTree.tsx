"use client";

interface Props {
  files: string[];
  compact?: boolean;
}

function getIcon(path: string): string {
  if (path.endsWith(".ts") || path.endsWith(".tsx")) return "🔷";
  if (path.endsWith(".js") || path.endsWith(".jsx")) return "🟡";
  if (path.endsWith(".py")) return "🐍";
  if (path.endsWith(".go")) return "🔵";
  if (path.endsWith(".md")) return "📄";
  if (path.endsWith(".json")) return "📋";
  if (path.endsWith(".yaml") || path.endsWith(".yml")) return "⚙️";
  return "📄";
}

export default function FileTree({ files, compact = false }: Props) {
  const display = compact ? files.slice(0, 12) : files;

  return (
    <div style={{
      background: "var(--surface2)", borderRadius: 8,
      border: "1px solid var(--border)", overflow: "hidden"
    }}>
      {display.map((f, i) => (
        <div key={f} style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: compact ? "4px 10px" : "6px 12px",
          borderBottom: i < display.length - 1 ? "1px solid var(--border)" : "none",
          fontSize: compact ? 11 : 12, fontFamily: "var(--mono)",
          color: "var(--muted)"
        }}>
          <span style={{ fontSize: compact ? 10 : 12 }}>{getIcon(f)}</span>
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {f}
          </span>
        </div>
      ))}
      {compact && files.length > 12 && (
        <div style={{
          padding: "4px 10px", fontSize: 11, color: "var(--muted)",
          fontFamily: "var(--mono)", textAlign: "center"
        }}>
          +{files.length - 12} more files
        </div>
      )}
    </div>
  );
}
