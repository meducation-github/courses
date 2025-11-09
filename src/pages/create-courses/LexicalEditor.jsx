import React from "react";
import "./LexicalEditor.css";

// Simple Markdown Textarea Component
const LexicalEditor = ({
  value = "",
  onChange,
  placeholder = "Start writing...",
}) => {
  const handleChange = (e) => {
    onChange?.(e.target.value);
  };

  return (
    <div className="lexical-editor">
      <div className="editor-container">
        <div className="editor-content">
          <textarea
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            className="markdown-textarea"
          />
        </div>
      </div>
    </div>
  );
};

export default LexicalEditor;
