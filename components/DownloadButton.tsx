"use client";

interface Props {
  content: string;
  filename: string;
  label?: string;
}

export default function DownloadButton({ content, filename, label }: Props) {
  const handleDownload = () => {
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleDownload}
      style={{
        padding: "0.5rem 1rem", borderRadius: 8,
        border: "1px solid var(--border)", background: "var(--surface2)",
        color: "var(--text)", cursor: "pointer", fontSize: 13,
        fontFamily: "var(--sans)", display: "flex", alignItems: "center", gap: 6
      }}
    >
      ⬇ {label || filename}
    </button>
  );
}
