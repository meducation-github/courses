import React from "react";

const MarkdownRenderer = ({ content }) => {
  if (!content) return null;

  // Simple markdown to JSX converter
  const renderMarkdown = (text) => {
    if (!text) return "";

    // Split into lines for processing
    const lines = text.split("\n");
    const elements = [];
    let currentList = [];
    let inList = false;

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();

      // Headers
      if (trimmedLine.startsWith("### ")) {
        if (inList && currentList.length > 0) {
          elements.push(
            <ul
              key={`list-${index}`}
              className="list-disc list-inside mb-4 space-y-1"
            >
              {currentList}
            </ul>
          );
          currentList = [];
          inList = false;
        }
        elements.push(
          <h3 key={index} className="text-lg font-semibold text-gray-900 mb-3">
            {trimmedLine.substring(4)}
          </h3>
        );
      } else if (trimmedLine.startsWith("## ")) {
        if (inList && currentList.length > 0) {
          elements.push(
            <ul
              key={`list-${index}`}
              className="list-disc list-inside mb-4 space-y-1"
            >
              {currentList}
            </ul>
          );
          currentList = [];
          inList = false;
        }
        elements.push(
          <h2 key={index} className="text-xl font-bold text-gray-900 mb-4">
            {trimmedLine.substring(3)}
          </h2>
        );
      } else if (trimmedLine.startsWith("# ")) {
        if (inList && currentList.length > 0) {
          elements.push(
            <ul
              key={`list-${index}`}
              className="list-disc list-inside mb-4 space-y-1"
            >
              {currentList}
            </ul>
          );
          currentList = [];
          inList = false;
        }
        elements.push(
          <h1 key={index} className="text-2xl font-bold text-gray-900 mb-4">
            {trimmedLine.substring(2)}
          </h1>
        );
      }
      // Lists
      else if (trimmedLine.startsWith("- ") || trimmedLine.startsWith("* ")) {
        if (!inList) {
          inList = true;
        }
        currentList.push(
          <li key={`list-item-${index}`} className="text-gray-700">
            {processInlineMarkdown(trimmedLine.substring(2))}
          </li>
        );
      }
      // Numbered lists
      else if (/^\d+\.\s/.test(trimmedLine)) {
        if (!inList) {
          inList = true;
        }
        currentList.push(
          <li key={`list-item-${index}`} className="text-gray-700">
            {processInlineMarkdown(trimmedLine.replace(/^\d+\.\s/, ""))}
          </li>
        );
      }
      // Empty lines
      else if (trimmedLine === "") {
        if (inList && currentList.length > 0) {
          elements.push(
            <ul
              key={`list-${index}`}
              className="list-disc list-inside mb-4 space-y-1"
            >
              {currentList}
            </ul>
          );
          currentList = [];
          inList = false;
        } else {
          elements.push(<div key={index} className="mb-2"></div>);
        }
      }
      // Regular paragraphs
      else {
        if (inList && currentList.length > 0) {
          elements.push(
            <ul
              key={`list-${index}`}
              className="list-disc list-inside mb-4 space-y-1"
            >
              {currentList}
            </ul>
          );
          currentList = [];
          inList = false;
        }
        elements.push(
          <p key={index} className="text-gray-700 mb-3 leading-relaxed">
            {processInlineMarkdown(trimmedLine)}
          </p>
        );
      }
    });

    // Handle any remaining list items
    if (inList && currentList.length > 0) {
      elements.push(
        <ul key="final-list" className="list-disc list-inside mb-4 space-y-1">
          {currentList}
        </ul>
      );
    }

    return elements;
  };

  // Process inline markdown (bold, italic, code)
  const processInlineMarkdown = (text) => {
    if (!text) return "";

    // Bold text
    text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    // Italic text
    text = text.replace(/\*(.*?)\*/g, "<em>$1</em>");

    // Inline code
    text = text.replace(
      /`(.*?)`/g,
      '<code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>'
    );

    // Links
    text = text.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" className="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">$1</a>'
    );

    return <span dangerouslySetInnerHTML={{ __html: text }} />;
  };

  return (
    <div className="prose prose-gray max-w-none">{renderMarkdown(content)}</div>
  );
};

export default MarkdownRenderer;
