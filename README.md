# Design System JSON Maker - Figma Plugin

A complete Figma plugin for creating comprehensive design systems and exporting them as clean JSON.

## Features

### 1. Foundations Tab
- **Colors System**: Define primary, secondary, success, error, warning, and neutral scale colors
- **Spacing System**: Create spacing tokens with pixel values
- **Radius System**: Configure border radius tokens
- **Typography System**: Define text styles with font family, size, weight, line height, etc.
- **Shadows & Borders**: Configure shadow and border tokens

### 2. Components Tab
- **Button Component**: Configure variants, sizes, states, and icon options
- **Input Component**: Configure input types and states
- **Live Preview**: Real-time preview of components

### 3. Themes Tab
- Create multiple themes
- Duplicate and manage themes
- Override colors and components per theme

### 4. Export Tab
- JSON preview with syntax highlighting
- Format options (Pretty/Minified)
- Naming conventions (camelCase/kebab-case/snake_case)
- Copy to clipboard or download JSON

## Installation

1. Open Figma Desktop App
2. Go to **Plugins** → **Development** → **Import plugin from manifest**
3. Select the `manifest.json` file from this directory
4. The plugin will appear in your plugins list

## Usage

1. Launch the plugin from **Plugins** → **Design System JSON Maker**
2. Configure your design tokens in the **Foundations** tab
3. Customize components in the **Components** tab
4. Create themes in the **Themes** tab
5. Export your design system as JSON from the **Export** tab

## JSON Output Structure

```json
{
  "meta": {
    "version": "1.0.0",
    "generatedAt": "ISO timestamp",
    "generatedBy": "Design System JSON Maker"
  },
  "colors": {},
  "spacing": {},
  "radius": {},
  "typography": {},
  "shadows": {},
  "borders": {},
  "components": {
    "button": {},
    "input": {}
  },
  "themes": {}
}
```

## Development

- `manifest.json` - Plugin configuration
- `code.js` - Figma plugin backend
- `ui.html` - Plugin UI structure and styles
- `app.js` - Application logic and state management

## Version

1.0.0

## License

MIT
