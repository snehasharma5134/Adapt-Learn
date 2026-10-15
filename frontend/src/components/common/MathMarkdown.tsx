import React from 'react';
import katex from 'katex';

interface MathMarkdownProps {
  content: string;
  className?: string;
}

export const MathMarkdown: React.FC<MathMarkdownProps> = ({ content, className = '' }) => {
  // Simple, robust parser for KaTeX formulas and standard Markdown
  const renderFormatted = (text: string) => {
    if (!text) return null;

    // Split by display math $$...$$
    const displayParts = text.split(/(\$\$[\s\S]*?\$\$)/g);

    return displayParts.map((part, index) => {
      if (part.startsWith('$$') && part.endsWith('$$')) {
        const math = part.slice(2, -2).trim();
        try {
          const html = katex.renderToString(math, { displayMode: true, throwOnError: false });
          return (
            <div
              key={index}
              className="my-3 overflow-x-auto text-center"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch {
          return <pre key={index} className="bg-slate-100 p-2 rounded text-sm">{math}</pre>;
        }
      }

      // Split lines for regular markdown formatting
      const lines = part.split('\n');
      return (
        <React.Fragment key={index}>
          {lines.map((line, lIdx) => {
            // Headers
            if (line.startsWith('### ')) {
              return <h3 key={lIdx} className="text-lg font-bold text-inherit mt-3 mb-1">{renderInline(line.slice(4))}</h3>;
            }
            if (line.startsWith('## ')) {
              return <h2 key={lIdx} className="text-xl font-bold text-inherit mt-4 mb-2">{renderInline(line.slice(3))}</h2>;
            }
            if (line.startsWith('# ')) {
              return <h1 key={lIdx} className="text-2xl font-bold text-inherit mt-4 mb-2">{renderInline(line.slice(2))}</h1>;
            }

            // Bullet points
            if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
              return (
                <li key={lIdx} className="ml-5 list-disc my-1 text-inherit">
                  {renderInline(line.trim().slice(2))}
                </li>
              );
            }

            // Numbered list
            const numMatch = line.trim().match(/^(\d+)\.\s+(.*)/);
            if (numMatch) {
              return (
                <div key={lIdx} className="flex gap-2 my-1 text-inherit">
                  <span className="font-semibold text-teal-600">{numMatch[1]}.</span>
                  <span>{renderInline(numMatch[2])}</span>
                </div>
              );
            }

            // Empty line
            if (!line.trim()) {
              return <div key={lIdx} className="h-2" />;
            }

            // Regular paragraph
            return (
              <p key={lIdx} className="my-1.5 leading-relaxed text-inherit">
                {renderInline(line)}
              </p>
            );
          })}
        </React.Fragment>
      );
    });
  };

  const renderInline = (inlineText: string) => {
    // Split by inline math $...$
    const inlineParts = inlineText.split(/(\$[^\$\n]+?\$)/g);

    return inlineParts.map((sub, sIdx) => {
      if (sub.startsWith('$') && sub.endsWith('$') && sub.length > 2) {
        const math = sub.slice(1, -1).trim();
        try {
          const html = katex.renderToString(math, { displayMode: false, throwOnError: false });
          return (
            <span
              key={sIdx}
              className="inline-block mx-0.5"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch {
          return <code key={sIdx} className="text-sm bg-slate-100 px-1 rounded">{math}</code>;
        }
      }

      // Handle bold **text**
      const boldParts = sub.split(/(\*\*[^\*]+?\*\*)/g);
      return boldParts.map((bSub, bIdx) => {
        if (bSub.startsWith('**') && bSub.endsWith('**')) {
          return <strong key={bIdx} className="font-semibold text-slate-900">{bSub.slice(2, -2)}</strong>;
        }
        return bSub;
      });
    });
  };

  return <div className={`math-markdown prose prose-slate max-w-none ${className}`}>{renderFormatted(content)}</div>;
};
