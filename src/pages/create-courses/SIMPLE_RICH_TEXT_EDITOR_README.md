# Simple Rich Text Editor Component

A streamlined, reliable rich text editor built with Tiptap for editing unit, topic, and subtopic descriptions in the course creation system.

## Features

### ✨ Core Rich Text Formatting

- **Bold text** with toolbar button or Ctrl+B
- _Italic text_ with toolbar button or Ctrl+I
- `Inline code` with toolbar button or Ctrl+E
- Headers (H1, H2, H3) with toolbar buttons or Ctrl+1/2/3
- Bullet lists and numbered lists
- Blockquotes for highlighting important content
- Links with URL input dialog
- Undo/Redo functionality

### 🎨 Clean WYSIWYG Interface

- Real-time visual editing with immediate formatting feedback
- Clean, intuitive toolbar with icon buttons
- Professional typography and spacing
- Responsive design for all screen sizes
- Smooth animations and transitions

### 🔧 Reliable Features

- **Keyboard Shortcuts**: Full keyboard support for power users
- **HTML Output**: Generates clean, semantic HTML
- **Stable Performance**: Uses only essential Tiptap extensions
- **Accessibility**: Proper ARIA labels and keyboard navigation

## Usage

```jsx
import SimpleRichTextEditor from "./SimpleRichTextEditor";

<SimpleRichTextEditor
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

### Lists and Structure

- Bullet lists
- Numbered lists
- Blockquotes

### Links

- Link insertion with URL dialog

### History

- Undo/Redo functionality

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
- **Lucide React** - Icon library

### Extensions Used

- StarterKit (core functionality)
- Link extension
- Placeholder extension

## Why Simple?

This simplified version was created to ensure:

- **Reliability**: Fewer dependencies mean fewer potential conflicts
- **Performance**: Lighter bundle size and faster loading
- **Stability**: Core features that work consistently
- **Maintainability**: Easier to debug and update

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

## Migration from Complex Editor

If you need more advanced features, you can upgrade to the full `RichTextEditor` component which includes:

- Image support
- Text alignment
- Color formatting
- Markdown import/export
- Advanced styling options

## Troubleshooting

### Common Issues

1. **Import Errors**: Make sure all Tiptap packages are installed
2. **Styling Issues**: Check that Tailwind CSS is properly configured
3. **Content Not Saving**: Verify the `onChange` callback is working

### Getting Help

If you encounter issues:

1. Check the browser console for errors
2. Verify all dependencies are installed
3. Ensure the component is properly imported
4. Check that the parent component is passing the correct props

