# Markdown Editor Component

A lightweight, modern markdown editor for editing unit, topic, and subtopic descriptions in the course creation system.

## Features

### ✨ Rich Text Editing

- **Bold text** with `**text**` or Ctrl+B
- _Italic text_ with `*text*` or Ctrl+I
- Headers with `#`, `##`, `###` or Ctrl+1/2/3
- Bullet lists with `-` or numbered lists with `1.`
- Links with `[text](url)` or Ctrl+K

### 🎨 Modern UI

- Clean, intuitive toolbar with icon buttons
- Toggle between edit and preview modes
- Real-time character count with warning states
- Responsive design for mobile devices
- Smooth animations and transitions

### 🔧 Advanced Features

- Keyboard shortcuts for common formatting
- Live preview of markdown content
- Auto-save functionality (optional)
- Character count with visual warnings
- Monospace font for better code editing

## Usage

```jsx
import MarkdownEditor from "./MarkdownEditor";

<MarkdownEditor
  value={description}
  onChange={setDescription}
  placeholder="Start writing your description..."
  rows={8}
  autoSave={true}
  onAutoSave={handleAutoSave}
/>;
```

## Props

| Prop          | Type     | Default              | Description                    |
| ------------- | -------- | -------------------- | ------------------------------ |
| `value`       | string   | `""`                 | The markdown content           |
| `onChange`    | function | -                    | Callback when content changes  |
| `placeholder` | string   | `"Start writing..."` | Placeholder text               |
| `className`   | string   | `""`                 | Additional CSS classes         |
| `rows`        | number   | `8`                  | Number of textarea rows        |
| `autoSave`    | boolean  | `false`              | Enable auto-save functionality |
| `onAutoSave`  | function | -                    | Auto-save callback             |

## Keyboard Shortcuts

- **Ctrl+B** - Bold text
- **Ctrl+I** - Italic text
- **Ctrl+K** - Insert link
- **Ctrl+1** - Heading 1
- **Ctrl+2** - Heading 2
- **Ctrl+3** - Heading 3

## Integration

The editor is integrated into the course creation system and replaces the basic textarea for the "Main Description" field. It automatically saves content to Supabase in markdown format.

## Styling

The editor uses Tailwind CSS classes and includes custom CSS for enhanced styling. The component is fully responsive and includes:

- Custom scrollbars
- Hover effects
- Focus states
- Animation transitions
- Mobile-friendly toolbar

## Database Storage

Content is stored in the `main_description` field of the respective tables:

- `units.main_description`
- `topics.main_description`
- `subtopics.main_description`

All content is stored as markdown and rendered using the existing `MarkdownRenderer` component.

