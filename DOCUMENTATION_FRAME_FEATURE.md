# Color System Documentation Frame Feature

## Overview
When you click "Create Variable", the plugin now creates both:
1. **Color Variables** organized in groups (Primary, Secondary, Success, Error, Warning, Neutral)
2. **Visual Documentation Frame** showing all your colors in a beautiful layout

## What Gets Created

### 1. Color Variables
All colors are created as Figma variables in the "Design System Colors" collection, organized into groups:
- **Primary/** - All primary color shades
- **Secondary/** - All secondary color shades (if enabled)
- **Success/** - Success color variants
- **Error/** - Error color variants
- **Warning/** - Warning color variants
- **Neutral/** - All neutral color shades

### 2. Documentation Frame
A professional "Color System" frame is created with:

#### Header Section
- **Title**: "Color System" (32px, Bold)
- **Description**: "A comprehensive color palette designed for accessibility and visual harmony."

#### Color Sections
Each color group is displayed with:
- **Section Title** (e.g., "Primary", "Secondary", "Success")
- **Color Swatches** arranged in rows (max 11 per row)

#### Each Color Swatch Shows
- **Color Preview** - Rounded rectangle (90x70px) filled with the actual color
- **Color Name** - The variable name (e.g., "primary-500")
- **HEX Value** - The color code in uppercase (e.g., "#6366F1")

## Visual Layout

```
┌─────────────────────────────────────────────────────────┐
│  Color System                                           │
│  A comprehensive color palette designed for...          │
│                                                          │
│  Primary                                                │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ...        │
│  │    │ │    │ │    │ │    │ │    │ │    │             │
│  │ 50 │ │100 │ │200 │ │300 │ │400 │ │500 │             │
│  └────┘ └────┘ └────┘ └────┘ └────┘ └────┘             │
│  #F9F... #F3F... #E5E... #D1D... #9CA... #6B7...       │
│                                                          │
│  Secondary                                              │
│  ┌────┐ ┌────┐ ┌────┐ ...                              │
│  │    │ │    │ │    │                                   │
│  └────┘ └────┘ └────┘                                   │
│                                                          │
│  Success                                                │
│  ┌────┐ ┌────┐ ┌────┐                                  │
│  │    │ │    │ │    │                                   │
│  └────┘ └────┘ └────┘                                   │
│  light  default dark                                    │
│                                                          │
│  ... (Error, Warning, Neutral sections)                 │
└─────────────────────────────────────────────────────────┘
```

## Features

✅ **Auto-sizing**: Frame automatically resizes based on content
✅ **Organized Layout**: Colors arranged in neat rows with proper spacing
✅ **Professional Typography**: Uses Inter font family (Bold, SemiBold, Medium, Regular)
✅ **Clean Design**: Light gray background (#FAFAFA) with rounded color swatches
✅ **Auto-centering**: Frame is automatically centered in your viewport
✅ **Responsive**: Handles different numbers of colors gracefully

## Technical Details

### Frame Specifications
- **Width**: 1200px (fixed)
- **Height**: Auto-calculated based on content
- **Background**: #FAFAFA (light gray)
- **Padding**: 40px on all sides

### Color Swatch Specifications
- **Size**: 90x120px per swatch
- **Color Preview**: 90x70px with 8px corner radius
- **Spacing**: 100px horizontal (10px gap between swatches)
- **Row Height**: 135px vertical spacing
- **Max per Row**: 11 swatches

### Typography
- **Title**: Inter Bold, 32px, Black
- **Description**: Inter Regular, 14px, Gray (#666)
- **Section Headers**: Inter SemiBold, 16px, Dark Gray (#1A1A1A)
- **Color Names**: Inter Medium, 10px, Dark Gray
- **HEX Values**: Inter Regular, 9px, Medium Gray (#808080)

## How to Use

1. **Customize your colors** in the plugin UI
2. **Click "Create Variable"** button
3. **Wait for success notification**: "✅ Created X color variables and documentation frame!"
4. **View your results**:
   - Check the Variables panel for organized color variables
   - See the "Color System" frame in your canvas

## Benefits

🎨 **Visual Reference**: Easy-to-read color palette for designers
📋 **Documentation**: Ready-to-share color system documentation
🔄 **Sync with Variables**: Colors match exactly with your Figma variables
📱 **Shareable**: Export the frame for design system documentation
✨ **Professional**: Clean, modern design that looks great in presentations

## Notes

- The frame is created on the current page
- If you run the plugin again, a new frame will be created (old one won't be replaced)
- You can rename, move, or duplicate the frame as needed
- The frame uses Inter font - make sure it's available in your Figma file
