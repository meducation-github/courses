# Markdown Storage Rich Text Editor

A WYSIWYG rich text editor that stores content as clean markdown while providing a visual editing experience without showing markdown syntax to users.

## How It Works

### 🎯 **User Experience**

- **Visual Editing**: Users see a rich text editor with formatting buttons
- **No Markdown Syntax**: Users don't see `**bold**`, `# headers`, or `- lists`
- **WYSIWYG**: What you see is what you get - formatted text appears as formatted
- **Easy Editing**: Click buttons or use keyboard shortcuts for formatting

### 💾 **Backend Storage**

- **Clean Markdown**: Content is stored as pure markdown without HTML tags
- **No HTML**: No `<strong>`, `<h1>`, or other HTML tags in the database
- **Readable**: Markdown is human-readable and portable
- **Lightweight**: Smaller storage footprint than HTML

## Example

### What User Sees (WYSIWYG Editor):

```
# Introduction to React
This is a **bold** statement and this is *italic* text.

## Key Features
- Component-based architecture
- Virtual DOM
- One-way data flow

> This is a blockquote for important information.
```

### What Gets Stored in Database:

```markdown
# Introduction to React

This is a **bold** statement and this is _italic_ text.

## Key Features

- Component-based architecture
- Virtual DOM
- One-way data flow

> This is a blockquote for important information.
```

### What User Sees When Viewing:

```
# Introduction to React
This is a bold statement and this is italic text.

## Key Features
- Component-based architecture
- Virtual DOM
- One-way data flow

> This is a blockquote for important information.
```

## Technical Implementation

### 🔄 **Conversion Process**

1. **Input**: User types and formats text in the WYSIWYG editor
2. **Internal**: Tiptap converts formatting to HTML internally
3. **Conversion**: Turndown service converts HTML to markdown
4. **Storage**: Clean markdown is saved to Supabase
5. **Display**: MarkdownRenderer converts markdown back to HTML for viewing

### 📝 **Supported Markdown Features**

- **Headers**: `# H1`, `## H2`, `### H3`
- **Bold**: `**bold text**`
- **Italic**: `*italic text*`
- **Code**: `` `inline code` ``
- **Links**: `[text](url)`
- **Lists**: `- bullet` and `1. numbered`
- **Blockquotes**: `> quoted text`

### 🎨 **Editor Features**

- **Toolbar Buttons**: Visual formatting buttons
- **Keyboard Shortcuts**: Ctrl+B, Ctrl+I, Ctrl+1, etc.
- **Real-time Preview**: See formatting as you type
- **Undo/Redo**: Full history support
- **Link Dialog**: Easy link insertion

## Database Schema

Content is stored in the `main_description` field as TEXT:

```sql
-- Units table
CREATE TABLE units (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  main_description TEXT, -- Stores markdown
  -- other fields...
);

-- Topics table
CREATE TABLE topics (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  main_description TEXT, -- Stores markdown
  -- other fields...
);

-- Subtopics table
CREATE TABLE subtopics (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  main_description TEXT, -- Stores markdown
  -- other fields...
);
```

## Benefits

### ✅ **For Users**

- **Easy Editing**: No need to learn markdown syntax
- **Visual Feedback**: See formatting immediately
- **Familiar Interface**: Works like Google Docs or Word
- **Keyboard Shortcuts**: Power user features

### ✅ **For Developers**

- **Clean Storage**: No HTML tags cluttering the database
- **Portable**: Markdown can be used anywhere
- **Lightweight**: Smaller storage than HTML
- **Readable**: Easy to debug and maintain

### ✅ **For System**

- **Performance**: Faster rendering than HTML parsing
- **Security**: No XSS risks from HTML content
- **Compatibility**: Works with any markdown renderer
- **Future-proof**: Easy to migrate or change renderers

## Usage Examples

### Creating Content

```jsx
<SimpleRichTextEditor
  value={markdownContent}
  onChange={setMarkdownContent}
  placeholder="Start writing your description..."
/>
```

### Displaying Content

```jsx
<MarkdownRenderer content={markdownContent} />
```

### Database Operations

```javascript
// Save markdown to database
await supabase
  .from("units")
  .update({ main_description: markdownContent })
  .eq("id", unitId);

// Retrieve markdown from database
const { data } = await supabase
  .from("units")
  .select("main_description")
  .eq("id", unitId);

const markdownContent = data.main_description;
```

## Migration from HTML

If you have existing HTML content, you can convert it:

```javascript
import TurndownService from "turndown";

const turndownService = new TurndownService();
const markdown = turndownService.turndown(htmlContent);
```

## Troubleshooting

### Common Issues

1. **Content Not Saving**: Check that `onChange` is being called
2. **Formatting Lost**: Verify TurndownService configuration
3. **Display Issues**: Ensure MarkdownRenderer is working correctly
4. **Import Errors**: Make sure TurndownService is installed

### Debug Tips

1. **Check Console**: Look for conversion errors
2. **Inspect Database**: Verify markdown is being stored correctly
3. **Test Renderer**: Ensure MarkdownRenderer displays content properly
4. **Validate Markdown**: Use online markdown validators

## Future Enhancements

Potential improvements:

- **Table Support**: Add markdown table editing
- **Image Upload**: Direct image insertion with markdown links
- **Code Blocks**: Syntax highlighting for code blocks
- **Export Options**: Export to PDF, Word, etc.
- **Collaborative Editing**: Real-time collaboration features

