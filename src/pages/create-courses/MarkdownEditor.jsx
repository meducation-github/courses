import React, { useState, useRef, useEffect } from "react";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Link,
  Heading1,
  Heading2,
  Heading3,
  Eye,
  Edit3,
  Type,
} from "lucide-react";
import MarkdownRenderer from "./MarkdownRenderer";
import "./MarkdownEditor.css";

const MarkdownEditor = ({
  value = "",
  onChange,
  placeholder = "Start writing your description...",
  className = "",
  rows = 8,
  autoSave = false,
  onAutoSave = null,
}) => {
  const [isPreview, setIsPreview] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const textareaRef = useRef(null);
  const autoSaveTimeoutRef = useRef(null);

  // Auto-save functionality
  useEffect(() => {
    if (autoSave && onAutoSave && value) {
      // Clear existing timeout
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }

      // Set new timeout for auto-save
      autoSaveTimeoutRef.current = setTimeout(async () => {
        setIsAutoSaving(true);
        try {
          await onAutoSave(value);
        } finally {
          setIsAutoSaving(false);
        }
      }, 2000); // Auto-save after 2 seconds of inactivity
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [value, autoSave, onAutoSave]);

  // Insert text at cursor position
  const insertText = (before, after = "", placeholder = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const textToInsert = selectedText || placeholder;

    const newText =
      value.substring(0, start) +
      before +
      textToInsert +
      after +
      value.substring(end);
    onChange(newText);

    // Set cursor position after insertion
    setTimeout(() => {
      const newCursorPos = start + before.length + textToInsert.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
    }, 0);
  };

  // Toolbar actions
  const makeBold = () => insertText("**", "**", "bold text");
  const makeItalic = () => insertText("*", "*", "italic text");
  const makeHeading1 = () => insertText("# ", "", "Heading 1");
  const makeHeading2 = () => insertText("## ", "", "Heading 2");
  const makeHeading3 = () => insertText("### ", "", "Heading 3");
  const makeBulletList = () => insertText("- ", "", "List item");
  const makeNumberedList = () => insertText("1. ", "", "List item");
  const makeLink = () => insertText("[", "](url)", "link text");

  // Handle keyboard shortcuts
  const handleKeyDown = (e) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case "b":
          e.preventDefault();
          makeBold();
          break;
        case "i":
          e.preventDefault();
          makeItalic();
          break;
        case "k":
          e.preventDefault();
          makeLink();
          break;
        case "1":
          e.preventDefault();
          makeHeading1();
          break;
        case "2":
          e.preventDefault();
          makeHeading2();
          break;
        case "3":
          e.preventDefault();
          makeHeading3();
          break;
        default:
          break;
      }
    }
  };

  const ToolbarButton = ({ onClick, icon: Icon, title, shortcut }) => (
    <button
      type="button"
      onClick={onClick}
      title={`${title} ${shortcut ? `(${shortcut})` : ""}`}
      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
    >
      <Icon className="w-4 h-4" />
    </button>
  );

  return (
    <div
      className={`markdown-editor border border-gray-300 rounded-lg overflow-hidden ${className}`}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between bg-gray-50 border-b border-gray-200 px-3 py-2">
        <div className="flex items-center space-x-1">
          <ToolbarButton
            onClick={makeBold}
            icon={Bold}
            title="Bold"
            shortcut="Ctrl+B"
          />
          <ToolbarButton
            onClick={makeItalic}
            icon={Italic}
            title="Italic"
            shortcut="Ctrl+I"
          />
          <div className="w-px h-6 bg-gray-300 mx-1" />
          <ToolbarButton
            onClick={makeHeading1}
            icon={Heading1}
            title="Heading 1"
            shortcut="Ctrl+1"
          />
          <ToolbarButton
            onClick={makeHeading2}
            icon={Heading2}
            title="Heading 2"
            shortcut="Ctrl+2"
          />
          <ToolbarButton
            onClick={makeHeading3}
            icon={Heading3}
            title="Heading 3"
            shortcut="Ctrl+3"
          />
          <div className="w-px h-6 bg-gray-300 mx-1" />
          <ToolbarButton
            onClick={makeBulletList}
            icon={List}
            title="Bullet List"
          />
          <ToolbarButton
            onClick={makeNumberedList}
            icon={ListOrdered}
            title="Numbered List"
          />
          <div className="w-px h-6 bg-gray-300 mx-1" />
          <ToolbarButton
            onClick={makeLink}
            icon={Link}
            title="Link"
            shortcut="Ctrl+K"
          />
        </div>

        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={() => setIsPreview(false)}
            className={`p-2 rounded-md transition-colors ${
              !isPreview
                ? "bg-blue-100 text-blue-700"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
            title="Edit Mode"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsPreview(true)}
            className={`p-2 rounded-md transition-colors ${
              isPreview
                ? "bg-blue-100 text-blue-700"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
            title="Preview Mode"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="relative">
        {isPreview ? (
          <div className="p-4 min-h-[200px] bg-white preview-content">
            {value ? (
              <MarkdownRenderer content={value} />
            ) : (
              <div className="text-gray-500 text-center py-8">
                <Type className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>No content to preview</p>
              </div>
            )}
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full p-4 border-0 resize-none focus:ring-0 focus:outline-none font-mono text-sm leading-relaxed"
            style={{ minHeight: `${rows * 1.5}rem` }}
            rows={rows}
          />
        )}
      </div>

      {/* Footer with character count and help */}
      <div className="bg-gray-50 border-t border-gray-200 px-3 py-2 text-xs text-gray-500 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <span
            className={`char-count ${
              value.length > 2000
                ? "danger"
                : value.length > 1500
                ? "warning"
                : ""
            }`}
          >
            {value.length} characters
          </span>
          <span>•</span>
          <span>Supports Markdown formatting</span>
          {autoSave && isAutoSaving && (
            <>
              <span>•</span>
              <span className="text-blue-600">Auto-saving...</span>
            </>
          )}
        </div>
        {!isPreview && (
          <div className="text-gray-400">
            Use{" "}
            <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">
              Ctrl+B
            </kbd>{" "}
            for bold,
            <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs ml-1">
              Ctrl+I
            </kbd>{" "}
            for italic
          </div>
        )}
      </div>
    </div>
  );
};

export default MarkdownEditor;
