# Debug Testing Guide

## How to Test and Debug

### Step 1: Open Figma Plugin
1. Close the plugin if it's already open
2. Reopen the plugin in Figma
3. Open the **browser console** (Right-click → Inspect → Console tab)

### Step 2: Check Initial State
You should see the plugin UI with collapsed sections:
- ✅ Primary Color (collapsed)
- ✅ Secondary Color (Optional) (collapsed)
- ✅ Status Colors (collapsed)
- ✅ Neutral Colors (collapsed)

### Step 3: Click "Create Variable" Button
1. Click the **"Create Variable"** button
2. **Watch the console** for log messages

### Expected Console Output

You should see logs like this:

```
Create Variable button clicked
Collecting colors for: primary
Container found for primary, looking for swatches...
Found 11 swatches for primary
Swatch 0: name="primary-50", value="#F9FAFB"
Swatch 1: name="primary-100", value="#F3F4F6"
... (more swatches)
Collected 11 colors for primary: {primary-50: "#F9FAFB", ...}

Collecting status colors for: success
Found 3 swatches for success
... (more logs)

Collected color data: {primary: {...}, success: {...}, ...}
Message sent to plugin
```

### Step 4: Check Backend Logs

In the Figma console, you should also see:
```
Received color data: {primary: {...}, success: {...}, ...}
```

## Troubleshooting

### If you see "Container not found"
**Problem**: The color containers don't exist
**Solution**: This shouldn't happen as colors are generated on page load

### If you see "Found 0 swatches"
**Problem**: Color swatches aren't being generated
**Solution**: 
- Check if the `generatePrimaryShades()` etc. functions are running
- Look for errors in the console during page load

### If you see "No color data received"
**Problem**: The message isn't reaching the backend properly
**Solution**:
- Check if "Message sent to plugin" appears in console
- Verify the plugin is properly connected

### If you see "Error creating variables: undefined"
**Problem**: Something is undefined in the backend code
**Solution**:
- Check the "Full error details" and "Error stack" in console
- This will show exactly which line is failing

## What to Look For

### ✅ Success Indicators
- Console shows color data being collected
- Console shows "Message sent to plugin"
- Backend console shows "Received color data"
- Figma shows success notification
- Variables appear in Variables panel
- Documentation frame appears on canvas

### ❌ Failure Indicators
- "Container not found" warnings
- "Found 0 swatches" messages
- "No color data received" error
- "Error creating variables" notification
- Empty color data objects: `{}`

## Next Steps

1. **Run the test** following the steps above
2. **Copy all console output** (both UI and Figma console)
3. **Take a screenshot** of any errors
4. **Share the logs** so we can see exactly what's happening

The extensive logging will help us identify exactly where the issue is!
