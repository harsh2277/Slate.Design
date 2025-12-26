# Dark Mode Color Variable Fix

## Problem
Dark mode color variables were not being created correctly. The plugin was trying to reverse the light mode color array instead of using the actual dark mode colors displayed in the UI.

## Root Cause
The `collectColorShades()` function only collected colors from the light mode container (e.g., `primaryShades`), but ignored the dark mode container (e.g., `primaryShadesDark`).

## Solution

### 1. Updated UI Color Collection (ui.html)
- Modified `collectColorShades()` to accept an optional `containerId` parameter
- Now collects colors from both light and dark mode containers:
  - Light: `primaryShades`, `secondaryShades`, `neutralShades`
  - Dark: `primaryShadesDark`, `secondaryShadesDark`, `neutralShadesDark`

### 2. Updated Data Structure
Changed from:
```javascript
colors: {
  primary: { "primary-50": "#...", "primary-100": "#..." },
  secondary: { ... },
  neutral: { ... }
}
```

To:
```javascript
colors: {
  primary: {
    light: { "primary-50": "#...", "primary-100": "#..." },
    dark: { "primary-50": "#...", "primary-100": "#..." }
  },
  secondary: {
    light: { ... },
    dark: { ... }
  },
  neutral: {
    light: { ... },
    dark: { ... }
  }
}
```

### 3. Updated Variable Creation (code.js)
- Modified the variable creation logic to use the new data structure
- Now reads from `colors.primary.light` and `colors.primary.dark` separately
- Creates variables with the correct light and dark mode values
- Added fallback logic: if dark mode colors are missing, uses light mode colors

### 4. Updated Visual Documentation
- Updated the documentation frame creation to use `colors.primary.light` for display
- Ensures the visual documentation shows the correct colors

## Testing Checklist

To verify the fix works:

1. ✅ Select a shade count (e.g., 20 shades) for Primary color
2. ✅ Verify the UI shows 20 light mode swatches
3. ✅ Verify the UI shows 20 dark mode swatches (reversed)
4. ✅ Click "Create Variables in Figma"
5. ✅ Check Figma variables:
   - Should have 20 Primary color variables
   - Each variable should have Light mode value matching the light mode UI
   - Each variable should have Dark mode value matching the dark mode UI
6. ✅ Repeat for Secondary and Neutral colors

## Result
Dark mode color variables now correctly match what's displayed in the dark mode preview in the UI!
