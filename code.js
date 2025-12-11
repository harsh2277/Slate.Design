// Figma plugin backend code
figma.showUI(__html__, { width: 1200, height: 800, themeColors: true });

// Function to create button component set
async function createButtonComponentSet(buttonText, bgColor, textColor, radius) {
    // Load fonts
    await figma.loadFontAsync({ family: "Inter", style: "Medium" });
    
    // Helper to convert hex to RGB
    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16) / 255,
            g: parseInt(result[2], 16) / 255,
            b: parseInt(result[3], 16) / 255
        } : { r: 0, g: 0, b: 0 };
    }

    // Helper to darken color
    function darkenColor(rgb, amount) {
        return {
            r: Math.max(0, rgb.r - amount),
            g: Math.max(0, rgb.g - amount),
            b: Math.max(0, rgb.b - amount)
        };
    }

    // Helper to lighten color
    function lightenColor(rgb, amount) {
        return {
            r: Math.min(1, rgb.r + amount),
            g: Math.min(1, rgb.g + amount),
            b: Math.min(1, rgb.b + amount)
        };
    }

    // Helper to create icon placeholder
    function createIconPlaceholder(color, size = 16) {
        const icon = figma.createFrame();
        icon.resize(size, size);
        icon.fills = [];
        icon.name = "Icon";
        
        // Create a simple icon shape (circle)
        const circle = figma.createEllipse();
        circle.resize(size, size);
        circle.fills = [{ type: 'SOLID', color: color }];
        icon.appendChild(circle);
        
        return icon;
    }

    const baseRgb = hexToRgb(bgColor);
    const textRgb = hexToRgb(textColor);
    
    // Secondary color (purple)
    const secondaryColorRgb = hexToRgb('#8b5cf6');
    
    const spacing = 20;
    
    // Button size configurations
    const sizes = [
        { name: 'Small', height: 32, paddingX: 12, paddingY: 6, fontSize: 12, iconSize: 14 },
        { name: 'Medium', height: 40, paddingX: 16, paddingY: 10, fontSize: 14, iconSize: 16 },
        { name: 'Large', height: 48, paddingX: 20, paddingY: 12, fontSize: 16, iconSize: 18 }
    ];
    
    // Button variants with their configurations
    const variants = [
        {
            name: 'Primary',
            states: [
                { name: 'Default', bgColor: baseRgb, textColor: textRgb, borderColor: null, borderWidth: 0 },
                { name: 'Hover', bgColor: darkenColor(baseRgb, 0.08), textColor: textRgb, borderColor: null, borderWidth: 0 },
                { name: 'Click', bgColor: darkenColor(baseRgb, 0.15), textColor: textRgb, borderColor: null, borderWidth: 0 },
                { name: 'Disabled', bgColor: { r: 0.88, g: 0.88, b: 0.88 }, textColor: { r: 0.6, g: 0.6, b: 0.6 }, borderColor: null, borderWidth: 0 }
            ]
        },
        {
            name: 'Secondary',
            states: [
                { name: 'Default', bgColor: { r: 1, g: 1, b: 1 }, textColor: baseRgb, borderColor: baseRgb, borderWidth: 1 },
                { name: 'Hover', bgColor: lightenColor(baseRgb, 0.85), textColor: baseRgb, borderColor: baseRgb, borderWidth: 1 },
                { name: 'Click', bgColor: lightenColor(baseRgb, 0.75), textColor: baseRgb, borderColor: baseRgb, borderWidth: 1 },
                { name: 'Disabled', bgColor: { r: 0.98, g: 0.98, b: 0.98 }, textColor: { r: 0.7, g: 0.7, b: 0.7 }, borderColor: { r: 0.85, g: 0.85, b: 0.85 }, borderWidth: 1 }
            ]
        },
        {
            name: 'Link',
            states: [
                { name: 'Default', bgColor: { r: 0, g: 0, b: 0, a: 0 }, textColor: baseRgb, borderColor: null, borderWidth: 0, textDecoration: 'UNDERLINE' },
                { name: 'Hover', bgColor: { r: 0, g: 0, b: 0, a: 0 }, textColor: darkenColor(baseRgb, 0.1), borderColor: null, borderWidth: 0, textDecoration: 'UNDERLINE' },
                { name: 'Click', bgColor: { r: 0, g: 0, b: 0, a: 0 }, textColor: darkenColor(baseRgb, 0.15), borderColor: null, borderWidth: 0, textDecoration: 'UNDERLINE' },
                { name: 'Disabled', bgColor: { r: 0, g: 0, b: 0, a: 0 }, textColor: { r: 0.7, g: 0.7, b: 0.7 }, borderColor: null, borderWidth: 0, textDecoration: 'UNDERLINE' }
            ]
        }
    ];
    
    // Icon configurations
    const iconConfigs = [
        { leftIcon: false, rightIcon: false }
    ];
    
    // Manual positioning variables
    const buttonWidth = 120;
    const buttonSpacing = 20;
    let xOffset = 0;
    let yOffset = 0;
    
    // Array to store all components
    const components = [];
    
    // Create variants organized by size, then variant type in rows
    for (const size of sizes) {
        for (const variant of variants) {
            xOffset = 0; // Reset x for each row
            
            for (const state of variant.states) {
                for (const iconConfig of iconConfigs) {
                    // Create button component
                    const button = figma.createComponent();
                    button.name = `Size=${size.name}, Variant=${variant.name}, State=${state.name}`;
                    button.resize(120, size.height);
                    button.x = xOffset;
                    button.y = yOffset;
                    
                    // Background
                    if (state.bgColor.a !== undefined && state.bgColor.a === 0) {
                        button.fills = [];
                    } else {
                        button.fills = [{ type: 'SOLID', color: state.bgColor }];
                    }
                    
                    button.cornerRadius = radius;
                    
                    // Border for secondary buttons
                    if (state.borderColor && state.borderWidth > 0) {
                        button.strokes = [{ type: 'SOLID', color: state.borderColor }];
                        button.strokeWeight = state.borderWidth;
                    }
                    
                    // Create auto-layout for content
                    button.layoutMode = 'HORIZONTAL';
                    button.primaryAxisAlignItems = 'CENTER';
                    button.counterAxisAlignItems = 'CENTER';
                    button.primaryAxisSizingMode = 'AUTO';
                    button.paddingLeft = size.paddingX;
                    button.paddingRight = size.paddingX;
                    button.paddingTop = size.paddingY;
                    button.paddingBottom = size.paddingY;
                    button.itemSpacing = 8;
                    
                    // Add left icon (always add, visibility will be controlled by boolean property)
                    const leftIcon = createIconPlaceholder(state.textColor, size.iconSize);
                    leftIcon.name = "LeftIcon";
                    leftIcon.visible = false; // Default to hidden
                    button.appendChild(leftIcon);
                    
                    // Add text
                    const text = figma.createText();
                    text.fontName = { family: "Inter", style: "Medium" };
                    text.fontSize = size.fontSize;
                    text.characters = buttonText;
                    text.fills = [{ type: 'SOLID', color: state.textColor }];
                    
                    // Add underline for Link variant
                    if (state.textDecoration === 'UNDERLINE') {
                        text.textDecoration = 'UNDERLINE';
                    }
                    
                    button.appendChild(text);
                    
                    // Add right icon (always add, visibility will be controlled by boolean property)
                    const rightIcon = createIconPlaceholder(state.textColor, size.iconSize);
                    rightIcon.name = "RightIcon";
                    rightIcon.visible = false; // Default to hidden
                    button.appendChild(rightIcon);
                    
                    // Add to current page and components array
                    figma.currentPage.appendChild(button);
                    components.push(button);
                    
                    // Move to next button position
                    xOffset += buttonWidth + buttonSpacing;
                }
            }
            
            // Move to next row
            yOffset += size.height + buttonSpacing;
        }
    }
    
    // Combine all components into a component set
    const componentSet = figma.combineAsVariants(components, figma.currentPage);
    componentSet.name = "Button";
    
    // Remove auto-layout and set manual positioning
    componentSet.layoutMode = 'NONE';
    
    // Remove background color
    componentSet.fills = [];
    
    // Add boolean properties for LeftIcon and RightIcon and get their keys
    const leftIconPropKey = componentSet.addComponentProperty("LeftIcon", "BOOLEAN", false);
    const rightIconPropKey = componentSet.addComponentProperty("RightIcon", "BOOLEAN", false);
    
    // Bind boolean properties to icon visibility for all components
    componentSet.children.forEach(component => {
        const leftIconLayer = component.findOne(node => node.name === "LeftIcon");
        const rightIconLayer = component.findOne(node => node.name === "RightIcon");
        
        if (leftIconLayer) {
            leftIconLayer.componentPropertyReferences = { visible: leftIconPropKey };
        }
        
        if (rightIconLayer) {
            rightIconLayer.componentPropertyReferences = { visible: rightIconPropKey };
        }
    });
    
    // Center in viewport
    figma.viewport.scrollAndZoomIntoView([componentSet]);
    
    const totalVariants = sizes.length * variants.length * variants[0].states.length * iconConfigs.length;
    figma.notify(`✅ Button component set created with 3 sizes, 4 variants, 4 states, and icon options (Left/Right)! Total: ${totalVariants} components`);
}

// Function to create input component set
async function createInputComponentSet(placeholder, borderColor, primaryColor, textColor, radius) {
    // Load fonts
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
    await figma.loadFontAsync({ family: "Inter", style: "Medium" });
    
    // Helper to convert hex to RGB
    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16) / 255,
            g: parseInt(result[2], 16) / 255,
            b: parseInt(result[3], 16) / 255
        } : { r: 0, g: 0, b: 0 };
    }

    // Helper to lighten color
    function lightenColor(rgb, amount) {
        return {
            r: Math.min(1, rgb.r + amount),
            g: Math.min(1, rgb.g + amount),
            b: Math.min(1, rgb.b + amount)
        };
    }

    // Helper to create icon placeholder
    function createIconPlaceholder(color, size = 16) {
        const icon = figma.createFrame();
        icon.resize(size, size);
        icon.fills = [];
        icon.name = "Icon";
        
        // Create a simple icon shape (circle)
        const circle = figma.createEllipse();
        circle.resize(size, size);
        circle.fills = [{ type: 'SOLID', color: color }];
        icon.appendChild(circle);
        
        return icon;
    }

    const borderRgb = hexToRgb(borderColor);
    const textRgb = hexToRgb(textColor);
    const primaryRgb = hexToRgb(primaryColor); // Use primary color from UI
    const successRgb = hexToRgb('#10b981');
    const errorRgb = hexToRgb('#ef4444');
    
    const spacing = 20;
    
    // Input states with their configurations
    const states = [
        { 
            name: 'Default', 
            borderColor: borderRgb, 
            borderWidth: 1,
            bgColor: { r: 1, g: 1, b: 1 },
            textColor: textRgb,
            placeholderOpacity: 0.5,
            hasErrorMsg: false
        },
        { 
            name: 'Click', 
            borderColor: primaryRgb, 
            borderWidth: 2,
            bgColor: { r: 1, g: 1, b: 1 },
            textColor: textRgb,
            placeholderOpacity: 0.5,
            hasErrorMsg: false
        },
        { 
            name: 'Error', 
            borderColor: errorRgb, 
            borderWidth: 1,
            bgColor: { r: 1, g: 1, b: 1 },
            textColor: textRgb,
            placeholderOpacity: 0.5,
            hasErrorMsg: true
        },
        { 
            name: 'Success', 
            borderColor: successRgb, 
            borderWidth: 1,
            bgColor: { r: 1, g: 1, b: 1 },
            textColor: textRgb,
            placeholderOpacity: 0.5,
            hasErrorMsg: false
        },
        { 
            name: 'Disabled', 
            borderColor: { r: 0.88, g: 0.88, b: 0.88 }, 
            borderWidth: 1,
            bgColor: { r: 0.98, g: 0.98, b: 0.98 },
            textColor: { r: 0.6, g: 0.6, b: 0.6 },
            placeholderOpacity: 1,
            hasErrorMsg: false
        }
    ];
    
    // Input types with their configurations
    const types = [
        { 
            name: 'Text', 
            placeholder: placeholder,
            height: 40,
            showIcons: true,
            isOTP: false,
            isTextarea: false
        },
        { 
            name: 'Textarea', 
            placeholder: placeholder,
            height: 120,
            showIcons: false,
            isOTP: false,
            isTextarea: true
        },
        { 
            name: 'OTP', 
            placeholder: '0',
            height: 56,
            showIcons: false,
            isOTP: true,
            isTextarea: false,
            digitCount: 4
        }
    ];
    
    // Manual positioning variables
    const inputSpacing = 20;
    let xOffset = 0;
    let yOffset = 0;
    
    // Array to store all components
    const components = [];
    
    // Create input variants for each type and state
    for (const type of types) {
        for (const state of states) {
            // Create wrapper frame for label + input
            const wrapper = figma.createComponent();
            wrapper.name = `Type=${type.name}, State=${state.name}`;
            wrapper.x = xOffset;
            wrapper.y = yOffset;
            wrapper.fills = [];
            
            // Set wrapper auto-layout (vertical) with HUG
            wrapper.layoutMode = 'VERTICAL';
            wrapper.primaryAxisAlignItems = 'MIN';
            wrapper.counterAxisAlignItems = 'MIN';
            wrapper.primaryAxisSizingMode = 'AUTO'; // HUG content
            wrapper.counterAxisSizingMode = 'AUTO'; // HUG content
            wrapper.itemSpacing = 6;
            
            // Add label (will be controlled by boolean property)
            const label = figma.createText();
            label.fontName = { family: "Inter", style: "Medium" };
            label.fontSize = 12;
            label.characters = "Label";
            label.fills = [{ type: 'SOLID', color: state.textColor }];
            label.name = "Label";
            label.visible = false; // Default to hidden
            wrapper.appendChild(label);
            
            // Check if this is an OTP input type
            if (type.isOTP) {
                // Create OTP container with individual boxes
                const otpContainer = figma.createFrame();
                otpContainer.name = "InputField";
                otpContainer.fills = [];
                
                // Set auto-layout for OTP boxes (HUG content)
                otpContainer.layoutMode = 'HORIZONTAL';
                otpContainer.primaryAxisAlignItems = 'CENTER';
                otpContainer.counterAxisAlignItems = 'CENTER';
                otpContainer.primaryAxisSizingMode = 'AUTO'; // HUG content
                otpContainer.counterAxisSizingMode = 'AUTO'; // HUG content
                otpContainer.itemSpacing = 10;
                
                // Create 6 digit boxes (digits 5 and 6 will be hidden by default)
                const boxSize = 48;
                for (let i = 0; i < 6; i++) {
                    const digitBox = figma.createFrame();
                    digitBox.name = `Digit${i + 1}`;
                    digitBox.resize(boxSize, boxSize);
                    
                    // Hide digits 5 and 6 by default (for 4-digit mode)
                    if (i >= 4) {
                        digitBox.visible = false;
                    }
                    
                    // Background
                    digitBox.fills = [{ type: 'SOLID', color: state.bgColor }];
                    digitBox.cornerRadius = 12;
                    
                    // Border
                    digitBox.strokes = [{ type: 'SOLID', color: state.borderColor }];
                    digitBox.strokeWeight = state.borderWidth;
                    
                    // Set auto-layout for centering text
                    digitBox.layoutMode = 'HORIZONTAL';
                    digitBox.primaryAxisAlignItems = 'CENTER';
                    digitBox.counterAxisAlignItems = 'CENTER';
                    digitBox.primaryAxisSizingMode = 'FIXED';
                    
                    // Add digit text
                    const digitText = figma.createText();
                    digitText.fontName = { family: "Inter", style: "Medium" };
                    digitText.fontSize = 20;
                    digitText.characters = type.placeholder;
                    digitText.fills = [{ 
                        type: 'SOLID', 
                        color: state.textColor,
                        opacity: state.placeholderOpacity
                    }];
                    digitText.textAlignHorizontal = 'CENTER';
                    digitText.textAlignVertical = 'CENTER';
                    
                    digitBox.appendChild(digitText);
                    otpContainer.appendChild(digitBox);
                }
                
                wrapper.appendChild(otpContainer);
            } else {
                // Create regular input field frame
                const input = figma.createFrame();
                input.name = "InputField";
                
                // Background
                input.fills = [{ type: 'SOLID', color: state.bgColor }];
                input.cornerRadius = radius;
                
                // Border
                input.strokes = [{ type: 'SOLID', color: state.borderColor }];
                input.strokeWeight = state.borderWidth;
                
                // Create auto-layout for input content with FIXED width
                input.layoutMode = 'HORIZONTAL';
                
                // For textarea, align to top; for text input, center
                if (type.isTextarea) {
                    input.primaryAxisAlignItems = 'MIN'; // Top align for textarea
                    input.counterAxisAlignItems = 'MIN';
                } else {
                    input.primaryAxisAlignItems = 'CENTER';
                    input.counterAxisAlignItems = 'CENTER';
                }
                
                input.primaryAxisSizingMode = 'FIXED'; // Fixed width
                input.counterAxisSizingMode = 'FIXED';
                input.paddingLeft = 12;
                input.paddingRight = 12;
                input.paddingTop = 10;
                input.paddingBottom = 10;
                input.itemSpacing = 8;
                
                // Set fixed width and height
                input.resize(324, type.height);
                
                // Add left icon only if type supports icons
                if (type.showIcons) {
                    const leftIcon = createIconPlaceholder(state.textColor, 16);
                    leftIcon.name = "LeftIcon";
                    leftIcon.visible = false; // Default to hidden
                    input.appendChild(leftIcon);
                }
                
                // Add placeholder text
                const text = figma.createText();
                text.fontName = { family: "Inter", style: "Regular" };
                text.fontSize = 14;
                text.characters = type.placeholder;
                text.textAlignHorizontal = 'LEFT'; // Left align text
                text.textAlignVertical = 'TOP'; // Top align text
                
                // Apply opacity to placeholder text using opacity property on the fill
                text.fills = [{ 
                    type: 'SOLID', 
                    color: state.textColor,
                    opacity: state.placeholderOpacity
                }];
                text.layoutGrow = 1; // Grow to fill available space
                
                input.appendChild(text);
                
                // Add right icon only if type supports icons
                if (type.showIcons) {
                    const rightIcon = createIconPlaceholder(state.textColor, 16);
                    rightIcon.name = "RightIcon";
                    rightIcon.visible = false; // Default to hidden
                    input.appendChild(rightIcon);
                }
                
                wrapper.appendChild(input);
            }
            
            // Add error message if this is the Error state
            if (state.hasErrorMsg) {
                const errorMsg = figma.createText();
                errorMsg.fontName = { family: "Inter", style: "Regular" };
                errorMsg.fontSize = 11;
                errorMsg.characters = "This field has an error";
                errorMsg.fills = [{ type: 'SOLID', color: errorRgb }];
                errorMsg.name = "ErrorMessage";
                wrapper.appendChild(errorMsg);
            }
            
            // Add to current page and components array
            figma.currentPage.appendChild(wrapper);
            components.push(wrapper);
            
            // Move to next position vertically (component height + 24px gap)
            yOffset += wrapper.height + 24;
        }
        
        // Add extra spacing between different types
        yOffset += 24;
    }
    
    // Combine all components into a component set
    const componentSet = figma.combineAsVariants(components, figma.currentPage);
    componentSet.name = "Input";
    
    // Remove auto-layout and set manual positioning
    componentSet.layoutMode = 'NONE';
    
    // Remove background color
    componentSet.fills = [];
    
    // Add boolean properties for Label, LeftIcon, RightIcon, and 6-Digit mode
    const labelPropKey = componentSet.addComponentProperty("Label", "BOOLEAN", false);
    const leftIconPropKey = componentSet.addComponentProperty("LeftIcon", "BOOLEAN", false);
    const rightIconPropKey = componentSet.addComponentProperty("RightIcon", "BOOLEAN", false);
    const sixDigitPropKey = componentSet.addComponentProperty("6-Digit", "BOOLEAN", false);
    
    // Bind boolean properties to visibility for all components
    componentSet.children.forEach(component => {
        const labelLayer = component.findOne(node => node.name === "Label");
        const leftIconLayer = component.findOne(node => node.name === "LeftIcon");
        const rightIconLayer = component.findOne(node => node.name === "RightIcon");
        const digit5Layer = component.findOne(node => node.name === "Digit5");
        const digit6Layer = component.findOne(node => node.name === "Digit6");
        
        if (labelLayer) {
            labelLayer.componentPropertyReferences = { visible: labelPropKey };
        }
        
        if (leftIconLayer) {
            leftIconLayer.componentPropertyReferences = { visible: leftIconPropKey };
        }
        
        if (rightIconLayer) {
            rightIconLayer.componentPropertyReferences = { visible: rightIconPropKey };
        }
        
        // Bind 6-digit mode to digits 5 and 6 visibility
        if (digit5Layer) {
            digit5Layer.componentPropertyReferences = { visible: sixDigitPropKey };
        }
        
        if (digit6Layer) {
            digit6Layer.componentPropertyReferences = { visible: sixDigitPropKey };
        }
    });
    
    // Center in viewport
    figma.viewport.scrollAndZoomIntoView([componentSet]);
    
    const totalVariants = types.length * states.length;
    figma.notify(`✅ Input component set created with ${types.length} types (Text, Textarea, OTP) × ${states.length} states = ${totalVariants} variants! OTP supports 4 or 6 digits via boolean property.`);
}

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

    if (msg.type === 'create-button-component') {
        try {
            await createButtonComponentSet(msg.buttonText, msg.bgColor, msg.textColor, msg.radius);
        } catch (error) {
            figma.notify(`❌ Error creating button component: ${error.message}`);
            console.error('Button component error:', error);
        }
    }

    if (msg.type === 'create-input-component') {
        try {
            await createInputComponentSet(msg.placeholder, msg.borderColor, msg.primaryColor, msg.textColor, msg.radius);
        } catch (error) {
            figma.notify(`❌ Error creating input component: ${error.message}`);
            console.error('Input component error:', error);
        }
    }

    if (msg.type === 'create-variables') {
        try {
            console.log('Received color data:', msg.colors);

            // Validate that we have color data
            if (!msg.colors) {
                throw new Error('No color data received');
            }

            // Get or create a variable collection
            const collections = await figma.variables.getLocalVariableCollectionsAsync();
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
            async function createOrUpdateVariable(name, hexColor, collection) {
                if (!name || !hexColor) {
                    console.warn('Skipping variable - missing name or color:', name, hexColor);
                    return null;
                }

                const rgb = hexToRgb(hexColor);

                // Check if variable already exists
                const existingVariables = await figma.variables.getLocalVariablesAsync('COLOR');
                const existingVar = existingVariables.find(v => v.name === name && v.variableCollectionId === collection.id);

                if (existingVar) {
                    // Update existing variable
                    existingVar.setValueForMode(collection.modes[0].modeId, rgb);
                    return existingVar;
                } else {
                    // Create new variable
                    const variable = figma.variables.createVariable(name, collection, 'COLOR');
                    variable.setValueForMode(collection.modes[0].modeId, rgb);
                    return variable;
                }
            }

            let createdCount = 0;

            // Create variables for each color category
            const colors = msg.colors;

            // Primary colors
            if (colors.primary) {
                for (const [name, value] of Object.entries(colors.primary)) {
                    // Add "Primary/" prefix to group variables
                    const groupedName = `Primary/${name}`;
                    await createOrUpdateVariable(groupedName, value, collection);
                    createdCount++;
                }
            }

            // Secondary colors (if enabled)
            if (colors.secondary) {
                for (const [name, value] of Object.entries(colors.secondary)) {
                    // Add "Secondary/" prefix to group variables
                    const groupedName = `Secondary/${name}`;
                    await createOrUpdateVariable(groupedName, value, collection);
                    createdCount++;
                }
            }

            // Status colors
            if (colors.success) {
                for (const [name, value] of Object.entries(colors.success)) {
                    // Add "Success/" prefix to group variables
                    const groupedName = `Success/${name}`;
                    await createOrUpdateVariable(groupedName, value, collection);
                    createdCount++;
                }
            }

            if (colors.error) {
                for (const [name, value] of Object.entries(colors.error)) {
                    // Add "Error/" prefix to group variables
                    const groupedName = `Error/${name}`;
                    await createOrUpdateVariable(groupedName, value, collection);
                    createdCount++;
                }
            }

            if (colors.warning) {
                for (const [name, value] of Object.entries(colors.warning)) {
                    // Add "Warning/" prefix to group variables
                    const groupedName = `Warning/${name}`;
                    await createOrUpdateVariable(groupedName, value, collection);
                    createdCount++;
                }
            }

            // Neutral colors
            if (colors.neutral) {
                for (const [name, value] of Object.entries(colors.neutral)) {
                    // Add "Neutral/" prefix to group variables
                    const groupedName = `Neutral/${name}`;
                    await createOrUpdateVariable(groupedName, value, collection);
                    createdCount++;
                }
            }

            // Create spacing variables if spacing data exists
            let spacingCollection;
            let spacingCount = 0;
            
            if (msg.spacing && Object.keys(msg.spacing).length > 0) {
                // Get or create spacing variable collection
                const existingSpacingCollection = (await figma.variables.getLocalVariableCollectionsAsync()).find(c => c.name === 'Design System Spacing');
                
                if (existingSpacingCollection) {
                    spacingCollection = existingSpacingCollection;
                } else {
                    spacingCollection = figma.variables.createVariableCollection('Design System Spacing');
                }

                // Create spacing variables
                for (const [name, value] of Object.entries(msg.spacing)) {
                    // Check if variable already exists
                    const existingVariables = await figma.variables.getLocalVariablesAsync('FLOAT');
                    const existingVar = existingVariables.find(v => v.name === name && v.variableCollectionId === spacingCollection.id);

                    if (existingVar) {
                        existingVar.setValueForMode(spacingCollection.modes[0].modeId, value);
                    } else {
                        const variable = figma.variables.createVariable(name, spacingCollection, 'FLOAT');
                        variable.setValueForMode(spacingCollection.modes[0].modeId, value);
                    }
                    spacingCount++;
                }
            }

            // Create radius variables if radius data exists
            let radiusCollection;
            let radiusCount = 0;
            
            if (msg.radius && Object.keys(msg.radius).length > 0) {
                // Get or create radius variable collection
                const existingRadiusCollection = (await figma.variables.getLocalVariableCollectionsAsync()).find(c => c.name === 'Design System Radius');
                
                if (existingRadiusCollection) {
                    radiusCollection = existingRadiusCollection;
                } else {
                    radiusCollection = figma.variables.createVariableCollection('Design System Radius');
                }

                // Create radius variables
                for (const [name, value] of Object.entries(msg.radius)) {
                    // Check if variable already exists
                    const existingVariables = await figma.variables.getLocalVariablesAsync('FLOAT');
                    const existingVar = existingVariables.find(v => v.name === name && v.variableCollectionId === radiusCollection.id);

                    if (existingVar) {
                        existingVar.setValueForMode(radiusCollection.modes[0].modeId, value);
                    } else {
                        const variable = figma.variables.createVariable(name, radiusCollection, 'FLOAT');
                        variable.setValueForMode(radiusCollection.modes[0].modeId, value);
                    }
                    radiusCount++;
                }
            }

            // Create stroke variables if stroke data exists
            let strokeCollection;
            let strokeCount = 0;
            
            if (msg.strokes && Object.keys(msg.strokes).length > 0) {
                // Get or create stroke variable collection
                const existingStrokeCollection = (await figma.variables.getLocalVariableCollectionsAsync()).find(c => c.name === 'Design System Stroke');
                
                if (existingStrokeCollection) {
                    strokeCollection = existingStrokeCollection;
                } else {
                    strokeCollection = figma.variables.createVariableCollection('Design System Stroke');
                }

                // Create stroke variables
                for (const [name, value] of Object.entries(msg.strokes)) {
                    // Check if variable already exists
                    const existingVariables = await figma.variables.getLocalVariablesAsync('FLOAT');
                    const existingVar = existingVariables.find(v => v.name === name && v.variableCollectionId === strokeCollection.id);

                    if (existingVar) {
                        existingVar.setValueForMode(strokeCollection.modes[0].modeId, value);
                    } else {
                        const variable = figma.variables.createVariable(name, strokeCollection, 'FLOAT');
                        variable.setValueForMode(strokeCollection.modes[0].modeId, value);
                    }
                    strokeCount++;
                }
            }

            // Create shadow styles (Figma effect styles)
            let shadowCount = 0;
            if (msg.shadows && Object.keys(msg.shadows).length > 0) {
                console.log('Creating shadow styles:', msg.shadows);
                
                for (const [name, value] of Object.entries(msg.shadows)) {
                    if (value === 'none') {
                        // Skip 'none' shadow
                        console.log('Skipping none shadow');
                        continue;
                    }

                    console.log('Processing shadow:', name, value);

                    // Parse shadow value (e.g., "0 1px 2px rgba(0,0,0,0.05)")
                    const shadowMatch = value.match(/(-?\d+)(?:px)?\s+(-?\d+)(?:px)?\s+(-?\d+)(?:px)?\s+rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
                    
                    if (shadowMatch) {
                        const [, x, y, blur, r, g, b, a] = shadowMatch;
                        console.log('Parsed shadow values:', { x, y, blur, r, g, b, a });
                        
                        try {
                            // Check if style already exists
                            const groupedName = `Shadow/${name.replace('shadow-', '')}`;
                            const existingStyles = await figma.getLocalEffectStylesAsync();
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
                            figma.notify(`❌ Error creating shadow style ${name}: ${error.message}`);
                        }
                    } else {
                        console.warn('Could not parse shadow value:', name, value);
                        figma.notify(`⚠️ Could not parse shadow value for ${name}: ${value}`);
                    }
                }
                
                console.log('Total shadow styles created:', shadowCount);
            }

            // Check if we created any variables or styles
            if (createdCount === 0 && spacingCount === 0 && radiusCount === 0 && strokeCount === 0 && shadowCount === 0) {
                figma.notify('⚠️ No data found to create variables or styles. Please expand sections and ensure tokens are generated.');
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

    if (msg.type === 'get-available-fonts') {
        try {
            const fonts = await figma.listAvailableFontsAsync();
            // Group fonts by family
            const fontsByFamily = {};
            fonts.forEach(font => {
                if (!fontsByFamily[font.fontName.family]) {
                    fontsByFamily[font.fontName.family] = [];
                }
                fontsByFamily[font.fontName.family].push({
                    family: font.fontName.family,
                    style: font.fontName.style
                });
            });
            
            figma.ui.postMessage({
                type: 'available-fonts',
                fonts: fonts.map(f => ({ family: f.fontName.family, style: f.fontName.style }))
            });
        } catch (error) {
            console.error('Error fetching fonts:', error);
        }
    }

    if (msg.type === 'create-text-styles') {
        try {
            const typography = msg.typography;
            
            // Load Inter font for the table
            await figma.loadFontAsync({ family: "Inter", style: "Regular" });
            await figma.loadFontAsync({ family: "Inter", style: "Medium" });
            await figma.loadFontAsync({ family: "Inter", style: "Semi Bold" });
            await figma.loadFontAsync({ family: "Inter", style: "Bold" });
            
            // STEP 1: CREATE FONT NAME VARIABLES
            const collections = await figma.variables.getLocalVariableCollectionsAsync();
            let fontCollection = collections.find(c => c.name === 'Typography/Font Names');
            
            if (!fontCollection) {
                fontCollection = figma.variables.createVariableCollection('Typography/Font Names');
            }
            
            // Create primary font variable
            const existingVars = await figma.variables.getLocalVariablesAsync('STRING');
            let primaryFontVar = existingVars.find(v => v.name === 'font/primary' && v.variableCollectionId === fontCollection.id);
            
            if (!primaryFontVar) {
                primaryFontVar = figma.variables.createVariable('font/primary', fontCollection, 'STRING');
            }
            primaryFontVar.setValueForMode(fontCollection.modes[0].modeId, typography.primaryFont);
            
            // Create secondary font variable if enabled
            let secondaryFontVar = null;
            if (typography.secondaryEnabled && typography.secondaryFont) {
                secondaryFontVar = existingVars.find(v => v.name === 'font/secondary' && v.variableCollectionId === fontCollection.id);
                
                if (!secondaryFontVar) {
                    secondaryFontVar = figma.variables.createVariable('font/secondary', fontCollection, 'STRING');
                }
                secondaryFontVar.setValueForMode(fontCollection.modes[0].modeId, typography.secondaryFont);
            }
            
            // STEP 2: CREATE TEXT STYLES IN FIGMA
            // Get all available fonts
            const availableFonts = await figma.listAvailableFontsAsync();
            
            // Helper function to find the best matching font
            function findBestFont(fontFamily, weight) {
                let matchingFonts = availableFonts.filter(f => f.fontName.family === fontFamily);
                
                if (matchingFonts.length === 0) {
                    matchingFonts = availableFonts.filter(f => 
                        f.fontName.family.toLowerCase() === fontFamily.toLowerCase()
                    );
                }
                
                if (matchingFonts.length === 0) {
                    matchingFonts = availableFonts.filter(f => f.fontName.family === 'Inter');
                }
                
                const weightMap = {
                    100: 'Thin', 200: 'Extra Light', 300: 'Light',
                    400: 'Regular', 500: 'Medium', 600: 'Semi Bold',
                    700: 'Bold', 800: 'Extra Bold', 900: 'Black'
                };
                
                const styleName = weightMap[weight] || 'Regular';
                let font = matchingFonts.find(f => f.fontName.style === styleName);
                
                if (!font) {
                    const altNames = {
                        'Semi Bold': ['Semibold', 'SemiBold', 'Semi-Bold'],
                        'Extra Light': ['ExtraLight', 'Extra-Light'],
                        'Extra Bold': ['ExtraBold', 'Extra-Bold']
                    };
                    
                    if (altNames[styleName]) {
                        for (const altName of altNames[styleName]) {
                            font = matchingFonts.find(f => f.fontName.style === altName);
                            if (font) break;
                        }
                    }
                }
                
                if (!font && matchingFonts.length > 0) {
                    font = matchingFonts[0];
                }
                
                return font ? font.fontName : { family: 'Inter', style: 'Regular' };
            }
            
            let createdStylesCount = 0;
            
            // Define weight variants to create
            const weights = [
                { name: 'Regular', value: 400 },
                { name: 'Medium', value: 500 },
                { name: 'Semibold', value: 600 },
                { name: 'Bold', value: 700 }
            ];
            
            // Create text styles for PRIMARY font with all weight variants
            for (const [key, style] of Object.entries(typography.styles)) {
                const fontFamily = typography.primaryFont;
                
                for (const weight of weights) {
                    const fontName = findBestFont(fontFamily, weight.value);
                    
                    // Load the font
                    await figma.loadFontAsync(fontName);
                    
                    // Create style name: Primary/H1/Regular, Primary/H1/Medium, Primary/H1/Semibold, Primary/H1/Bold
                    const styleName = `Primary/${key.toUpperCase()}/${weight.name}`;
                    
                    // Check if text style already exists
                    const existingStyles = await figma.getLocalTextStylesAsync();
                    let textStyle = existingStyles.find(s => s.name === styleName);
                    
                    if (!textStyle) {
                        textStyle = figma.createTextStyle();
                        textStyle.name = styleName;
                    }
                    
                    // Set text style properties
                    textStyle.fontName = fontName;
                    textStyle.fontSize = style.size;
                    textStyle.lineHeight = { value: style.lineHeight * 100, unit: 'PERCENT' };
                    textStyle.letterSpacing = { value: style.letterSpacing, unit: 'PIXELS' };
                    
                    // Bind font family to variable
                    if (primaryFontVar) {
                        try {
                            textStyle.setBoundVariable('fontFamily', primaryFontVar);
                        } catch (error) {
                            console.log('Note: Font family variable binding not supported in this Figma version');
                        }
                    }
                    
                    createdStylesCount++;
                }
            }
            
            // Create text styles for SECONDARY font with all weight variants (if enabled)
            if (typography.secondaryEnabled && typography.secondaryFont) {
                for (const [key, style] of Object.entries(typography.styles)) {
                    const fontFamily = typography.secondaryFont;
                    
                    for (const weight of weights) {
                        const fontName = findBestFont(fontFamily, weight.value);
                        
                        // Load the font
                        await figma.loadFontAsync(fontName);
                        
                        // Create style name: Secondary/H1/Regular, Secondary/H1/Medium, etc.
                        const styleName = `Secondary/${key.toUpperCase()}/${weight.name}`;
                        
                        // Check if text style already exists
                        const existingStyles = await figma.getLocalTextStylesAsync();
                        let textStyle = existingStyles.find(s => s.name === styleName);
                        
                        if (!textStyle) {
                            textStyle = figma.createTextStyle();
                            textStyle.name = styleName;
                        }
                        
                        // Set text style properties
                        textStyle.fontName = fontName;
                        textStyle.fontSize = style.size;
                        textStyle.lineHeight = { value: style.lineHeight * 100, unit: 'PERCENT' };
                        textStyle.letterSpacing = { value: style.letterSpacing, unit: 'PIXELS' };
                        
                        // Bind font family to variable
                        if (secondaryFontVar) {
                            try {
                                textStyle.setBoundVariable('fontFamily', secondaryFontVar);
                            } catch (error) {
                                console.log('Note: Font family variable binding not supported in this Figma version');
                            }
                        }
                        
                        createdStylesCount++;
                    }
                }
            }
            
            // STEP 3: CREATE TYPOGRAPHY TABLES WITH AUTO LAYOUT
            // Helper function to create a typography table
            function createTypographyTable(title, fontFamily, styles, yPosition) {
                const cellWidth = 150;
                const cellHeight = 60;
                const padding = 16;
                
                const categories = Object.keys(styles);
                const rowLabels = ['Category', 'Font Size', 'Line Height', 'Letter Spacing'];
                
                // Create main container frame with auto layout
                const container = figma.createFrame();
                container.name = title;
                container.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
                container.layoutMode = 'VERTICAL';
                container.primaryAxisSizingMode = 'AUTO';
                container.counterAxisSizingMode = 'AUTO';
                container.paddingLeft = padding;
                container.paddingRight = padding;
                container.paddingTop = padding;
                container.paddingBottom = padding;
                container.itemSpacing = 16;
                container.y = yPosition;
                
                // Add title
                const titleText = figma.createText();
                titleText.fontName = { family: "Inter", style: "Bold" };
                titleText.fontSize = 20;
                titleText.characters = title;
                titleText.fills = [{ type: 'SOLID', color: { r: 0.1, g: 0.1, b: 0.1 } }];
                container.appendChild(titleText);
                
                // Add font family subtitle
                const subtitleText = figma.createText();
                subtitleText.fontName = { family: "Inter", style: "Regular" };
                subtitleText.fontSize = 13;
                subtitleText.characters = `Font: ${fontFamily}`;
                subtitleText.fills = [{ type: 'SOLID', color: { r: 0.5, g: 0.5, b: 0.5 } }];
                container.appendChild(subtitleText);
                
                // Create table with auto layout
                const table = figma.createFrame();
                table.name = "Table";
                table.fills = [];
                table.layoutMode = 'VERTICAL';
                table.primaryAxisSizingMode = 'AUTO';
                table.counterAxisSizingMode = 'AUTO';
                table.itemSpacing = 0;
                
                // Create rows
                for (let row = 0; row < 4; row++) {
                    // Create row frame with auto layout
                    const rowFrame = figma.createFrame();
                    rowFrame.name = `Row ${row}`;
                    rowFrame.fills = [];
                    rowFrame.layoutMode = 'HORIZONTAL';
                    rowFrame.primaryAxisSizingMode = 'AUTO';
                    rowFrame.counterAxisSizingMode = 'AUTO';
                    rowFrame.itemSpacing = 0;
                    
                    // Create cells in row
                    for (let col = 0; col < categories.length + 1; col++) {
                        // Create cell frame
                        const cell = figma.createFrame();
                        cell.name = `Cell ${row}-${col}`;
                        cell.resize(cellWidth, cellHeight);
                        cell.layoutMode = 'HORIZONTAL';
                        cell.primaryAxisAlignItems = 'CENTER';
                        cell.counterAxisAlignItems = 'CENTER';
                        cell.primaryAxisSizingMode = 'FIXED';
                        cell.counterAxisSizingMode = 'FIXED';
                        
                        // Style cells
                        if (row === 0) {
                            cell.fills = [{ type: 'SOLID', color: { r: 0.95, g: 0.95, b: 0.97 } }];
                        } else if (col === 0) {
                            cell.fills = [{ type: 'SOLID', color: { r: 0.98, g: 0.98, b: 0.99 } }];
                        } else {
                            cell.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
                        }
                        
                        cell.strokes = [{ type: 'SOLID', color: { r: 0.9, g: 0.9, b: 0.92 } }];
                        cell.strokeWeight = 1;
                        
                        // Create cell text
                        const text = figma.createText();
                        text.layoutGrow = 1;
                        text.textAlignHorizontal = 'CENTER';
                        text.textAlignVertical = 'CENTER';
                        
                        if (col === 0) {
                            // Row label
                            text.fontName = { family: "Inter", style: "Semi Bold" };
                            text.fontSize = 13;
                            text.characters = rowLabels[row];
                            text.fills = [{ type: 'SOLID', color: { r: 0.2, g: 0.2, b: 0.2 } }];
                        } else {
                            const category = categories[col - 1];
                            const styleData = styles[category];
                            
                            if (row === 0) {
                                // Category name
                                text.fontName = { family: "Inter", style: "Bold" };
                                text.fontSize = 14;
                                text.characters = category.toUpperCase();
                                text.fills = [{ type: 'SOLID', color: { r: 0.1, g: 0.1, b: 0.1 } }];
                            } else if (row === 1) {
                                // Font Size
                                text.fontName = { family: "Inter", style: "Medium" };
                                text.fontSize = 12;
                                text.characters = `${styleData.size}px`;
                                text.fills = [{ type: 'SOLID', color: { r: 0.3, g: 0.3, b: 0.3 } }];
                            } else if (row === 2) {
                                // Line Height
                                text.fontName = { family: "Inter", style: "Medium" };
                                text.fontSize = 12;
                                const lineHeightPercent = Math.round(styleData.lineHeight * 100);
                                text.characters = `${lineHeightPercent}%`;
                                text.fills = [{ type: 'SOLID', color: { r: 0.3, g: 0.3, b: 0.3 } }];
                            } else if (row === 3) {
                                // Letter Spacing
                                text.fontName = { family: "Inter", style: "Medium" };
                                text.fontSize = 12;
                                text.characters = `${styleData.letterSpacing}px`;
                                text.fills = [{ type: 'SOLID', color: { r: 0.3, g: 0.3, b: 0.3 } }];
                            }
                        }
                        
                        cell.appendChild(text);
                        rowFrame.appendChild(cell);
                    }
                    
                    table.appendChild(rowFrame);
                }
                
                container.appendChild(table);
                return container;
            }
            
            const frames = [];
            let currentY = 0;
            
            // Create PRIMARY font table
            const primaryFrame = createTypographyTable(
                "Primary Typography",
                typography.primaryFont,
                typography.styles,
                currentY
            );
            figma.currentPage.appendChild(primaryFrame);
            frames.push(primaryFrame);
            currentY += primaryFrame.height + 40;
            
            // Create SECONDARY font table (if enabled)
            if (typography.secondaryEnabled && typography.secondaryFont) {
                const secondaryFrame = createTypographyTable(
                    "Secondary Typography",
                    typography.secondaryFont,
                    typography.styles,
                    currentY
                );
                figma.currentPage.appendChild(secondaryFrame);
                frames.push(secondaryFrame);
            }
            
            if (frames.length === 0) {
                figma.notify('⚠️ No typography styles found in data.');
                return;
            }
            
            // Center all frames in viewport
            figma.viewport.scrollAndZoomIntoView(frames);
            
            const tableCount = frames.length;
            figma.notify(`✅ Created ${createdStylesCount} text styles and ${tableCount} typography table(s)!`);
        } catch (error) {
            figma.notify(`❌ Error creating text styles: ${error.message}`);
            console.error('Text styles error:', error);
        }
    }
};
