# Rich Text Editor Component

A powerful, modern rich text editor built with Tiptap for editing unit, topic, and subtopic descriptions in the course creation system.

## Features

### ✨ Rich Text Formatting

- **Bold text** with toolbar button or Ctrl+B
- _Italic text_ with toolbar button or Ctrl+I
- `Inline code` with toolbar button or Ctrl+E
- Headers (H1, H2, H3) with toolbar buttons or Ctrl+1/2/3
- Bullet lists and numbered lists
- Blockquotes for highlighting important content
- Text alignment (left, center, right, justify)
- Links with URL input dialog
- Images with URL input
- Undo/Redo functionality

### 🎨 Modern WYSIWYG Interface

- Real-time visual editing with immediate formatting feedback
- Clean, intuitive toolbar with icon buttons
- Professional typography and spacing
- Responsive design for all screen sizes
- Smooth animations and transitions
- Custom scrollbars and hover effects

### 🔧 Advanced Features

- **Import/Export**: Import markdown files or export content as markdown
- **Keyboard Shortcuts**: Full keyboard support for power users
- **HTML Output**: Generates clean, semantic HTML
- **Auto-save Ready**: Built-in support for auto-save functionality
- **Accessibility**: Proper ARIA labels and keyboard navigation

## Usage

```jsx
import RichTextEditor from "./RichTextEditor";

<RichTextEditor
  value={description}
  onChange={setDescription}
  placeholder="Start writing your description..."
/>;
```

## Props

| Prop          | Type     | Default              | Description                   |
| ------------- | -------- | -------------------- | ----------------------------- |
| `value`       | string   | `""`                 | The HTML content              |
| `onChange`    | function | -                    | Callback when content changes |
| `placeholder` | string   | `"Start writing..."` | Placeholder text              |
| `className`   | string   | `""`                 | Additional CSS classes        |

## Keyboard Shortcuts

- **Ctrl+B** - Bold text
- **Ctrl+I** - Italic text
- **Ctrl+E** - Inline code
- **Ctrl+K** - Insert link
- **Ctrl+1** - Heading 1
- **Ctrl+2** - Heading 2
- **Ctrl+3** - Heading 3
- **Ctrl+Z** - Undo
- **Ctrl+Y** - Redo

## Toolbar Features

### Text Formatting

- Bold, Italic, Code buttons
- Heading levels (H1, H2, H3)
- Text alignment options

### Lists and Structure

- Bullet lists
- Numbered lists
- Blockquotes

### Media and Links

- Link insertion with URL dialog
- Image insertion with URL input
- Import/Export markdown files

### History

- Undo/Redo functionality

## Import/Export

### Export to Markdown

- Click the download button in the toolbar
- Automatically converts HTML to markdown
- Downloads as `.md` file

### Import from Markdown

- Click the upload button in the toolbar
- Select `.md` or `.txt` files
- Converts markdown to HTML and loads into editor

## Integration

The editor is fully integrated into the course creation system:

- **Replaces** the basic textarea for "Main Description" fields
- **Stores** content as HTML in Supabase `main_description` fields
- **Displays** content using the `HTMLRenderer` component
- **Compatible** with existing AI generation features

## Database Storage

Content is stored as HTML in the `main_description` field of:

- `units.main_description`
- `topics.main_description`
- `subtopics.main_description`

## Styling

The editor uses:

- **Tailwind CSS** for utility classes
- **Custom CSS** for Tiptap-specific styling
- **Prose classes** for typography
- **Responsive design** for mobile devices

## Technical Details

### Built With

- **Tiptap** - Modern headless rich text editor
- **React** - Component framework
- **Turndown** - HTML to Markdown converter
- **Lucide React** - Icon library

### Extensions Used

- StarterKit (core functionality)
- Link extension
- Image extension
- Placeholder extension
- TextStyle & Color extensions
- TextAlign extension

## Browser Support

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## Performance

- Lightweight bundle size
- Efficient rendering with virtual DOM
- Optimized for large documents
- Smooth typing experience

## Security

- HTML sanitization in HTMLRenderer
- XSS protection
- Safe link handling
- Script tag removal

## Future Enhancements

Potential features for future versions:

- Table support
- Code syntax highlighting
- Collaborative editing
- Custom themes
- Plugin system
- Advanced image handling
- Math equation support

