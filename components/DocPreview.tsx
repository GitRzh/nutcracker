"use client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Props {
  content: string;
}

export default function DocPreview({ content }: Props) {
  if (!content) return null;

  return (
    <article className="prose" style={{ maxWidth: 860, margin: "0 auto" }}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </article>
  );
}