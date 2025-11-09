# Lexical Rich Text Editor Feature

## Overview

The Create Courses component now includes a professional Lexical-based rich text editor that provides a modern, robust editing experience. Lexical is Facebook's open-source rich text editor framework that offers excellent performance, accessibility, and markdown support. The editor allows users to edit content for units, topics, and subtopics with a clean, intuitive interface and automatically converts between rich text and markdown format for storage.

## Features

### Lexical Editor Capabilities

- **Text Formatting**: Bold, italic, underline, strikethrough, code
- **Headings**: H1, H2, H3, H4, H5 with proper hierarchy
- **Lists**: Ordered and unordered lists with nesting support
- **Blockquotes**: Quote formatting with visual styling
- **Code**: Inline code and code blocks with syntax highlighting
- **Links**: Insert and edit links with URL validation
- **Markdown Shortcuts**: Type markdown syntax for instant formatting
- **History**: Undo/redo functionality
- **Clean Interface**: Modern, professional toolbar design
- **Accessibility**: Built-in accessibility features
- **Performance**: Optimized rendering and editing experience

### Automatic Markdown Conversion

- Content is stored in markdown format in the database
- Rich text editor converts to markdown when saving
- Markdown is converted to rich text when loading content for editing
- Seamless integration with existing markdown rendering
- Support for all standard markdown syntax

## Usage

### For Units, Topics, and Subtopics

1. **Creating New Items**:

   - Fill in the title field
   - Click the "Rich Editor" button next to the description field
   - Use the rich text editor to format your content
   - Click "Save Content" to apply changes

2. **Editing Existing Items**:

   - Click the edit button on any unit, topic, or subtopic
   - Click the "Rich Editor" button next to any description field
   - Modify content using the rich text editor
   - Save changes

3. **Short vs Main Description**:
   - **Short Description**: Brief overview (supports rich text)
   - **Main Description**: Detailed content (supports rich text and markdown)

### Rich Text Editor Interface

- **Toolbar**: Contains formatting buttons for text styling and block elements
- **Editor Area**: Content editing area with real-time formatting
- **Markdown Shortcuts**: Type `# ` for H1, `## ` for H2, `- ` for lists, etc.
- **Save/Cancel**: Apply or discard changes

## Technical Implementation

### Components

- `LexicalEditor.jsx`: Main Lexical-based rich text editor component
- `markdownUtils.js`: Utility functions for markdown conversion
- `LexicalEditor.css`: Professional styling for the editor

### Key Functions

- `convertHtmlToMarkdown()`: Converts HTML to markdown
- `convertMarkdownToHtml()`: Converts markdown to HTML
- `openRichTextEditor()`: Opens the rich text editor modal
- `saveRichTextContent()`: Saves content and converts to markdown

### State Management

- `showRichTextEditor`: Controls modal visibility
- `richTextContent`: Current editor content
- `richTextType`: Field being edited (short_description/main_description)
- `richTextForm`: Form type (unit/topic/subtopic)

## File Structure

```
src/pages/create-courses/
├── index.jsx                 # Main component with Lexical integration
├── LexicalEditor.jsx         # Lexical-based rich text editor component
├── LexicalEditor.css         # Professional editor styles
├── markdownUtils.js          # Markdown conversion utilities
└── README.md                 # This documentation
```

## Browser Compatibility

Lexical is built with modern web standards and provides excellent browser compatibility. It works in all modern browsers and provides a consistent editing experience across different platforms.

## Dependencies

The Lexical editor requires the following packages:

- `lexical` - Core Lexical framework
- `@lexical/react` - React integration
- `@lexical/rich-text` - Rich text editing capabilities
- `@lexical/list` - List support
- `@lexical/heading` - Heading support
- `@lexical/quote` - Quote support
- `@lexical/code` - Code block support
- `@lexical/link` - Link support
- `@lexical/markdown` - Markdown conversion
- `@lexical/html` - HTML conversion
- `@lexical/selection` - Selection handling
- `@lexical/utils` - Utility functions

## Markdown Shortcuts

Lexical supports markdown shortcuts for quick formatting:

- `# ` → Heading 1
- `## ` → Heading 2
- `### ` → Heading 3
- `- ` → Bullet list
- `1. ` → Numbered list
- `> ` → Quote
- `\`code\`` → Inline code
- `**text**` → Bold
- `*text*` → Italic
- `[text](url)` → Link

## Future Enhancements

- Add support for tables
- Include more text formatting options
- Add file upload for images
- Implement collaborative editing
- Add spell check functionality
- Include more markdown features
- Add custom block types
- Implement plugins system

## Troubleshooting

### Common Issues

1. **Content not saving**: Ensure you click "Save Content" in the rich text editor modal
2. **Formatting lost**: Check that the markdown conversion is working properly
3. **Editor not opening**: Verify that all required components are imported

### Debug Tips

- Check browser console for JavaScript errors
- Verify that the markdown conversion functions are working
- Ensure the modal state is properly managed
- Check that the content is being passed correctly between components

## Why Lexical?

Lexical was chosen over other editors for several reasons:

1. **Performance**: Built with performance in mind, providing smooth editing experience
2. **Accessibility**: Excellent accessibility features out of the box
3. **Markdown Support**: Native markdown support with shortcuts
4. **Modern Architecture**: Built with modern web standards
5. **Facebook Backing**: Developed and maintained by Facebook
6. **Active Development**: Regular updates and improvements
7. **TypeScript Support**: Full TypeScript support for better development experience
8. **Plugin System**: Extensible architecture for custom features
