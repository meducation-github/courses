import React, { useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TurndownService from "turndown";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Link as LinkIcon,
  Heading1,
  Heading2,
  Heading3,
  Code,
  Quote,
  Undo,
  Redo,
} from "lucide-react";
import "./RichTextEditor.css";

const SimpleRichTextEditor = ({
  value = "",
  onChange,
  placeholder = "Start writing your description...",
  className = "",
}) => {
  // Initialize Turndown service for HTML to Markdown conversion
  const turndownService = new TurndownService({
    headingStyle: "atx",
    bulletListMarker: "-",
    codeBlockStyle: "fenced",
    emDelimiter: "*",
    strongDelimiter: "**",
  });

  // Convert markdown to HTML for display in editor
  const markdownToHtml = (markdown) => {
    if (!markdown) return "";

    return markdown
      .replace(/^### (.*$)/gim, "<h3>$1</h3>")
      .replace(/^## (.*$)/gim, "<h2>$1</h2>")
      .replace(/^# (.*$)/gim, "<h1>$1</h1>")
      .replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/gim, "<em>$1</em>")
      .replace(/`(.*?)`/gim, "<code>$1</code>")
      .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2">$1</a>')
      .replace(/^- (.*$)/gim, "<li>$1</li>")
      .replace(/^\d+\. (.*$)/gim, "<li>$1</li>")
      .replace(/(<li>.*<\/li>)/s, "<ul>$1</ul>")
      .replace(/^> (.*$)/gim, "<blockquote>$1</blockquote>")
      .replace(/\n\n/g, "</p><p>")
      .replace(/\n/g, "<br>")
      .replace(/^(.*)$/gim, "<p>$1</p>");
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 hover:text-blue-800 underline",
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: markdownToHtml(value),
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const markdown = turndownService.turndown(html);
      onChange(markdown);
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px] p-4",
      },
    },
  });

  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    if (url === null) {
      return;
    }

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  if (!editor) {
    return null;
  }

  const ToolbarButton = ({
    onClick,
    isActive,
    icon: Icon,
    title,
    shortcut,
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={`${title} ${shortcut ? `(${shortcut})` : ""}`}
      className={`p-2 rounded-md transition-colors ${
        isActive
          ? "bg-blue-100 text-blue-700"
          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
      }`}
    >
      <Icon className="w-4 h-4" />
    </button>
  );

  return (
    <div
      className={`rich-text-editor border border-gray-300 rounded-lg overflow-hidden ${className}`}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between bg-gray-50 border-b border-gray-200 px-3 py-2">
        <div className="flex items-center space-x-1 flex-wrap">
          {/* Text Formatting */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive("bold")}
            icon={Bold}
            title="Bold"
            shortcut="Ctrl+B"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive("italic")}
            icon={Italic}
            title="Italic"
            shortcut="Ctrl+I"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            isActive={editor.isActive("code")}
            icon={Code}
            title="Code"
            shortcut="Ctrl+E"
          />

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* Headings */}
          <ToolbarButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            isActive={editor.isActive("heading", { level: 1 })}
            icon={Heading1}
            title="Heading 1"
            shortcut="Ctrl+1"
          />
          <ToolbarButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            isActive={editor.isActive("heading", { level: 2 })}
            icon={Heading2}
            title="Heading 2"
            shortcut="Ctrl+2"
          />
          <ToolbarButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            isActive={editor.isActive("heading", { level: 3 })}
            icon={Heading3}
            title="Heading 3"
            shortcut="Ctrl+3"
          />

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* Lists */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive("bulletList")}
            icon={List}
            title="Bullet List"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive("orderedList")}
            icon={ListOrdered}
            title="Numbered List"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive("blockquote")}
            icon={Quote}
            title="Quote"
          />

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* Links */}
          <ToolbarButton
            onClick={setLink}
            isActive={editor.isActive("link")}
            icon={LinkIcon}
            title="Link"
            shortcut="Ctrl+K"
          />

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* History */}
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            icon={Undo}
            title="Undo"
            shortcut="Ctrl+Z"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            icon={Redo}
            title="Redo"
            shortcut="Ctrl+Y"
          />
        </div>
      </div>

      {/* Editor Content */}
      <div className="relative">
        <EditorContent editor={editor} />
      </div>

      {/* Footer */}
      <div className="bg-gray-50 border-t border-gray-200 px-3 py-2 text-xs text-gray-500 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <span>Rich text editor - stores clean markdown</span>
        </div>
        <div className="text-gray-400">
          Use{" "}
          <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Ctrl+B</kbd>{" "}
          for bold,
          <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs ml-1">
            Ctrl+I
          </kbd>{" "}
          for italic
        </div>
      </div>
    </div>
  );
};

export default SimpleRichTextEditor;
