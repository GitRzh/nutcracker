"use client";

interface Props { value: number; }

export default function ProgressBar({ value }: Props) {
  return (
    <div style={{ width: "100%" }}>
      <div style={{
        height: 4, background: "var(--surface2)", borderRadius: 2, overflow: "hidden"
      }}>
        <div style={{
          height: "100%", width: `${value}%`,
          background: "linear-gradient(90deg, var(--accent), var(--accent2))",
          borderRadius: 2, transition: "width 0.5s ease"
        }} />
      </div>
      <div style={{
        marginTop: 8, fontSize: 12, color: "var(--muted)",
        fontFamily: "var(--mono)", textAlign: "right"
      }}>
        {value}%
      </div>
    </div>
  );
}
