// Figma plugin backend code
figma.showUI(__html__, { width: 1200, height: 800, themeColors: true });

// Handle messages from the UI
figma.ui.onmessage = async (msg) => {
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

    if (msg.type === 'create-variables') {
        try {
            console.log('Received color data:', msg.colors);

            // Validate that we have color data
            if (!msg.colors) {
                throw new Error('No color data received');
            }

            // Get or create a variable collection
            const collections = figma.variables.getLocalVariableCollections();
            let collection;

            // Check if "Design System Colors" collection exists
            const existingCollection = collections.find(c => c.name === 'Design System Colors');

            if (existingCollection) {
                collection = existingCollection;
            } else {
                collection = figma.variables.createVariableCollection('Design System Colors');
            }

            // Helper function to convert hex to RGB
            function hexToRgb(hex) {
                if (!hex) return { r: 0, g: 0, b: 0 };
                const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                return result ? {
                    r: parseInt(result[1], 16) / 255,
                    g: parseInt(result[2], 16) / 255,
                    b: parseInt(result[3], 16) / 255
                } : { r: 0, g: 0, b: 0 };
            }

            // Helper function to create or update a variable
            function createOrUpdateVariable(name, hexColor, collection) {
                if (!name || !hexColor) {
                    console.warn('Skipping variable - missing name or color:', name, hexColor);
                    return null;
                }

                const rgb = hexToRgb(hexColor);

                // Check if variable already exists
                const existingVariables = figma.variables.getLocalVariables('COLOR');
                const existingVar = existingVariables.find(v => v.name === name && v.variableCollectionId === collection.id);

                if (existingVar) {
                    // Update existing variable
                    existingVar.setValueForMode(collection.modes[0].modeId, rgb);
                    return existingVar;
                } else {
                    // Create new variable
                    const variable = figma.variables.createVariable(name, collection.id, 'COLOR');
                    variable.setValueForMode(collection.modes[0].modeId, rgb);
                    return variable;
                }
            }

            let createdCount = 0;

            // Create variables for each color category
            const colors = msg.colors;

            // Primary colors
            if (colors.primary) {
                Object.entries(colors.primary).forEach(([name, value]) => {
                    // Add "Primary/" prefix to group variables
                    const groupedName = `Primary/${name}`;
                    createOrUpdateVariable(groupedName, value, collection);
                    createdCount++;
                });
            }

            // Secondary colors (if enabled)
            if (colors.secondary) {
                Object.entries(colors.secondary).forEach(([name, value]) => {
                    // Add "Secondary/" prefix to group variables
                    const groupedName = `Secondary/${name}`;
                    createOrUpdateVariable(groupedName, value, collection);
                    createdCount++;
                });
            }

            // Status colors
            if (colors.success) {
                Object.entries(colors.success).forEach(([name, value]) => {
                    // Add "Success/" prefix to group variables
                    const groupedName = `Success/${name}`;
                    createOrUpdateVariable(groupedName, value, collection);
                    createdCount++;
                });
            }

            if (colors.error) {
                Object.entries(colors.error).forEach(([name, value]) => {
                    // Add "Error/" prefix to group variables
                    const groupedName = `Error/${name}`;
                    createOrUpdateVariable(groupedName, value, collection);
                    createdCount++;
                });
            }

            if (colors.warning) {
                Object.entries(colors.warning).forEach(([name, value]) => {
                    // Add "Warning/" prefix to group variables
                    const groupedName = `Warning/${name}`;
                    createOrUpdateVariable(groupedName, value, collection);
                    createdCount++;
                });
            }

            // Neutral colors
            if (colors.neutral) {
                Object.entries(colors.neutral).forEach(([name, value]) => {
                    // Add "Neutral/" prefix to group variables
                    const groupedName = `Neutral/${name}`;
                    createOrUpdateVariable(groupedName, value, collection);
                    createdCount++;
                });
            }

            // Create spacing variables if spacing data exists
            let spacingCollection;
            let spacingCount = 0;
            
            if (msg.spacing && Object.keys(msg.spacing).length > 0) {
                // Get or create spacing variable collection
                const existingSpacingCollection = figma.variables.getLocalVariableCollections().find(c => c.name === 'Design System Spacing');
                
                if (existingSpacingCollection) {
                    spacingCollection = existingSpacingCollection;
                } else {
                    spacingCollection = figma.variables.createVariableCollection('Design System Spacing');
                }

                // Create spacing variables
                Object.entries(msg.spacing).forEach(([name, value]) => {
                    // Check if variable already exists
                    const existingVariables = figma.variables.getLocalVariables('FLOAT');
                    const existingVar = existingVariables.find(v => v.name === name && v.variableCollectionId === spacingCollection.id);

                    if (existingVar) {
                        existingVar.setValueForMode(spacingCollection.modes[0].modeId, value);
                    } else {
                        const variable = figma.variables.createVariable(name, spacingCollection.id, 'FLOAT');
                        variable.setValueForMode(spacingCollection.modes[0].modeId, value);
                    }
                    spacingCount++;
                });
            }

            // Create radius variables if radius data exists
            let radiusCollection;
            let radiusCount = 0;
            
            if (msg.radius && Object.keys(msg.radius).length > 0) {
                // Get or create radius variable collection
                const existingRadiusCollection = figma.variables.getLocalVariableCollections().find(c => c.name === 'Design System Radius');
                
                if (existingRadiusCollection) {
                    radiusCollection = existingRadiusCollection;
                } else {
                    radiusCollection = figma.variables.createVariableCollection('Design System Radius');
                }

                // Create radius variables
                Object.entries(msg.radius).forEach(([name, value]) => {
                    // Check if variable already exists
                    const existingVariables = figma.variables.getLocalVariables('FLOAT');
                    const existingVar = existingVariables.find(v => v.name === name && v.variableCollectionId === radiusCollection.id);

                    if (existingVar) {
                        existingVar.setValueForMode(radiusCollection.modes[0].modeId, value);
                    } else {
                        const variable = figma.variables.createVariable(name, radiusCollection.id, 'FLOAT');
                        variable.setValueForMode(radiusCollection.modes[0].modeId, value);
                    }
                    radiusCount++;
                });
            }

            // Create stroke variables if stroke data exists
            let strokeCollection;
            let strokeCount = 0;
            
            if (msg.strokes && Object.keys(msg.strokes).length > 0) {
                // Get or create stroke variable collection
                const existingStrokeCollection = figma.variables.getLocalVariableCollections().find(c => c.name === 'Design System Stroke');
                
                if (existingStrokeCollection) {
                    strokeCollection = existingStrokeCollection;
                } else {
                    strokeCollection = figma.variables.createVariableCollection('Design System Stroke');
                }

                // Create stroke variables
                Object.entries(msg.strokes).forEach(([name, value]) => {
                    // Check if variable already exists
                    const existingVariables = figma.variables.getLocalVariables('FLOAT');
                    const existingVar = existingVariables.find(v => v.name === name && v.variableCollectionId === strokeCollection.id);

                    if (existingVar) {
                        existingVar.setValueForMode(strokeCollection.modes[0].modeId, value);
                    } else {
                        const variable = figma.variables.createVariable(name, strokeCollection.id, 'FLOAT');
                        variable.setValueForMode(strokeCollection.modes[0].modeId, value);
                    }
                    strokeCount++;
                });
            }

            // Create shadow styles (Figma effect styles)
            let shadowCount = 0;
            if (msg.shadows && Object.keys(msg.shadows).length > 0) {
                console.log('Creating shadow styles:', msg.shadows);
                
                Object.entries(msg.shadows).forEach(([name, value]) => {
                    if (value === 'none') {
                        // Skip 'none' shadow
                        console.log('Skipping none shadow');
                        return;
                    }

                    console.log('Processing shadow:', name, value);

                    // Parse shadow value (e.g., "0 1px 2px rgba(0,0,0,0.05)" or "0 1 2 rgba(0,0,0,0.05)")
                    const shadowMatch = value.match(/(-?\d+)(?:px)?\s+(-?\d+)(?:px)?\s+(-?\d+)(?:px)?\s+rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
                    
                    if (shadowMatch) {
                        const [, x, y, blur, r, g, b, a] = shadowMatch;
                        console.log('Parsed shadow values:', { x, y, blur, r, g, b, a });
                        
                        try {
                            // Check if style already exists
                            const groupedName = `Shadow/${name.replace('shadow-', '')}`;
                            const existingStyles = figma.getLocalEffectStyles();
                            let style = existingStyles.find(s => s.name === groupedName);
                            
                            if (!style) {
                                style = figma.createEffectStyle();
                                style.name = groupedName;
                                console.log('Created new effect style:', style.name);
                            } else {
                                console.log('Updating existing effect style:', style.name);
                            }
                            
                            // Set the shadow effect
                            style.effects = [{
                                type: 'DROP_SHADOW',
                                color: {
                                    r: parseInt(r) / 255,
                                    g: parseInt(g) / 255,
                                    b: parseInt(b) / 255,
                                    a: parseFloat(a)
                                },
                                offset: {
                                    x: parseInt(x),
                                    y: parseInt(y)
                                },
                                radius: parseInt(blur),
                                visible: true,
                                blendMode: 'NORMAL',
                                spread: 0
                            }];
                            
                            shadowCount++;
                            console.log('Successfully created/updated shadow style:', name);
                        } catch (error) {
                            console.error('Error creating shadow style:', name, error);
                        }
                    } else {
                        console.warn('Could not parse shadow value:', name, value);
                    }
                });
                
                console.log('Total shadow styles created:', shadowCount);
            }

            // Check if we created any variables
            if (createdCount === 0 && spacingCount === 0 && radiusCount === 0 && strokeCount === 0) {
                figma.notify('⚠️ No data found to create variables. Please expand sections and ensure tokens are generated.');
                return;
            }

            // Create visual documentation frame
            const frame = figma.createFrame();
            frame.name = "Color System";
            frame.resize(1200, 800);
            frame.fills = [{ type: 'SOLID', color: { r: 0.98, g: 0.98, b: 0.98 } }];

            // Load all required fonts upfront
            try {
                await figma.loadFontAsync({ family: "Inter", style: "Bold" });
            } catch (e) {
                console.warn('Could not load Inter Bold, trying fallback');
            }
            
            try {
                await figma.loadFontAsync({ family: "Inter", style: "Semi Bold" });
            } catch (e) {
                console.warn('Could not load Inter Semi Bold, trying fallback');
            }
            
            try {
                await figma.loadFontAsync({ family: "Inter", style: "Medium" });
            } catch (e) {
                console.warn('Could not load Inter Medium, trying fallback');
            }
            
            try {
                await figma.loadFontAsync({ family: "Inter", style: "Regular" });
            } catch (e) {
                console.warn('Could not load Inter Regular, trying fallback');
            }

            let yOffset = 60;

            // Add title
            const title = figma.createText();
            try {
                title.fontName = { family: "Inter", style: "Bold" };
            } catch (e) {
                // Fallback to default font
            }
            title.fontSize = 32;
            title.characters = "Color System";
            title.x = 40;
            title.y = 30;
            title.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }];
            frame.appendChild(title);

            // Add description
            const description = figma.createText();
            try {
                description.fontName = { family: "Inter", style: "Regular" };
            } catch (e) {
                // Fallback to default font
            }
            description.fontSize = 14;
            description.characters = "A comprehensive color palette designed for accessibility and visual harmony.";
            description.x = 40;
            description.y = 70;
            description.fills = [{ type: 'SOLID', color: { r: 0.4, g: 0.4, b: 0.4 } }];
            frame.appendChild(description);

            yOffset = 120;

            // Helper function to create color swatch
            function createColorSwatch(colorName, hexColor, x, y, parent) {
                const swatchContainer = figma.createFrame();
                swatchContainer.name = colorName;
                swatchContainer.resize(90, 120);
                swatchContainer.x = x;
                swatchContainer.y = y;
                swatchContainer.fills = [];

                // Color rectangle
                const colorRect = figma.createRectangle();
                colorRect.resize(90, 70);
                colorRect.x = 0;
                colorRect.y = 0;
                colorRect.cornerRadius = 8;
                const rgb = hexToRgb(hexColor);
                colorRect.fills = [{ type: 'SOLID', color: rgb }];
                swatchContainer.appendChild(colorRect);

                // Color name text
                const nameText = figma.createText();
                try {
                    nameText.fontName = { family: "Inter", style: "Medium" };
                } catch (e) {
                    // Fallback to default font
                }
                nameText.fontSize = 10;
                nameText.characters = colorName.split('/')[1] || colorName;
                nameText.x = 0;
                nameText.y = 78;
                nameText.resize(90, 16);
                nameText.fills = [{ type: 'SOLID', color: { r: 0.1, g: 0.1, b: 0.1 } }];
                swatchContainer.appendChild(nameText);

                // Hex value text
                const hexText = figma.createText();
                try {
                    hexText.fontName = { family: "Inter", style: "Regular" };
                } catch (e) {
                    // Fallback to default font
                }
                hexText.fontSize = 9;
                hexText.characters = hexColor.toUpperCase();
                hexText.x = 0;
                hexText.y = 96;
                hexText.resize(90, 14);
                hexText.fills = [{ type: 'SOLID', color: { r: 0.5, g: 0.5, b: 0.5 } }];
                swatchContainer.appendChild(hexText);

                parent.appendChild(swatchContainer);
                return swatchContainer;
            }

            // Helper function to create section
            function createSection(sectionTitle, colorData, yPos) {
                if (!colorData || Object.keys(colorData).length === 0) return yPos;

                // Section title
                const sectionLabel = figma.createText();
                try {
                    sectionLabel.fontName = { family: "Inter", style: "Semi Bold" };
                } catch (e) {
                    // Fallback to default font
                }
                sectionLabel.fontSize = 16;
                sectionLabel.characters = sectionTitle;
                sectionLabel.x = 40;
                sectionLabel.y = yPos;
                sectionLabel.fills = [{ type: 'SOLID', color: { r: 0.1, g: 0.1, b: 0.1 } }];
                frame.appendChild(sectionLabel);

                // Create swatches
                let xOffset = 40;
                let currentY = yPos + 35;
                let swatchCount = 0;
                const maxSwatchesPerRow = 11;

                Object.entries(colorData).forEach(([name, value]) => {
                    if (swatchCount > 0 && swatchCount % maxSwatchesPerRow === 0) {
                        xOffset = 40;
                        currentY += 135;
                    }

                    createColorSwatch(name, value, xOffset, currentY, frame);
                    xOffset += 100;
                    swatchCount++;
                });

                return currentY + 150;
            }

            // Create sections for each color group
            if (colors.primary) {
                yOffset = createSection("Primary", colors.primary, yOffset);
            }

            if (colors.secondary) {
                yOffset = createSection("Secondary", colors.secondary, yOffset);
            }

            if (colors.success) {
                yOffset = createSection("Success", colors.success, yOffset);
            }

            if (colors.error) {
                yOffset = createSection("Error", colors.error, yOffset);
            }

            if (colors.warning) {
                yOffset = createSection("Warning", colors.warning, yOffset);
            }

            if (colors.neutral) {
                yOffset = createSection("Neutral", colors.neutral, yOffset);
            }

            // Add spacing section if spacing data exists
            if (msg.spacing && Object.keys(msg.spacing).length > 0) {
                // Section title
                const spacingLabel = figma.createText();
                try {
                    spacingLabel.fontName = { family: "Inter", style: "Semi Bold" };
                } catch (e) {
                    // Fallback to default font
                }
                spacingLabel.fontSize = 16;
                spacingLabel.characters = "Spacing";
                spacingLabel.x = 40;
                spacingLabel.y = yOffset;
                spacingLabel.fills = [{ type: 'SOLID', color: { r: 0.1, g: 0.1, b: 0.1 } }];
                frame.appendChild(spacingLabel);

                // Create spacing tokens
                let xOffset = 40;
                let currentY = yOffset + 35;
                let tokenCount = 0;
                const maxTokensPerRow = 13;

                Object.entries(msg.spacing).forEach(([name, value]) => {
                    if (tokenCount > 0 && tokenCount % maxTokensPerRow === 0) {
                        xOffset = 40;
                        currentY += 70;
                    }

                    // Create spacing token card
                    const tokenCard = figma.createFrame();
                    tokenCard.name = name;
                    tokenCard.resize(70, 55);
                    tokenCard.x = xOffset;
                    tokenCard.y = currentY;
                    tokenCard.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
                    tokenCard.cornerRadius = 6;
                    tokenCard.strokes = [{ type: 'SOLID', color: { r: 0.9, g: 0.9, b: 0.9 } }];
                    tokenCard.strokeWeight = 1;

                    // Token name
                    const tokenName = figma.createText();
                    try {
                        tokenName.fontName = { family: "Inter", style: "Medium" };
                    } catch (e) {
                        // Fallback
                    }
                    tokenName.fontSize = 8;
                    tokenName.characters = name;
                    tokenName.x = 0;
                    tokenName.y = 8;
                    tokenName.resize(70, 12);
                    tokenName.textAlignHorizontal = 'CENTER';
                    tokenName.fills = [{ type: 'SOLID', color: { r: 0.5, g: 0.5, b: 0.5 } }];
                    tokenCard.appendChild(tokenName);

                    // Token value
                    const tokenValue = figma.createText();
                    try {
                        tokenValue.fontName = { family: "Inter", style: "Bold" };
                    } catch (e) {
                        // Fallback
                    }
                    tokenValue.fontSize = 11;
                    tokenValue.characters = `${value}px`;
                    tokenValue.x = 0;
                    tokenValue.y = 28;
                    tokenValue.resize(70, 18);
                    tokenValue.textAlignHorizontal = 'CENTER';
                    tokenValue.fills = [{ type: 'SOLID', color: { r: 0.1, g: 0.1, b: 0.1 } }];
                    tokenCard.appendChild(tokenValue);

                    frame.appendChild(tokenCard);
                    xOffset += 80;
                    tokenCount++;
                });

                yOffset = currentY + 80;
            }

            // Add radius section if radius data exists
            if (msg.radius && Object.keys(msg.radius).length > 0) {
                // Section title
                const radiusLabel = figma.createText();
                try {
                    radiusLabel.fontName = { family: "Inter", style: "Semi Bold" };
                } catch (e) {
                    // Fallback to default font
                }
                radiusLabel.fontSize = 16;
                radiusLabel.characters = "Radius";
                radiusLabel.x = 40;
                radiusLabel.y = yOffset;
                radiusLabel.fills = [{ type: 'SOLID', color: { r: 0.1, g: 0.1, b: 0.1 } }];
                frame.appendChild(radiusLabel);

                // Create radius tokens
                let xOffset = 40;
                let currentY = yOffset + 35;
                let tokenCount = 0;
                const maxTokensPerRow = 13;

                Object.entries(msg.radius).forEach(([name, value]) => {
                    if (tokenCount > 0 && tokenCount % maxTokensPerRow === 0) {
                        xOffset = 40;
                        currentY += 70;
                    }

                    // Create radius token card
                    const tokenCard = figma.createFrame();
                    tokenCard.name = name;
                    tokenCard.resize(70, 55);
                    tokenCard.x = xOffset;
                    tokenCard.y = currentY;
                    tokenCard.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
                    tokenCard.cornerRadius = value === 9999 ? 27.5 : Math.min(value, 6);
                    tokenCard.strokes = [{ type: 'SOLID', color: { r: 0.9, g: 0.9, b: 0.9 } }];
                    tokenCard.strokeWeight = 1;

                    // Token name
                    const tokenName = figma.createText();
                    try {
                        tokenName.fontName = { family: "Inter", style: "Medium" };
                    } catch (e) {
                        // Fallback
                    }
                    tokenName.fontSize = 8;
                    tokenName.characters = name;
                    tokenName.x = 0;
                    tokenName.y = 8;
                    tokenName.resize(70, 12);
                    tokenName.textAlignHorizontal = 'CENTER';
                    tokenName.fills = [{ type: 'SOLID', color: { r: 0.5, g: 0.5, b: 0.5 } }];
                    tokenCard.appendChild(tokenName);

                    // Token value
                    const tokenValue = figma.createText();
                    try {
                        tokenValue.fontName = { family: "Inter", style: "Bold" };
                    } catch (e) {
                        // Fallback
                    }
                    tokenValue.fontSize = 11;
                    const displayValue = value === 9999 ? '∞' : `${value}px`;
                    tokenValue.characters = displayValue;
                    tokenValue.x = 0;
                    tokenValue.y = 28;
                    tokenValue.resize(70, 18);
                    tokenValue.textAlignHorizontal = 'CENTER';
                    tokenValue.fills = [{ type: 'SOLID', color: { r: 0.1, g: 0.1, b: 0.1 } }];
                    tokenCard.appendChild(tokenValue);

                    frame.appendChild(tokenCard);
                    xOffset += 80;
                    tokenCount++;
                });

                yOffset = currentY + 80;
            }

            // Add stroke section if stroke data exists
            if (msg.strokes && Object.keys(msg.strokes).length > 0) {
                // Section title
                const strokeLabel = figma.createText();
                try {
                    strokeLabel.fontName = { family: "Inter", style: "Semi Bold" };
                } catch (e) {
                    // Fallback to default font
                }
                strokeLabel.fontSize = 16;
                strokeLabel.characters = "Stroke";
                strokeLabel.x = 40;
                strokeLabel.y = yOffset;
                strokeLabel.fills = [{ type: 'SOLID', color: { r: 0.1, g: 0.1, b: 0.1 } }];
                frame.appendChild(strokeLabel);

                // Create stroke tokens
                let xOffset = 40;
                let currentY = yOffset + 35;
                let tokenCount = 0;
                const maxTokensPerRow = 13;

                Object.entries(msg.strokes).forEach(([name, value]) => {
                    if (tokenCount > 0 && tokenCount % maxTokensPerRow === 0) {
                        xOffset = 40;
                        currentY += 70;
                    }

                    // Create stroke token card
                    const tokenCard = figma.createFrame();
                    tokenCard.name = name;
                    tokenCard.resize(70, 55);
                    tokenCard.x = xOffset;
                    tokenCard.y = currentY;
                    tokenCard.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
                    tokenCard.cornerRadius = 6;
                    tokenCard.strokes = [{ type: 'SOLID', color: { r: 0.1, g: 0.1, b: 0.1 } }];
                    tokenCard.strokeWeight = value;

                    // Token name
                    const tokenName = figma.createText();
                    try {
                        tokenName.fontName = { family: "Inter", style: "Medium" };
                    } catch (e) {
                        // Fallback
                    }
                    tokenName.fontSize = 8;
                    tokenName.characters = name;
                    tokenName.x = 0;
                    tokenName.y = 8;
                    tokenName.resize(70, 12);
                    tokenName.textAlignHorizontal = 'CENTER';
                    tokenName.fills = [{ type: 'SOLID', color: { r: 0.5, g: 0.5, b: 0.5 } }];
                    tokenCard.appendChild(tokenName);

                    // Token value
                    const tokenValue = figma.createText();
                    try {
                        tokenValue.fontName = { family: "Inter", style: "Bold" };
                    } catch (e) {
                        // Fallback
                    }
                    tokenValue.fontSize = 11;
                    tokenValue.characters = `${value}px`;
                    tokenValue.x = 0;
                    tokenValue.y = 28;
                    tokenValue.resize(70, 18);
                    tokenValue.textAlignHorizontal = 'CENTER';
                    tokenValue.fills = [{ type: 'SOLID', color: { r: 0.1, g: 0.1, b: 0.1 } }];
                    tokenCard.appendChild(tokenValue);

                    frame.appendChild(tokenCard);
                    xOffset += 80;
                    tokenCount++;
                });

                yOffset = currentY + 80;
            }

            // Add shadow section if shadow data exists
            if (msg.shadows && Object.keys(msg.shadows).length > 0) {
                // Section title
                const shadowLabel = figma.createText();
                try {
                    shadowLabel.fontName = { family: "Inter", style: "Semi Bold" };
                } catch (e) {
                    // Fallback to default font
                }
                shadowLabel.fontSize = 16;
                shadowLabel.characters = "Shadow";
                shadowLabel.x = 40;
                shadowLabel.y = yOffset;
                shadowLabel.fills = [{ type: 'SOLID', color: { r: 0.1, g: 0.1, b: 0.1 } }];
                frame.appendChild(shadowLabel);

                // Create shadow tokens
                let xOffset = 40;
                let currentY = yOffset + 35;
                let tokenCount = 0;
                const maxTokensPerRow = 13;

                Object.entries(msg.shadows).forEach(([name, value]) => {
                    if (tokenCount > 0 && tokenCount % maxTokensPerRow === 0) {
                        xOffset = 40;
                        currentY += 70;
                    }

                    // Create shadow token card
                    const tokenCard = figma.createFrame();
                    tokenCard.name = name;
                    tokenCard.resize(70, 55);
                    tokenCard.x = xOffset;
                    tokenCard.y = currentY;
                    tokenCard.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
                    tokenCard.cornerRadius = 6;
                    tokenCard.strokes = [{ type: 'SOLID', color: { r: 0.9, g: 0.9, b: 0.9 } }];
                    tokenCard.strokeWeight = 1;
                    
                    // Add shadow effect if not 'none'
                    if (value !== 'none') {
                        tokenCard.effects = [{
                            type: 'DROP_SHADOW',
                            color: { r: 0, g: 0, b: 0, a: 0.1 },
                            offset: { x: 0, y: 2 },
                            radius: 4,
                            visible: true,
                            blendMode: 'NORMAL'
                        }];
                    }

                    // Token name
                    const tokenName = figma.createText();
                    try {
                        tokenName.fontName = { family: "Inter", style: "Medium" };
                    } catch (e) {
                        // Fallback
                    }
                    tokenName.fontSize = 8;
                    tokenName.characters = name;
                    tokenName.x = 0;
                    tokenName.y = 8;
                    tokenName.resize(70, 12);
                    tokenName.textAlignHorizontal = 'CENTER';
                    tokenName.fills = [{ type: 'SOLID', color: { r: 0.5, g: 0.5, b: 0.5 } }];
                    tokenCard.appendChild(tokenName);

                    // Token value (just show the name since shadow values are complex)
                    const tokenValue = figma.createText();
                    try {
                        tokenValue.fontName = { family: "Inter", style: "Bold" };
                    } catch (e) {
                        // Fallback
                    }
                    tokenValue.fontSize = 11;
                    tokenValue.characters = name.replace('shadow-', '');
                    tokenValue.x = 0;
                    tokenValue.y = 28;
                    tokenValue.resize(70, 18);
                    tokenValue.textAlignHorizontal = 'CENTER';
                    tokenValue.fills = [{ type: 'SOLID', color: { r: 0.1, g: 0.1, b: 0.1 } }];
                    tokenCard.appendChild(tokenValue);

                    frame.appendChild(tokenCard);
                    xOffset += 80;
                    tokenCount++;
                });

                yOffset = currentY + 80;
            }

            // Resize frame to fit content
            frame.resize(1200, yOffset + 40);

            // Center the frame in viewport
            figma.viewport.scrollAndZoomIntoView([frame]);

            const totalVars = createdCount + spacingCount + radiusCount + strokeCount;
            const varMessage = `${createdCount} colors, ${spacingCount} spacing, ${radiusCount} radius, ${strokeCount} stroke`;
            const shadowMessage = shadowCount > 0 ? ` + ${shadowCount} shadow styles` : '';
            figma.notify(`✅ Created ${totalVars} variables (${varMessage})${shadowMessage} and documentation frame!`);
        } catch (error) {
            const errorMsg = (error && error.message) || (error && error.toString()) || 'Unknown error';
            figma.notify(`❌ Error creating variables: ${errorMsg}`);
            console.error('Full error details:', error);
            console.error('Error stack:', error && error.stack);
        }
    }
};
