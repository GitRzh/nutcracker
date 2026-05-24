"use client";
import ReactMarkdown from "react-markdown";

interface Props {
  content: string;
}

export default function DocPreview({ content }: Props) {
  if (!content) return null;

  return (
    <article className="prose" style={{ maxWidth: 860, margin: "0 auto" }}>
      <ReactMarkdown>{content}</ReactMarkdown>
    </article>
  );
}
