# Create Variable Feature

## Summary of Changes

I've successfully updated the Figma plugin to change the "Generate JSON" button to "Create Variable" and implemented the functionality to create color variables in your Figma file.

## Changes Made

### 1. **UI Changes (ui.html)**

#### Button Text Update
- Changed button text from "Generate JSON" to "Create Variable"
- Updated button ID from `generate-json-btn` to `create-variable-btn`

#### JavaScript Functionality
Added the following functions to collect and send color data:

- **`collectColorShades(prefix)`**: Collects color shades for primary, secondary, and neutral colors
- **`collectStatusColors(type)`**: Collects status colors (success, error, warning)
- **Event Handler**: When the "Create Variable" button is clicked, it:
  1. Collects all color data from the UI (primary, secondary, success, error, warning, neutral)
  2. Sends a message to the Figma plugin backend with the color data

### 2. **Backend Changes (code.js)**

Added comprehensive variable creation functionality:

- **Variable Collection Management**: Creates or reuses a collection named "Design System Colors"
- **Color Conversion**: Converts HEX colors to RGB format (0-1 range) required by Figma
- **Variable Creation/Update**: 
  - Checks if a variable already exists
  - Updates existing variables or creates new ones
  - Handles all color categories: primary, secondary, success, error, warning, and neutral

## How It Works

1. **User clicks "Create Variable" button**
2. **UI collects all color data** from the visible color swatches
3. **Message sent to backend** with all color information
4. **Backend creates Figma variables**:
   - Creates/finds "Design System Colors" collection
   - Converts HEX colors to RGB format
   - Creates color variables with proper names (e.g., `primary-500`, `success-light`, `neutral-900`)
5. **Success notification** shows how many variables were created

## Example Variables Created

When you click the button, it will create variables like:
- `primary-50`, `primary-100`, ..., `primary-950`
- `secondary-50`, `secondary-100`, ..., `secondary-950` (if enabled)
- `success-light`, `success-default`, `success-dark`
- `error-light`, `error-default`, `error-dark`
- `warning-light`, `warning-default`, `warning-dark`
- `neutral-50`, `neutral-100`, ..., `neutral-950`

## Benefits

✅ **Automatic Variable Creation**: No manual work needed to create variables
✅ **Organized Collection**: All colors in one "Design System Colors" collection
✅ **Update Support**: Re-running updates existing variables instead of duplicating
✅ **Error Handling**: Shows clear error messages if something goes wrong
✅ **Success Feedback**: Notifies you how many variables were created

## Testing

To test the feature:
1. Open the plugin in Figma
2. Adjust colors as needed (expand sections to see colors)
3. Click the "Create Variable" button
4. Check your Figma file's local variables panel to see the created variables!
