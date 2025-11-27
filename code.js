// Figma plugin backend code
figma.showUI(__html__, { width: 1200, height: 800, themeColors: true });

// Handle messages from the UI
figma.ui.onmessage = (msg) => {
    if (msg.type === 'copy-to-clipboard') {
        // Figma doesn't support clipboard API directly, so we'll handle this in the UI
        figma.ui.postMessage({ type: 'clipboard-ready' });
    }

    if (msg.type === 'download-json') {
        // Notify UI to trigger download
        figma.ui.postMessage({ type: 'download-ready', data: msg.data });
    }

    if (msg.type === 'close-plugin') {
        figma.closePlugin();
    }

    if (msg.type === 'notify') {
        figma.notify(msg.message);
    }
};
