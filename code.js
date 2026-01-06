// Figma plugin backend code
// Import icon data
// Note: In Figma plugins, we need to pass icon data through the UI
figma.showUI(__html__, { width: 424, height: 700, themeColors: true });

// Helper function to safely set text characters
function safeSetCharacters(textNode, value) {
    const stringValue = String(value || '');
    if (stringValue.trim() === '') {
        textNode.characters = ' '; // Set to space if empty
    } else {
        textNode.characters = stringValue;
    }
}

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

    // Helper to create icon component from SVG
    function createIconComponent(svgString, name, color, size = 16) {
        const iconComponent = figma.createComponent();
        iconComponent.name = name;
        iconComponent.resize(size, size);
        iconComponent.fills = [];

        const svgNode = figma.createNodeFromSvg(svgString);

        // Resize to fit
        const scaleX = size / svgNode.width;
        const scaleY = size / svgNode.height;
        const scale = Math.min(scaleX, scaleY);
        svgNode.resize(svgNode.width * scale, svgNode.height * scale);

        // Center the SVG
        svgNode.x = (size - svgNode.width) / 2;
        svgNode.y = (size - svgNode.height) / 2;

        // Apply color to all vector paths (both fills and strokes for line icons)
        function applyColorToNode(node) {
            if (node.type === 'VECTOR') {
                // Apply fill color if the node has fills
                if (node.fills && node.fills !== figma.mixed && node.fills.length > 0) {
                    node.fills = [{ type: 'SOLID', color: color }];
                }
                // Apply stroke color if the node has strokes (for line icons)
                if (node.strokes && node.strokes !== figma.mixed && node.strokes.length > 0) {
                    node.strokes = [{ type: 'SOLID', color: color }];
                }
            }
            if ('children' in node) {
                node.children.forEach(child => applyColorToNode(child));
            }
        }
        applyColorToNode(svgNode);

        // Flatten the SVG node - move all vector children directly to component
        if (svgNode.type === 'FRAME' || svgNode.type === 'GROUP') {
            const children = [...svgNode.children];
            children.forEach(child => {
                // Adjust child position relative to component
                child.x += svgNode.x;
                child.y += svgNode.y;
                iconComponent.appendChild(child);
            });
            svgNode.remove();
        } else {
            iconComponent.appendChild(svgNode);
        }

        return iconComponent;
    }

    // Vuesax arrow icons SVG strings (Line/Outline style)
    const arrowLeftSVG = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M9.57 5.92993L3.5 11.9999L9.57 18.0699" stroke="#292D32" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M20.5 12H3.67" stroke="#292D32" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

    const arrowRightSVG = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M14.43 5.92993L20.5 11.9999L14.43 18.0699" stroke="#292D32" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M3.5 12H20.33" stroke="#292D32" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

    // Create icon components (will be created once and reused)
    const baseRgb = hexToRgb(bgColor);
    const textRgb = hexToRgb(textColor);

    // Create icon components (will be created once and reused)
    const leftIconComponent = createIconComponent(arrowLeftSVG, "Icon/arrow-left", textRgb, 16);
    const rightIconComponent = createIconComponent(arrowRightSVG, "Icon/arrow-right", textRgb, 16);

    // Add icon components to page (they need to be on the page to create instances)
    figma.currentPage.appendChild(leftIconComponent);
    figma.currentPage.appendChild(rightIconComponent);

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

    // Array to store all components
    const components = [];

    // Spacing configuration
    const buttonWidth = 140;
    const componentSpacing = 16;
    const sizeGroupSpacing = 32;
    let xOffset = 0;
    let yOffset = 0;

    // Create variants organized exactly like the image:
    // For each size: create a grid with variants as rows and states as columns
    for (const size of sizes) {
        xOffset = 0; // Reset x for each size group

        for (const variant of variants) {
            xOffset = 0; // Reset x for each variant row

            for (const state of variant.states) {
                for (const iconConfig of iconConfigs) {
                    // Create button component
                    const button = figma.createComponent();
                    button.name = `Size=${size.name}, Variant=${variant.name}, State=${state.name}`;
                    button.resize(buttonWidth, size.height);
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

                    // Add left icon
                    const leftIcon = leftIconComponent.createInstance();
                    leftIcon.name = "LeftIcon";
                    leftIcon.resize(size.iconSize, size.iconSize);
                    leftIcon.visible = false;

                    // Apply the correct color to the icon
                    function applyColorToIconInstance(iconInstance, color) {
                        iconInstance.children.forEach(child => {
                            if (child.type === 'VECTOR') {
                                if (child.fills && child.fills !== figma.mixed && child.fills.length > 0) {
                                    child.fills = [{ type: 'SOLID', color: color }];
                                }
                                if (child.strokes && child.strokes !== figma.mixed && child.strokes.length > 0) {
                                    child.strokes = [{ type: 'SOLID', color: color }];
                                }
                            }
                        });
                    }

                    applyColorToIconInstance(leftIcon, state.textColor);
                    button.appendChild(leftIcon);

                    // Add text
                    const text = figma.createText();
                    text.fontName = { family: "Inter", style: "Medium" };
                    text.fontSize = size.fontSize;
                    text.characters = buttonText;
                    text.fills = [{ type: 'SOLID', color: state.textColor }];

                    if (state.textDecoration === 'UNDERLINE') {
                        text.textDecoration = 'UNDERLINE';
                    }

                    button.appendChild(text);

                    // Add right icon
                    const rightIcon = rightIconComponent.createInstance();
                    rightIcon.name = "RightIcon";
                    rightIcon.resize(size.iconSize, size.iconSize);
                    rightIcon.visible = false;

                    applyColorToIconInstance(rightIcon, state.textColor);
                    button.appendChild(rightIcon);

                    // Add to current page and components array
                    figma.currentPage.appendChild(button);
                    components.push(button);

                    // Move to next column (state)
                    xOffset += buttonWidth + componentSpacing;
                }
            }

            // Move to next row (variant)
            yOffset += size.height + componentSpacing;
        }

        // Add extra spacing between size groups
        yOffset += sizeGroupSpacing;
    }

    // Combine all components into a component set
    const componentSet = figma.combineAsVariants(components, figma.currentPage);
    componentSet.name = "Button";

    // Remove auto-layout - use manual positioning
    componentSet.layoutMode = 'NONE';

    // Remove background
    componentSet.fills = [];

    // Create a containing frame for the entire button system
    const containerFrame = figma.createFrame();
    containerFrame.name = "🎨 Button Component System";

    // Calculate container size based on component set
    const containerWidth = componentSet.width + 128;
    const containerHeight = componentSet.height + 200;
    containerFrame.resize(containerWidth, containerHeight);

    // Set container styling
    containerFrame.fills = [{
        type: 'SOLID',
        color: { r: 0.97, g: 0.97, b: 0.98 }
    }];
    containerFrame.cornerRadius = 12;

    // Apply auto-layout to container
    containerFrame.layoutMode = 'VERTICAL';
    containerFrame.primaryAxisSizingMode = 'AUTO';
    containerFrame.counterAxisSizingMode = 'AUTO';
    containerFrame.primaryAxisAlignItems = 'MIN';
    containerFrame.counterAxisAlignItems = 'MIN';
    containerFrame.itemSpacing = 34;
    containerFrame.paddingLeft = 48;
    containerFrame.paddingRight = 48;
    containerFrame.paddingTop = 40;
    containerFrame.paddingBottom = 40;

    // Add title section
    const titleFrame = figma.createFrame();
    titleFrame.name = "Title";
    titleFrame.layoutMode = 'VERTICAL';
    titleFrame.primaryAxisSizingMode = 'AUTO';
    titleFrame.counterAxisSizingMode = 'AUTO';
    titleFrame.primaryAxisAlignItems = 'MIN';
    titleFrame.counterAxisAlignItems = 'MIN';
    titleFrame.itemSpacing = 8;
    titleFrame.fills = [];

    const titleText = figma.createText();
    await figma.loadFontAsync({ family: "Inter", style: "Bold" });
    titleText.fontName = { family: "Inter", style: "Bold" };
    titleText.fontSize = 28;
    titleText.characters = "Button Component";
    titleText.fills = [{ type: 'SOLID', color: { r: 0.1, g: 0.1, b: 0.1 } }];
    titleText.textAlignHorizontal = 'LEFT';
    titleFrame.appendChild(titleText);

    const subtitleText = figma.createText();
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
    subtitleText.fontName = { family: "Inter", style: "Regular" };
    subtitleText.fontSize = 14;
    subtitleText.characters = "3 Variants • 3 Sizes • 4 States • Swappable Icons";
    subtitleText.fills = [{ type: 'SOLID', color: { r: 0.5, g: 0.5, b: 0.5 } }];
    subtitleText.textAlignHorizontal = 'LEFT';
    titleFrame.appendChild(subtitleText);

    // Add to page
    figma.currentPage.appendChild(containerFrame);
    containerFrame.appendChild(titleFrame);
    containerFrame.appendChild(componentSet);

    // Position icon components in a separate organized frame
    const iconsFrame = figma.createFrame();
    iconsFrame.name = "🎯 Icons";
    iconsFrame.layoutMode = 'HORIZONTAL';
    iconsFrame.primaryAxisSizingMode = 'AUTO';
    iconsFrame.counterAxisSizingMode = 'AUTO';
    iconsFrame.itemSpacing = 16;
    iconsFrame.paddingLeft = 24;
    iconsFrame.paddingRight = 24;
    iconsFrame.paddingTop = 24;
    iconsFrame.paddingBottom = 24;
    iconsFrame.fills = [{
        type: 'SOLID',
        color: { r: 0.95, g: 0.95, b: 0.96 }
    }];
    iconsFrame.cornerRadius = 12;

    figma.currentPage.appendChild(iconsFrame);
    iconsFrame.appendChild(leftIconComponent);
    iconsFrame.appendChild(rightIconComponent);

    // Position icons frame next to container
    iconsFrame.x = containerFrame.x + containerFrame.width + 40;
    iconsFrame.y = containerFrame.y;

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
    figma.viewport.scrollAndZoomIntoView([containerFrame, iconsFrame]);

    const totalVariants = sizes.length * variants.length * variants[0].states.length * iconConfigs.length;
    figma.notify(`✅ Button Component System created! ${totalVariants} variants with clean, organized layout`);
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

    // Convert colors first before using them
    const borderRgb = hexToRgb(borderColor);
    const textRgb = hexToRgb(textColor);
    const primaryRgb = hexToRgb(primaryColor);
    const successRgb = hexToRgb('#10b981');
    const errorRgb = hexToRgb('#ef4444');

    // Helper to create icon component from SVG (line style)
    function createIconComponent(svgString, name, color, size = 16) {
        const iconComponent = figma.createComponent();
        iconComponent.name = name;
        iconComponent.resize(size, size);
        iconComponent.fills = [];

        const svgNode = figma.createNodeFromSvg(svgString);

        // Resize to fit
        const scaleX = size / svgNode.width;
        const scaleY = size / svgNode.height;
        const scale = Math.min(scaleX, scaleY);
        svgNode.resize(svgNode.width * scale, svgNode.height * scale);

        // Center the SVG
        svgNode.x = (size - svgNode.width) / 2;
        svgNode.y = (size - svgNode.height) / 2;

        // Apply color to all vector paths (both fills and strokes for line icons)
        function applyColorToNode(node) {
            if (node.type === 'VECTOR') {
                // Apply fill color if the node has fills
                if (node.fills && node.fills !== figma.mixed && node.fills.length > 0) {
                    node.fills = [{ type: 'SOLID', color: color }];
                }
                // Apply stroke color if the node has strokes (for line icons)
                if (node.strokes && node.strokes !== figma.mixed && node.strokes.length > 0) {
                    node.strokes = [{ type: 'SOLID', color: color }];
                }
            }
            if ('children' in node) {
                node.children.forEach(child => applyColorToNode(child));
            }
        }
        applyColorToNode(svgNode);

        // Flatten the SVG node - move all vector children directly to component
        if (svgNode.type === 'FRAME' || svgNode.type === 'GROUP') {
            const children = [...svgNode.children];
            children.forEach(child => {
                // Adjust child position relative to component
                child.x += svgNode.x;
                child.y += svgNode.y;
                iconComponent.appendChild(child);
            });
            svgNode.remove();
        } else {
            iconComponent.appendChild(svgNode);
        }

        return iconComponent;
    }

    // Line-style icons for input fields
    const searchIconSVG = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z" stroke="#292D32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M22 22L20 20" stroke="#292D32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

    const closeIconSVG = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z" stroke="#292D32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M9.16998 14.83L14.83 9.17004" stroke="#292D32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M14.83 14.83L9.16998 9.17004" stroke="#292D32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

    // Create icon components
    const searchIconComponent = createIconComponent(searchIconSVG, "Icon/search", textRgb, 16);
    const closeIconComponent = createIconComponent(closeIconSVG, "Icon/close", textRgb, 16);

    // Add icon components to page
    figma.currentPage.appendChild(searchIconComponent);
    figma.currentPage.appendChild(closeIconComponent);

    // Helper function to apply color to icon instances
    function applyColorToIconInstance(iconInstance, color) {
        iconInstance.children.forEach(child => {
            if (child.type === 'VECTOR') {
                // Apply fill color if exists
                if (child.fills && child.fills !== figma.mixed && child.fills.length > 0) {
                    child.fills = [{ type: 'SOLID', color: color }];
                }
                // Apply stroke color if exists (for line icons)
                if (child.strokes && child.strokes !== figma.mixed && child.strokes.length > 0) {
                    child.strokes = [{ type: 'SOLID', color: color }];
                }
            }
        });
    }

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
                    const leftIcon = searchIconComponent.createInstance();
                    leftIcon.name = "LeftIcon";
                    leftIcon.resize(16, 16);
                    leftIcon.visible = false; // Default to hidden

                    applyColorToIconInstance(leftIcon, state.textColor);
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
                    const rightIcon = closeIconComponent.createInstance();
                    rightIcon.name = "RightIcon";
                    rightIcon.resize(16, 16);
                    rightIcon.visible = false; // Default to hidden

                    applyColorToIconInstance(rightIcon, state.textColor);
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

    // Create a containing frame for the entire input system
    const containerFrame = figma.createFrame();
    containerFrame.name = "🎨 Input Component System";

    // Calculate container size based on component set
    const containerWidth = componentSet.width + 128;
    const containerHeight = componentSet.height + 200;
    containerFrame.resize(containerWidth, containerHeight);

    // Set container styling
    containerFrame.fills = [{
        type: 'SOLID',
        color: { r: 0.97, g: 0.97, b: 0.98 }
    }];
    containerFrame.cornerRadius = 12;

    // Apply auto-layout to container
    containerFrame.layoutMode = 'VERTICAL';
    containerFrame.primaryAxisSizingMode = 'AUTO';
    containerFrame.counterAxisSizingMode = 'AUTO';
    containerFrame.primaryAxisAlignItems = 'MIN';
    containerFrame.counterAxisAlignItems = 'MIN';
    containerFrame.itemSpacing = 34;
    containerFrame.paddingLeft = 48;
    containerFrame.paddingRight = 48;
    containerFrame.paddingTop = 40;
    containerFrame.paddingBottom = 40;

    // Add title section
    const titleFrame = figma.createFrame();
    titleFrame.name = "Title";
    titleFrame.layoutMode = 'VERTICAL';
    titleFrame.primaryAxisSizingMode = 'AUTO';
    titleFrame.counterAxisSizingMode = 'AUTO';
    titleFrame.primaryAxisAlignItems = 'MIN';
    titleFrame.counterAxisAlignItems = 'MIN';
    titleFrame.itemSpacing = 8;
    titleFrame.fills = [];

    const titleText = figma.createText();
    await figma.loadFontAsync({ family: "Inter", style: "Bold" });
    titleText.fontName = { family: "Inter", style: "Bold" };
    titleText.fontSize = 28;
    titleText.characters = "Input Component";
    titleText.fills = [{ type: 'SOLID', color: { r: 0.1, g: 0.1, b: 0.1 } }];
    titleText.textAlignHorizontal = 'LEFT';
    titleFrame.appendChild(titleText);

    const subtitleText = figma.createText();
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
    subtitleText.fontName = { family: "Inter", style: "Regular" };
    subtitleText.fontSize = 14;
    subtitleText.characters = "3 Types • 5 States • Label & Icons • OTP Support";
    subtitleText.fills = [{ type: 'SOLID', color: { r: 0.5, g: 0.5, b: 0.5 } }];
    subtitleText.textAlignHorizontal = 'LEFT';
    titleFrame.appendChild(subtitleText);

    // Add to page
    figma.currentPage.appendChild(containerFrame);
    containerFrame.appendChild(titleFrame);
    containerFrame.appendChild(componentSet);

    // Position icon components in a separate organized frame
    const iconsFrame = figma.createFrame();
    iconsFrame.name = "🎯 Icons";
    iconsFrame.layoutMode = 'HORIZONTAL';
    iconsFrame.primaryAxisSizingMode = 'AUTO';
    iconsFrame.counterAxisSizingMode = 'AUTO';
    iconsFrame.itemSpacing = 16;
    iconsFrame.paddingLeft = 24;
    iconsFrame.paddingRight = 24;
    iconsFrame.paddingTop = 24;
    iconsFrame.paddingBottom = 24;
    iconsFrame.fills = [{
        type: 'SOLID',
        color: { r: 0.95, g: 0.95, b: 0.96 }
    }];
    iconsFrame.cornerRadius = 12;

    figma.currentPage.appendChild(iconsFrame);
    iconsFrame.appendChild(searchIconComponent);
    iconsFrame.appendChild(closeIconComponent);

    // Position icons frame next to container
    iconsFrame.x = containerFrame.x + containerFrame.width + 40;
    iconsFrame.y = containerFrame.y;

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
    figma.viewport.scrollAndZoomIntoView([containerFrame, iconsFrame]);

    const totalVariants = types.length * states.length;
    figma.notify(`✅ Input Component System created! ${totalVariants} variants with clean, organized layout`);
}

// Handle messages from the UI
figma.ui.onmessage = async (msg) => {
    if (msg.type === 'resize-window') {
        figma.ui.resize(msg.width, msg.height);
    }

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

            // Check if "Design System Tokens" collection exists
            const existingCollection = collections.find(c => c.name === 'Design System Tokens');

            if (existingCollection) {
                collection = existingCollection;

                // Check if Dark mode exists, if not add it
                const hasDarkMode = collection.modes.some(mode => mode.name === 'Dark');
                if (!hasDarkMode) {
                    collection.addMode('Dark');
                }
            } else {
                collection = figma.variables.createVariableCollection('Design System Tokens');
                // Rename default mode to Light
                collection.renameMode(collection.modes[0].modeId, 'Light');
                // Add Dark mode
                collection.addMode('Dark');
            }

            // Get mode IDs
            const lightModeId = collection.modes.find(m => m.name === 'Light').modeId;
            const darkModeId = collection.modes.find(m => m.name === 'Dark').modeId;

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

            // Helper function to create or update a variable with both light and dark modes
            async function createOrUpdateVariable(name, hexColorLight, hexColorDark, collection, lightModeId, darkModeId) {
                if (!name || !hexColorLight) {
                    console.warn('Skipping variable - missing name or color:', name, hexColorLight);
                    return null;
                }

                const rgbLight = hexToRgb(hexColorLight);
                const rgbDark = hexToRgb(hexColorDark || hexColorLight);

                // Check if variable already exists
                const existingVariables = await figma.variables.getLocalVariablesAsync('COLOR');
                const existingVar = existingVariables.find(v => v.name === name && v.variableCollectionId === collection.id);

                if (existingVar) {
                    // Update existing variable
                    existingVar.setValueForMode(lightModeId, rgbLight);
                    existingVar.setValueForMode(darkModeId, rgbDark);
                    return existingVar;
                } else {
                    // Create new variable
                    const variable = figma.variables.createVariable(name, collection, 'COLOR');
                    variable.setValueForMode(lightModeId, rgbLight);
                    variable.setValueForMode(darkModeId, rgbDark);
                    return variable;
                }
            }

            let createdCount = 0;

            // Create variables for each color category
            const colors = msg.colors;

            // Primary colors - dynamically create variables based on actual shades
            if (colors.primary && colors.primary.light) {
                const lightColors = colors.primary.light;
                const darkColors = colors.primary.dark || lightColors; // Fallback to light if dark not provided

                const primaryKeys = Object.keys(lightColors);
                const lightValues = Object.values(lightColors);
                const darkValues = Object.values(darkColors);

                console.log(`Creating ${primaryKeys.length} primary color variables`);

                for (let i = 0; i < primaryKeys.length; i++) {
                    const name = primaryKeys[i];
                    const lightValue = lightValues[i];
                    const darkValue = darkValues[i] || lightValue; // Use light value if dark not available

                    // Strip prefix from name (e.g., "primary-50" -> "50")
                    const cleanName = name.replace(/^primary-/, '');
                    const groupedName = `primary/${cleanName}`;
                    await createOrUpdateVariable(groupedName, lightValue, darkValue, collection, lightModeId, darkModeId);
                    createdCount++;
                }
            }

            // Secondary colors (if enabled) - dynamically create variables based on actual shades
            if (colors.secondary && colors.secondary.light) {
                const lightColors = colors.secondary.light;
                const darkColors = colors.secondary.dark || lightColors; // Fallback to light if dark not provided

                const secondaryKeys = Object.keys(lightColors);
                const lightValues = Object.values(lightColors);
                const darkValues = Object.values(darkColors);

                console.log(`Creating ${secondaryKeys.length} secondary color variables`);

                for (let i = 0; i < secondaryKeys.length; i++) {
                    const name = secondaryKeys[i];
                    const lightValue = lightValues[i];
                    const darkValue = darkValues[i] || lightValue; // Use light value if dark not available

                    // Strip prefix from name (e.g., "secondary-100" -> "100")
                    const cleanName = name.replace(/^secondary-/, '');
                    const groupedName = `secondary/${cleanName}`;
                    await createOrUpdateVariable(groupedName, lightValue, darkValue, collection, lightModeId, darkModeId);
                    createdCount++;
                }
            }

            // Status colors - dynamically create variables based on actual shades
            if (colors.success) {
                const successKeys = Object.keys(colors.success);
                const successValues = Object.values(colors.success);

                console.log(`Creating ${successKeys.length} success color variables`);

                for (let i = 0; i < successKeys.length; i++) {
                    const name = successKeys[i];
                    const value = successValues[i];
                    // Strip prefix from name (e.g., "success-light" -> "light")
                    const cleanName = name.replace(/^success-/, '');
                    const groupedName = `success/${cleanName}`;
                    await createOrUpdateVariable(groupedName, value, value, collection, lightModeId, darkModeId);
                    createdCount++;
                }
            }

            if (colors.error) {
                const errorKeys = Object.keys(colors.error);
                const errorValues = Object.values(colors.error);

                console.log(`Creating ${errorKeys.length} error color variables`);

                for (let i = 0; i < errorKeys.length; i++) {
                    const name = errorKeys[i];
                    const value = errorValues[i];
                    // Strip prefix from name (e.g., "error-default" -> "default")
                    const cleanName = name.replace(/^error-/, '');
                    const groupedName = `error/${cleanName}`;
                    await createOrUpdateVariable(groupedName, value, value, collection, lightModeId, darkModeId);
                    createdCount++;
                }
            }

            if (colors.warning) {
                const warningKeys = Object.keys(colors.warning);
                const warningValues = Object.values(colors.warning);

                console.log(`Creating ${warningKeys.length} warning color variables`);

                for (let i = 0; i < warningKeys.length; i++) {
                    const name = warningKeys[i];
                    const value = warningValues[i];
                    // Strip prefix from name (e.g., "warning-dark" -> "dark")
                    const cleanName = name.replace(/^warning-/, '');
                    const groupedName = `warning/${cleanName}`;
                    await createOrUpdateVariable(groupedName, value, value, collection, lightModeId, darkModeId);
                    createdCount++;
                }
            }

            // Info colors - dynamically create variables based on actual shades
            if (colors.info) {
                const infoKeys = Object.keys(colors.info);
                const infoValues = Object.values(colors.info);

                console.log(`Creating ${infoKeys.length} info color variables`);

                for (let i = 0; i < infoKeys.length; i++) {
                    const name = infoKeys[i];
                    const value = infoValues[i];
                    // Strip prefix from name (e.g., "info-50" -> "50")
                    const cleanName = name.replace(/^info-/, '');
                    const groupedName = `info/${cleanName}`;
                    await createOrUpdateVariable(groupedName, value, value, collection, lightModeId, darkModeId);
                    createdCount++;
                }
            }

            // Neutral colors - dynamically create variables based on actual shades
            if (colors.neutral && colors.neutral.light) {
                const lightColors = colors.neutral.light;
                const darkColors = colors.neutral.dark || lightColors; // Fallback to light if dark not provided

                const neutralKeys = Object.keys(lightColors);
                const lightValues = Object.values(lightColors);
                const darkValues = Object.values(darkColors);

                console.log(`Creating ${neutralKeys.length} neutral color variables`);

                for (let i = 0; i < neutralKeys.length; i++) {
                    const name = neutralKeys[i];
                    const lightValue = lightValues[i];
                    const darkValue = darkValues[i] || lightValue; // Use light value if dark not available

                    // Strip prefix from name (e.g., "neutral-50" -> "50")
                    const cleanName = name.replace(/^neutral-/, '');
                    const groupedName = `neutral/${cleanName}`;
                    await createOrUpdateVariable(groupedName, lightValue, darkValue, collection, lightModeId, darkModeId);
                    createdCount++;
                }
            }

            // Create spacing variables with responsive modes (Desktop, Tablet, Mobile)
            let spacingCollection;
            let spacingCount = 0;

            if (msg.spacing && Object.keys(msg.spacing).length > 0) {
                // Get or create spacing variable collection
                const existingSpacingCollection = (await figma.variables.getLocalVariableCollectionsAsync()).find(c => c.name === 'Design System Spacing');

                if (existingSpacingCollection) {
                    spacingCollection = existingSpacingCollection;

                    // Ensure all three modes exist
                    const hasDesktop = spacingCollection.modes.some(m => m.name === 'Desktop');
                    const hasTablet = spacingCollection.modes.some(m => m.name === 'Tablet');
                    const hasMobile = spacingCollection.modes.some(m => m.name === 'Mobile');

                    if (!hasDesktop) {
                        spacingCollection.renameMode(spacingCollection.modes[0].modeId, 'Desktop');
                    }
                    if (!hasTablet) {
                        spacingCollection.addMode('Tablet');
                    }
                    if (!hasMobile) {
                        spacingCollection.addMode('Mobile');
                    }
                } else {
                    spacingCollection = figma.variables.createVariableCollection('Design System Spacing');
                    spacingCollection.renameMode(spacingCollection.modes[0].modeId, 'Desktop');
                    spacingCollection.addMode('Tablet');
                    spacingCollection.addMode('Mobile');
                }

                const desktopModeId = spacingCollection.modes.find(m => m.name === 'Desktop').modeId;
                const tabletModeId = spacingCollection.modes.find(m => m.name === 'Tablet').modeId;
                const mobileModeId = spacingCollection.modes.find(m => m.name === 'Mobile').modeId;

                // Create spacing variables
                for (const [name, valueData] of Object.entries(msg.spacing)) {
                    const existingVariables = await figma.variables.getLocalVariablesAsync('FLOAT');
                    const existingVar = existingVariables.find(v => v.name === name && v.variableCollectionId === spacingCollection.id);

                    // Handle both old format (number) and new format (object with desktop/tablet/mobile)
                    const desktopValue = typeof valueData === 'object' ? valueData.desktop : valueData;
                    const tabletValue = typeof valueData === 'object' ? valueData.tablet : valueData;
                    const mobileValue = typeof valueData === 'object' ? valueData.mobile : valueData;

                    if (existingVar) {
                        existingVar.setValueForMode(desktopModeId, desktopValue);
                        existingVar.setValueForMode(tabletModeId, tabletValue);
                        existingVar.setValueForMode(mobileModeId, mobileValue);
                    } else {
                        const variable = figma.variables.createVariable(name, spacingCollection, 'FLOAT');
                        variable.setValueForMode(desktopModeId, desktopValue);
                        variable.setValueForMode(tabletModeId, tabletValue);
                        variable.setValueForMode(mobileModeId, mobileValue);
                    }
                    spacingCount++;
                }
            }

            // Create padding variables with responsive modes (Desktop, Tablet, Mobile)
            let paddingCollection;
            let paddingCount = 0;

            if (msg.padding && Object.keys(msg.padding).length > 0) {
                // Get or create padding variable collection
                const existingPaddingCollection = (await figma.variables.getLocalVariableCollectionsAsync()).find(c => c.name === 'Design System Padding');

                if (existingPaddingCollection) {
                    paddingCollection = existingPaddingCollection;

                    // Ensure all three modes exist
                    const hasDesktop = paddingCollection.modes.some(m => m.name === 'Desktop');
                    const hasTablet = paddingCollection.modes.some(m => m.name === 'Tablet');
                    const hasMobile = paddingCollection.modes.some(m => m.name === 'Mobile');

                    if (!hasDesktop) {
                        paddingCollection.renameMode(paddingCollection.modes[0].modeId, 'Desktop');
                    }
                    if (!hasTablet) {
                        paddingCollection.addMode('Tablet');
                    }
                    if (!hasMobile) {
                        paddingCollection.addMode('Mobile');
                    }
                } else {
                    paddingCollection = figma.variables.createVariableCollection('Design System Padding');
                    paddingCollection.renameMode(paddingCollection.modes[0].modeId, 'Desktop');
                    paddingCollection.addMode('Tablet');
                    paddingCollection.addMode('Mobile');
                }

                const desktopModeId = paddingCollection.modes.find(m => m.name === 'Desktop').modeId;
                const tabletModeId = paddingCollection.modes.find(m => m.name === 'Tablet').modeId;
                const mobileModeId = paddingCollection.modes.find(m => m.name === 'Mobile').modeId;

                // Create padding variables
                for (const [name, valueData] of Object.entries(msg.padding)) {
                    const existingVariables = await figma.variables.getLocalVariablesAsync('FLOAT');
                    const existingVar = existingVariables.find(v => v.name === name && v.variableCollectionId === paddingCollection.id);

                    // Handle both old format (number) and new format (object with desktop/tablet/mobile)
                    const desktopValue = typeof valueData === 'object' ? valueData.desktop : valueData;
                    const tabletValue = typeof valueData === 'object' ? valueData.tablet : valueData;
                    const mobileValue = typeof valueData === 'object' ? valueData.mobile : valueData;

                    if (existingVar) {
                        existingVar.setValueForMode(desktopModeId, desktopValue);
                        existingVar.setValueForMode(tabletModeId, tabletValue);
                        existingVar.setValueForMode(mobileModeId, mobileValue);
                    } else {
                        const variable = figma.variables.createVariable(name, paddingCollection, 'FLOAT');
                        variable.setValueForMode(desktopModeId, desktopValue);
                        variable.setValueForMode(tabletModeId, tabletValue);
                        variable.setValueForMode(mobileModeId, mobileValue);
                    }
                    paddingCount++;
                }
            }

            // Create radius variables with responsive modes (Desktop, Tablet, Mobile)
            let radiusCollection;
            let radiusCount = 0;

            if (msg.radius && Object.keys(msg.radius).length > 0) {
                // Get or create radius variable collection
                const existingRadiusCollection = (await figma.variables.getLocalVariableCollectionsAsync()).find(c => c.name === 'Design System Radius');

                if (existingRadiusCollection) {
                    radiusCollection = existingRadiusCollection;

                    // Ensure all three modes exist
                    const hasDesktop = radiusCollection.modes.some(m => m.name === 'Desktop');
                    const hasTablet = radiusCollection.modes.some(m => m.name === 'Tablet');
                    const hasMobile = radiusCollection.modes.some(m => m.name === 'Mobile');

                    if (!hasDesktop) {
                        radiusCollection.renameMode(radiusCollection.modes[0].modeId, 'Desktop');
                    }
                    if (!hasTablet) {
                        radiusCollection.addMode('Tablet');
                    }
                    if (!hasMobile) {
                        radiusCollection.addMode('Mobile');
                    }
                } else {
                    radiusCollection = figma.variables.createVariableCollection('Design System Radius');
                    radiusCollection.renameMode(radiusCollection.modes[0].modeId, 'Desktop');
                    radiusCollection.addMode('Tablet');
                    radiusCollection.addMode('Mobile');
                }

                const desktopModeId = radiusCollection.modes.find(m => m.name === 'Desktop').modeId;
                const tabletModeId = radiusCollection.modes.find(m => m.name === 'Tablet').modeId;
                const mobileModeId = radiusCollection.modes.find(m => m.name === 'Mobile').modeId;

                // Create radius variables
                for (const [name, valueData] of Object.entries(msg.radius)) {
                    const existingVariables = await figma.variables.getLocalVariablesAsync('FLOAT');
                    const existingVar = existingVariables.find(v => v.name === name && v.variableCollectionId === radiusCollection.id);

                    // Handle both old format (number) and new format (object with desktop/tablet/mobile)
                    const desktopValue = typeof valueData === 'object' ? valueData.desktop : valueData;
                    const tabletValue = typeof valueData === 'object' ? valueData.tablet : valueData;
                    const mobileValue = typeof valueData === 'object' ? valueData.mobile : valueData;

                    if (existingVar) {
                        existingVar.setValueForMode(desktopModeId, desktopValue);
                        existingVar.setValueForMode(tabletModeId, tabletValue);
                        existingVar.setValueForMode(mobileModeId, mobileValue);
                    } else {
                        const variable = figma.variables.createVariable(name, radiusCollection, 'FLOAT');
                        variable.setValueForMode(desktopModeId, desktopValue);
                        variable.setValueForMode(tabletModeId, tabletValue);
                        variable.setValueForMode(mobileModeId, mobileValue);
                    }
                    radiusCount++;
                }
            }

            // Create stroke variables with responsive modes (Desktop, Tablet, Mobile)
            let strokeCollection;
            let strokeCount = 0;

            if (msg.strokes && Object.keys(msg.strokes).length > 0) {
                // Get or create stroke variable collection
                const existingStrokeCollection = (await figma.variables.getLocalVariableCollectionsAsync()).find(c => c.name === 'Design System Stroke');

                if (existingStrokeCollection) {
                    strokeCollection = existingStrokeCollection;

                    // Ensure all three modes exist
                    const hasDesktop = strokeCollection.modes.some(m => m.name === 'Desktop');
                    const hasTablet = strokeCollection.modes.some(m => m.name === 'Tablet');
                    const hasMobile = strokeCollection.modes.some(m => m.name === 'Mobile');

                    if (!hasDesktop) {
                        strokeCollection.renameMode(strokeCollection.modes[0].modeId, 'Desktop');
                    }
                    if (!hasTablet) {
                        strokeCollection.addMode('Tablet');
                    }
                    if (!hasMobile) {
                        strokeCollection.addMode('Mobile');
                    }
                } else {
                    strokeCollection = figma.variables.createVariableCollection('Design System Stroke');
                    strokeCollection.renameMode(strokeCollection.modes[0].modeId, 'Desktop');
                    strokeCollection.addMode('Tablet');
                    strokeCollection.addMode('Mobile');
                }

                const desktopModeId = strokeCollection.modes.find(m => m.name === 'Desktop').modeId;
                const tabletModeId = strokeCollection.modes.find(m => m.name === 'Tablet').modeId;
                const mobileModeId = strokeCollection.modes.find(m => m.name === 'Mobile').modeId;

                // Create stroke variables
                for (const [name, valueData] of Object.entries(msg.strokes)) {
                    const existingVariables = await figma.variables.getLocalVariablesAsync('FLOAT');
                    const existingVar = existingVariables.find(v => v.name === name && v.variableCollectionId === strokeCollection.id);

                    // Handle both old format (number) and new format (object with desktop/tablet/mobile)
                    const desktopValue = typeof valueData === 'object' ? valueData.desktop : valueData;
                    const tabletValue = typeof valueData === 'object' ? valueData.tablet : valueData;
                    const mobileValue = typeof valueData === 'object' ? valueData.mobile : valueData;

                    if (existingVar) {
                        existingVar.setValueForMode(desktopModeId, desktopValue);
                        existingVar.setValueForMode(tabletModeId, tabletValue);
                        existingVar.setValueForMode(mobileModeId, mobileValue);
                    } else {
                        const variable = figma.variables.createVariable(name, strokeCollection, 'FLOAT');
                        variable.setValueForMode(desktopModeId, desktopValue);
                        variable.setValueForMode(tabletModeId, tabletValue);
                        variable.setValueForMode(mobileModeId, mobileValue);
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
            if (createdCount === 0 && spacingCount === 0 && paddingCount === 0 && radiusCount === 0 && strokeCount === 0 && shadowCount === 0) {
                figma.notify('⚠️ No data found to create variables or styles. Please expand sections and ensure tokens are generated.');
                return;
            }

            // Create visual documentation frame with organized card layout (Light Mode)
            const frame = figma.createFrame();
            frame.name = "Design System Tokens";
            frame.fills = [{ type: 'SOLID', color: { r: 0.96, g: 0.96, b: 0.97 } }]; // #F5F5F7 - Subtle gray background

            // Enable auto-layout with hug contents for both width and height
            frame.layoutMode = 'VERTICAL';
            frame.primaryAxisSizingMode = 'AUTO'; // Hug height
            frame.counterAxisSizingMode = 'AUTO'; // Hug width
            frame.itemSpacing = 48;
            frame.paddingLeft = 80;
            frame.paddingRight = 80;
            frame.paddingTop = 72;
            frame.paddingBottom = 72;

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

            // Add header section with stats
            const headerFrame = figma.createFrame();
            headerFrame.name = "Header";
            headerFrame.fills = [];

            headerFrame.layoutMode = 'VERTICAL';
            headerFrame.primaryAxisSizingMode = 'AUTO';
            headerFrame.counterAxisSizingMode = 'AUTO'; // Hug width
            headerFrame.itemSpacing = 20;

            frame.appendChild(headerFrame);

            // Add title with subtitle
            const titleContainer = figma.createFrame();
            titleContainer.name = "Title Container";
            titleContainer.fills = [];
            titleContainer.layoutMode = 'VERTICAL';
            titleContainer.primaryAxisSizingMode = 'AUTO';
            titleContainer.counterAxisSizingMode = 'AUTO';
            titleContainer.itemSpacing = 8;

            const title = figma.createText();
            try {
                title.fontName = { family: "Inter", style: "Bold" };
            } catch (e) {
                // Fallback to default font
            }
            title.fontSize = 40;
            title.characters = "Design System Tokens";
            title.fills = [{ type: 'SOLID', color: { r: 0.08, g: 0.08, b: 0.08 } }];
            title.letterSpacing = { value: -1.2, unit: "PIXELS" };
            titleContainer.appendChild(title);

            // Add subtitle with timestamp
            const subtitle = figma.createText();
            try {
                subtitle.fontName = { family: "Inter", style: "Regular" };
            } catch (e) {
                // Fallback
            }
            subtitle.fontSize = 14;
            const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            subtitle.characters = `Generated on ${date} • Complete token documentation`;
            subtitle.fills = [{ type: 'SOLID', color: { r: 0.45, g: 0.45, b: 0.47 } }];
            titleContainer.appendChild(subtitle);

            headerFrame.appendChild(titleContainer);

            // Add stats row
            const statsRow = figma.createFrame();
            statsRow.name = "Stats";
            statsRow.fills = [];
            statsRow.layoutMode = 'HORIZONTAL';
            statsRow.primaryAxisSizingMode = 'AUTO';
            statsRow.counterAxisSizingMode = 'AUTO';
            statsRow.itemSpacing = 24;

            const totalVars = createdCount + spacingCount + paddingCount + radiusCount + strokeCount;
            const stats = [
                { label: 'Total Variables', value: totalVars },
                { label: 'Colors', value: createdCount },
                { label: 'Spacing', value: spacingCount },
                { label: 'Padding', value: paddingCount },
                { label: 'Radius', value: radiusCount },
                { label: 'Stroke', value: strokeCount },
                { label: 'Shadows', value: shadowCount }
            ];

            stats.forEach(stat => {
                const statItem = figma.createFrame();
                statItem.name = stat.label;
                statItem.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
                statItem.cornerRadius = 8;
                statItem.strokes = [{ type: 'SOLID', color: { r: 0.88, g: 0.88, b: 0.89 } }];
                statItem.strokeWeight = 1;
                statItem.layoutMode = 'VERTICAL';
                statItem.primaryAxisSizingMode = 'AUTO';
                statItem.counterAxisSizingMode = 'AUTO';
                statItem.itemSpacing = 4;
                statItem.paddingLeft = 16;
                statItem.paddingRight = 16;
                statItem.paddingTop = 12;
                statItem.paddingBottom = 12;
                statItem.primaryAxisAlignItems = 'CENTER';

                const valueText = figma.createText();
                try {
                    valueText.fontName = { family: "Inter", style: "Bold" };
                } catch (e) {
                    // Fallback
                }
                valueText.fontSize = 24;
                safeSetCharacters(valueText, `${stat.value}`);
                valueText.fills = [{ type: 'SOLID', color: { r: 0.08, g: 0.08, b: 0.08 } }];
                statItem.appendChild(valueText);

                const labelText = figma.createText();
                try {
                    labelText.fontName = { family: "Inter", style: "Medium" };
                } catch (e) {
                    // Fallback
                }
                labelText.fontSize = 11;
                labelText.characters = stat.label.toUpperCase();
                labelText.fills = [{ type: 'SOLID', color: { r: 0.55, g: 0.55, b: 0.57 } }];
                labelText.letterSpacing = { value: 0.5, unit: "PIXELS" };
                statItem.appendChild(labelText);

                statsRow.appendChild(statItem);
            });

            headerFrame.appendChild(statsRow);

            // Helper function to create category section
            function createCategorySection(categoryTitle, categoryDescription, parent) {
                const categoryHeader = figma.createFrame();
                categoryHeader.name = `${categoryTitle} Header`;
                categoryHeader.fills = [];
                categoryHeader.layoutMode = 'VERTICAL';
                categoryHeader.primaryAxisSizingMode = 'AUTO';
                categoryHeader.counterAxisSizingMode = 'AUTO'; // Hug width
                categoryHeader.itemSpacing = 6;

                const titleText = figma.createText();
                try {
                    titleText.fontName = { family: "Inter", style: "Bold" };
                } catch (e) {
                    // Fallback
                }
                titleText.fontSize = 24;
                titleText.characters = categoryTitle;
                titleText.fills = [{ type: 'SOLID', color: { r: 0.08, g: 0.08, b: 0.08 } }];
                titleText.letterSpacing = { value: -0.6, unit: "PIXELS" };
                categoryHeader.appendChild(titleText);

                const descText = figma.createText();
                try {
                    descText.fontName = { family: "Inter", style: "Regular" };
                } catch (e) {
                    // Fallback
                }
                descText.fontSize = 14;
                descText.characters = categoryDescription;
                descText.fills = [{ type: 'SOLID', color: { r: 0.45, g: 0.45, b: 0.47 } }];
                categoryHeader.appendChild(descText);

                parent.appendChild(categoryHeader);
                return categoryHeader;
            }

            // Helper function to create color grid section
            function createColorGridSection(colorName, colorShades, parent) {
                if (!colorShades || Object.keys(colorShades).length === 0) return;

                const colorSection = figma.createFrame();
                colorSection.name = colorName;
                colorSection.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
                colorSection.cornerRadius = 12;
                colorSection.strokes = [{ type: 'SOLID', color: { r: 0.88, g: 0.88, b: 0.89 } }];
                colorSection.strokeWeight = 1.5;
                colorSection.layoutMode = 'VERTICAL';
                colorSection.primaryAxisSizingMode = 'AUTO';
                colorSection.counterAxisSizingMode = 'AUTO'; // Hug width
                colorSection.itemSpacing = 20;
                colorSection.paddingLeft = 28;
                colorSection.paddingRight = 28;
                colorSection.paddingTop = 24;
                colorSection.paddingBottom = 24;

                // Section title
                const sectionTitle = figma.createText();
                try {
                    sectionTitle.fontName = { family: "Inter", style: "Semi Bold" };
                } catch (e) {
                    // Fallback
                }
                sectionTitle.fontSize = 16;
                sectionTitle.characters = colorName;
                sectionTitle.fills = [{ type: 'SOLID', color: { r: 0.15, g: 0.15, b: 0.15 } }];
                sectionTitle.letterSpacing = { value: -0.2, unit: "PIXELS" };
                colorSection.appendChild(sectionTitle);

                // Color grid
                const colorGrid = figma.createFrame();
                colorGrid.name = "Grid";
                colorGrid.fills = [];
                colorGrid.layoutMode = 'HORIZONTAL';
                colorGrid.primaryAxisSizingMode = 'AUTO';
                colorGrid.counterAxisSizingMode = 'AUTO';
                colorGrid.itemSpacing = 12;
                colorGrid.layoutWrap = 'WRAP';

                Object.entries(colorShades).forEach(([shadeName, hexColor]) => {
                    const colorCard = figma.createFrame();
                    colorCard.name = shadeName;
                    colorCard.fills = [];
                    colorCard.layoutMode = 'VERTICAL';
                    colorCard.primaryAxisSizingMode = 'AUTO';
                    colorCard.counterAxisSizingMode = 'FIXED';
                    colorCard.itemSpacing = 10;
                    colorCard.resize(110, 140);

                    // Color swatch with shadow
                    const swatch = figma.createFrame();
                    swatch.name = "Swatch";
                    swatch.resize(110, 88);
                    const rgb = hexToRgb(hexColor);
                    swatch.fills = [{ type: 'SOLID', color: rgb }];
                    swatch.cornerRadius = 8;
                    swatch.strokes = [{ type: 'SOLID', color: { r: 0.88, g: 0.88, b: 0.89 } }];
                    swatch.strokeWeight = 1;
                    swatch.effects = [{
                        type: 'DROP_SHADOW',
                        color: { r: 0, g: 0, b: 0, a: 0.06 },
                        offset: { x: 0, y: 2 },
                        radius: 8,
                        visible: true,
                        blendMode: 'NORMAL'
                    }];
                    colorCard.appendChild(swatch);

                    // Info container
                    const infoContainer = figma.createFrame();
                    infoContainer.name = "Info";
                    infoContainer.fills = [];
                    infoContainer.layoutMode = 'VERTICAL';
                    infoContainer.primaryAxisSizingMode = 'AUTO';
                    infoContainer.counterAxisSizingMode = 'FIXED';
                    infoContainer.itemSpacing = 2;
                    infoContainer.resize(110, 40);

                    // Shade name
                    const nameText = figma.createText();
                    try {
                        nameText.fontName = { family: "Inter", style: "Semi Bold" };
                    } catch (e) {
                        // Fallback
                    }
                    nameText.fontSize = 12;
                    nameText.characters = shadeName.split('-')[1] || shadeName;
                    nameText.fills = [{ type: 'SOLID', color: { r: 0.15, g: 0.15, b: 0.15 } }];
                    infoContainer.appendChild(nameText);

                    // Hex value
                    const hexText = figma.createText();
                    try {
                        hexText.fontName = { family: "Inter", style: "Regular" };
                    } catch (e) {
                        // Fallback
                    }
                    hexText.fontSize = 11;
                    hexText.characters = hexColor.toUpperCase();
                    hexText.fills = [{ type: 'SOLID', color: { r: 0.55, g: 0.55, b: 0.57 } }];
                    infoContainer.appendChild(hexText);

                    colorCard.appendChild(infoContainer);
                    colorGrid.appendChild(colorCard);
                });

                colorSection.appendChild(colorGrid);
                parent.appendChild(colorSection);
            }

            // COLORS CATEGORY
            createCategorySection("Colors", "Brand and semantic color tokens", frame);

            // Create color grid sections
            if (colors.primary && colors.primary.light) {
                createColorGridSection("Primary", colors.primary.light, frame);
            }

            if (colors.secondary && colors.secondary.light) {
                createColorGridSection("Secondary", colors.secondary.light, frame);
            }

            if (colors.success) {
                createColorGridSection("Success", colors.success, frame);
            }

            if (colors.error) {
                createColorGridSection("Error", colors.error, frame);
            }

            if (colors.warning) {
                createColorGridSection("Warning", colors.warning, frame);
            }

            if (colors.info) {
                createColorGridSection("Info", colors.info, frame);
            }

            if (colors.neutral && colors.neutral.light) {
                createColorGridSection("Neutral", colors.neutral.light, frame);
            }

            // SPACING CATEGORY
            if (msg.spacing && Object.keys(msg.spacing).length > 0) {
                createCategorySection("Spacing", "Layout spacing and padding tokens", frame);

                const spacingSection = figma.createFrame();
                spacingSection.name = "Spacing Tokens";
                spacingSection.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
                spacingSection.strokes = [{ type: 'SOLID', color: { r: 0.88, g: 0.88, b: 0.89 } }];
                spacingSection.strokeWeight = 1.5;
                spacingSection.cornerRadius = 12;
                spacingSection.layoutMode = 'HORIZONTAL';
                spacingSection.primaryAxisSizingMode = 'AUTO';
                spacingSection.counterAxisSizingMode = 'AUTO'; // Hug width
                spacingSection.itemSpacing = 16;
                spacingSection.paddingLeft = 28;
                spacingSection.paddingRight = 28;
                spacingSection.paddingTop = 28;
                spacingSection.paddingBottom = 28;
                spacingSection.layoutWrap = 'WRAP';

                Object.entries(msg.spacing).forEach(([name, valueData]) => {
                    // Skip if name is empty or invalid
                    if (!name || name.trim() === '') {
                        console.warn('Skipping spacing token with empty name');
                        return;
                    }

                    // Handle both old format (number) and new format (object with desktop/tablet/mobile)
                    const displayValue = typeof valueData === 'object' ? valueData.desktop : valueData;

                    // Skip if displayValue is invalid
                    if (displayValue === undefined || displayValue === null) {
                        console.warn(`Skipping spacing token ${name} with invalid value`);
                        return;
                    }

                    const tokenCard = figma.createFrame();
                    tokenCard.name = name;
                    tokenCard.resize(100, 110);
                    tokenCard.fills = [{ type: 'SOLID', color: { r: 0.98, g: 0.98, b: 0.99 } }];
                    tokenCard.cornerRadius = 8;
                    tokenCard.strokes = [{ type: 'SOLID', color: { r: 0.92, g: 0.92, b: 0.93 } }];
                    tokenCard.strokeWeight = 1;
                    tokenCard.layoutMode = 'VERTICAL';
                    tokenCard.primaryAxisSizingMode = 'AUTO';
                    tokenCard.counterAxisSizingMode = 'FIXED';
                    tokenCard.itemSpacing = 8;
                    tokenCard.paddingLeft = 14;
                    tokenCard.paddingRight = 14;
                    tokenCard.paddingTop = 18;
                    tokenCard.paddingBottom = 18;
                    tokenCard.primaryAxisAlignItems = 'CENTER';

                    const nameText = figma.createText();
                    try {
                        nameText.fontName = { family: "Inter", style: "Medium" };
                    } catch (e) {
                        // Fallback
                    }
                    nameText.fontSize = 10;
                    safeSetCharacters(nameText, name.toUpperCase());
                    nameText.fills = [{ type: 'SOLID', color: { r: 0.55, g: 0.55, b: 0.57 } }];
                    nameText.letterSpacing = { value: 0.4, unit: "PIXELS" };
                    tokenCard.appendChild(nameText);

                    const valueText = figma.createText();
                    try {
                        valueText.fontName = { family: "Inter", style: "Bold" };
                    } catch (e) {
                        // Fallback
                    }
                    valueText.fontSize = 28;
                    safeSetCharacters(valueText, `${displayValue}`);
                    valueText.fills = [{ type: 'SOLID', color: { r: 0.08, g: 0.08, b: 0.08 } }];
                    valueText.letterSpacing = { value: -0.5, unit: "PIXELS" };
                    tokenCard.appendChild(valueText);

                    const unitText = figma.createText();
                    try {
                        unitText.fontName = { family: "Inter", style: "Regular" };
                    } catch (e) {
                        // Fallback
                    }
                    unitText.fontSize = 10;
                    safeSetCharacters(unitText, "px");
                    unitText.fills = [{ type: 'SOLID', color: { r: 0.63, g: 0.63, b: 0.63 } }];
                    tokenCard.appendChild(unitText);

                    spacingSection.appendChild(tokenCard);
                });

                frame.appendChild(spacingSection);
            }

            // PADDING CATEGORY
            if (msg.padding && Object.keys(msg.padding).length > 0) {
                createCategorySection("Padding", "Component padding tokens", frame);

                const paddingSection = figma.createFrame();
                paddingSection.name = "Padding Tokens";
                paddingSection.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
                paddingSection.strokes = [{ type: 'SOLID', color: { r: 0.88, g: 0.88, b: 0.89 } }];
                paddingSection.strokeWeight = 1.5;
                paddingSection.cornerRadius = 12;
                paddingSection.layoutMode = 'HORIZONTAL';
                paddingSection.primaryAxisSizingMode = 'AUTO';
                paddingSection.counterAxisSizingMode = 'AUTO'; // Hug width
                paddingSection.itemSpacing = 16;
                paddingSection.paddingLeft = 28;
                paddingSection.paddingRight = 28;
                paddingSection.paddingTop = 28;
                paddingSection.paddingBottom = 28;
                paddingSection.layoutWrap = 'WRAP';

                Object.entries(msg.padding).forEach(([name, valueData]) => {
                    // Skip if name is empty or invalid
                    if (!name || name.trim() === '') {
                        console.warn('Skipping padding token with empty name');
                        return;
                    }

                    // Handle both old format (number) and new format (object with desktop/tablet/mobile)
                    const displayValue = typeof valueData === 'object' ? valueData.desktop : valueData;

                    // Skip if displayValue is invalid
                    if (displayValue === undefined || displayValue === null) {
                        console.warn(`Skipping padding token ${name} with invalid value`);
                        return;
                    }

                    const tokenCard = figma.createFrame();
                    tokenCard.name = name;
                    tokenCard.resize(100, 110);
                    tokenCard.fills = [{ type: 'SOLID', color: { r: 0.98, g: 0.98, b: 0.99 } }];
                    tokenCard.cornerRadius = 8;
                    tokenCard.strokes = [{ type: 'SOLID', color: { r: 0.92, g: 0.92, b: 0.93 } }];
                    tokenCard.strokeWeight = 1;
                    tokenCard.layoutMode = 'VERTICAL';
                    tokenCard.primaryAxisSizingMode = 'AUTO';
                    tokenCard.counterAxisSizingMode = 'FIXED';
                    tokenCard.itemSpacing = 8;
                    tokenCard.paddingLeft = 14;
                    tokenCard.paddingRight = 14;
                    tokenCard.paddingTop = 18;
                    tokenCard.paddingBottom = 18;
                    tokenCard.primaryAxisAlignItems = 'CENTER';

                    const nameText = figma.createText();
                    try {
                        nameText.fontName = { family: "Inter", style: "Medium" };
                    } catch (e) {
                        // Fallback
                    }
                    nameText.fontSize = 10;
                    safeSetCharacters(nameText, name.toUpperCase());
                    nameText.fills = [{ type: 'SOLID', color: { r: 0.55, g: 0.55, b: 0.57 } }];
                    nameText.letterSpacing = { value: 0.4, unit: "PIXELS" };
                    tokenCard.appendChild(nameText);

                    const valueText = figma.createText();
                    try {
                        valueText.fontName = { family: "Inter", style: "Bold" };
                    } catch (e) {
                        // Fallback
                    }
                    valueText.fontSize = 28;
                    safeSetCharacters(valueText, `${displayValue}`);
                    valueText.fills = [{ type: 'SOLID', color: { r: 0.08, g: 0.08, b: 0.08 } }];
                    valueText.letterSpacing = { value: -0.5, unit: "PIXELS" };
                    tokenCard.appendChild(valueText);

                    const unitText = figma.createText();
                    try {
                        unitText.fontName = { family: "Inter", style: "Medium" };
                    } catch (e) {
                        // Fallback
                    }
                    unitText.fontSize = 11;
                    safeSetCharacters(unitText, "pixels");
                    unitText.fills = [{ type: 'SOLID', color: { r: 0.45, g: 0.45, b: 0.47 } }];
                    tokenCard.appendChild(unitText);

                    paddingSection.appendChild(tokenCard);
                });

                frame.appendChild(paddingSection);
            }

            // RADIUS CATEGORY
            if (msg.radius && Object.keys(msg.radius).length > 0) {
                createCategorySection("Border Radius", "Corner radius tokens", frame);

                const radiusSection = figma.createFrame();
                radiusSection.name = "Radius Tokens";
                radiusSection.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
                radiusSection.strokes = [{ type: 'SOLID', color: { r: 0.88, g: 0.88, b: 0.89 } }];
                radiusSection.strokeWeight = 1.5;
                radiusSection.cornerRadius = 12;
                radiusSection.layoutMode = 'HORIZONTAL';
                radiusSection.primaryAxisSizingMode = 'AUTO';
                radiusSection.counterAxisSizingMode = 'AUTO'; // Hug width
                radiusSection.itemSpacing = 16;
                radiusSection.paddingLeft = 28;
                radiusSection.paddingRight = 28;
                radiusSection.paddingTop = 28;
                radiusSection.paddingBottom = 28;
                radiusSection.layoutWrap = 'WRAP';

                Object.entries(msg.radius).forEach(([name, valueData]) => {
                    // Skip if name is empty or invalid
                    if (!name || name.trim() === '') {
                        console.warn('Skipping radius token with empty name');
                        return;
                    }

                    // Handle both old format (number) and new format (object with desktop/tablet/mobile)
                    const displayValue = typeof valueData === 'object' ? valueData.desktop : valueData;

                    // Skip if displayValue is invalid
                    if (displayValue === undefined || displayValue === null) {
                        console.warn(`Skipping radius token ${name} with invalid value`);
                        return;
                    }

                    const tokenCard = figma.createFrame();
                    tokenCard.name = name;
                    tokenCard.resize(100, 110);
                    tokenCard.fills = [{ type: 'SOLID', color: { r: 0.98, g: 0.98, b: 0.99 } }];
                    tokenCard.cornerRadius = displayValue === 9999 ? 50 : Math.min(displayValue, 24);
                    tokenCard.strokes = [{ type: 'SOLID', color: { r: 0.92, g: 0.92, b: 0.93 } }];
                    tokenCard.strokeWeight = 1;
                    tokenCard.layoutMode = 'VERTICAL';
                    tokenCard.primaryAxisSizingMode = 'AUTO';
                    tokenCard.counterAxisSizingMode = 'FIXED';
                    tokenCard.itemSpacing = 8;
                    tokenCard.paddingLeft = 14;
                    tokenCard.paddingRight = 14;
                    tokenCard.paddingTop = 18;
                    tokenCard.paddingBottom = 18;
                    tokenCard.primaryAxisAlignItems = 'CENTER';

                    const nameText = figma.createText();
                    try {
                        nameText.fontName = { family: "Inter", style: "Medium" };
                    } catch (e) {
                        // Fallback
                    }
                    nameText.fontSize = 10;
                    safeSetCharacters(nameText, name.toUpperCase());
                    nameText.fills = [{ type: 'SOLID', color: { r: 0.55, g: 0.55, b: 0.57 } }];
                    nameText.letterSpacing = { value: 0.4, unit: "PIXELS" };
                    tokenCard.appendChild(nameText);

                    const valueText = figma.createText();
                    try {
                        valueText.fontName = { family: "Inter", style: "Bold" };
                    } catch (e) {
                        // Fallback
                    }
                    valueText.fontSize = 28;
                    safeSetCharacters(valueText, displayValue === 9999 ? '∞' : `${displayValue}`);
                    valueText.fills = [{ type: 'SOLID', color: { r: 0.08, g: 0.08, b: 0.08 } }];
                    valueText.letterSpacing = { value: -0.5, unit: "PIXELS" };
                    tokenCard.appendChild(valueText);

                    if (displayValue !== 9999) {
                        const unitText = figma.createText();
                        try {
                            unitText.fontName = { family: "Inter", style: "Medium" };
                        } catch (e) {
                            // Fallback
                        }
                        unitText.fontSize = 11;
                        safeSetCharacters(unitText, "pixels");
                        unitText.fills = [{ type: 'SOLID', color: { r: 0.45, g: 0.45, b: 0.47 } }];
                        tokenCard.appendChild(unitText);
                    }

                    radiusSection.appendChild(tokenCard);
                });

                frame.appendChild(radiusSection);
            }

            // STROKE CATEGORY
            if (msg.strokes && Object.keys(msg.strokes).length > 0) {
                createCategorySection("Stroke Width", "Border width tokens", frame);

                const strokeSection = figma.createFrame();
                strokeSection.name = "Stroke Tokens";
                strokeSection.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
                strokeSection.strokes = [{ type: 'SOLID', color: { r: 0.88, g: 0.88, b: 0.89 } }];
                strokeSection.strokeWeight = 1.5;
                strokeSection.cornerRadius = 12;
                strokeSection.layoutMode = 'HORIZONTAL';
                strokeSection.primaryAxisSizingMode = 'AUTO';
                strokeSection.counterAxisSizingMode = 'AUTO'; // Hug width
                strokeSection.itemSpacing = 16;
                strokeSection.paddingLeft = 28;
                strokeSection.paddingRight = 28;
                strokeSection.paddingTop = 28;
                strokeSection.paddingBottom = 28;
                strokeSection.layoutWrap = 'WRAP';

                Object.entries(msg.strokes).forEach(([name, valueData]) => {
                    // Skip if name is empty or invalid
                    if (!name || name.trim() === '') {
                        console.warn('Skipping stroke token with empty name');
                        return;
                    }

                    // Handle both old format (number) and new format (object with desktop/tablet/mobile)
                    const displayValue = typeof valueData === 'object' ? valueData.desktop : valueData;

                    // Skip if displayValue is invalid
                    if (displayValue === undefined || displayValue === null) {
                        console.warn(`Skipping stroke token ${name} with invalid value`);
                        return;
                    }

                    const tokenCard = figma.createFrame();
                    tokenCard.name = name;
                    tokenCard.resize(100, 110);
                    tokenCard.fills = [{ type: 'SOLID', color: { r: 0.98, g: 0.98, b: 0.99 } }];
                    tokenCard.cornerRadius = 8;
                    tokenCard.strokes = [{ type: 'SOLID', color: { r: 0.08, g: 0.08, b: 0.08 } }];
                    tokenCard.strokeWeight = Math.min(displayValue, 3);
                    tokenCard.layoutMode = 'VERTICAL';
                    tokenCard.primaryAxisSizingMode = 'AUTO';
                    tokenCard.counterAxisSizingMode = 'FIXED';
                    tokenCard.itemSpacing = 8;
                    tokenCard.paddingLeft = 14;
                    tokenCard.paddingRight = 14;
                    tokenCard.paddingTop = 18;
                    tokenCard.paddingBottom = 18;
                    tokenCard.primaryAxisAlignItems = 'CENTER';

                    const nameText = figma.createText();
                    try {
                        nameText.fontName = { family: "Inter", style: "Medium" };
                    } catch (e) {
                        // Fallback
                    }
                    nameText.fontSize = 10;
                    safeSetCharacters(nameText, name.toUpperCase());
                    nameText.fills = [{ type: 'SOLID', color: { r: 0.55, g: 0.55, b: 0.57 } }];
                    nameText.letterSpacing = { value: 0.4, unit: "PIXELS" };
                    tokenCard.appendChild(nameText);

                    const valueText = figma.createText();
                    try {
                        valueText.fontName = { family: "Inter", style: "Bold" };
                    } catch (e) {
                        // Fallback
                    }
                    valueText.fontSize = 28;
                    safeSetCharacters(valueText, `${displayValue}`);
                    valueText.fills = [{ type: 'SOLID', color: { r: 0.08, g: 0.08, b: 0.08 } }];
                    valueText.letterSpacing = { value: -0.5, unit: "PIXELS" };
                    tokenCard.appendChild(valueText);

                    const unitText = figma.createText();
                    try {
                        unitText.fontName = { family: "Inter", style: "Medium" };
                    } catch (e) {
                        // Fallback
                    }
                    unitText.fontSize = 10;
                    safeSetCharacters(unitText, "px");
                    unitText.fills = [{ type: 'SOLID', color: { r: 0.63, g: 0.63, b: 0.63 } }];
                    tokenCard.appendChild(unitText);

                    strokeSection.appendChild(tokenCard);
                });

                frame.appendChild(strokeSection);
            }

            // SHADOW CATEGORY
            if (msg.shadows && Object.keys(msg.shadows).length > 0) {
                createCategorySection("Shadows", "Elevation shadow tokens", frame);

                const shadowSection = figma.createFrame();
                shadowSection.name = "Shadow Tokens";
                shadowSection.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
                shadowSection.strokes = [{ type: 'SOLID', color: { r: 0.88, g: 0.88, b: 0.89 } }];
                shadowSection.strokeWeight = 1.5;
                shadowSection.cornerRadius = 12;
                shadowSection.layoutMode = 'HORIZONTAL';
                shadowSection.primaryAxisSizingMode = 'AUTO';
                shadowSection.counterAxisSizingMode = 'AUTO'; // Hug width
                shadowSection.itemSpacing = 16;
                shadowSection.paddingLeft = 28;
                shadowSection.paddingRight = 28;
                shadowSection.paddingTop = 28;
                shadowSection.paddingBottom = 28;
                shadowSection.layoutWrap = 'WRAP';

                Object.entries(msg.shadows).forEach(([name, value]) => {
                    // Skip if name is empty or invalid
                    if (!name || name.trim() === '') {
                        console.warn('Skipping shadow token with empty name');
                        return;
                    }

                    const tokenCard = figma.createFrame();
                    tokenCard.name = name;
                    tokenCard.resize(100, 110);
                    tokenCard.fills = [{ type: 'SOLID', color: { r: 0.98, g: 0.98, b: 0.99 } }];
                    tokenCard.cornerRadius = 8;
                    tokenCard.strokes = [{ type: 'SOLID', color: { r: 0.92, g: 0.92, b: 0.93 } }];
                    tokenCard.strokeWeight = 1;

                    // Apply shadow effect
                    if (value !== 'none') {
                        const shadowMatch = value.match(/(-?\d+)(?:px)?\s+(-?\d+)(?:px)?\s+(-?\d+)(?:px)?\s+rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
                        if (shadowMatch) {
                            const [, x, y, blur, r, g, b, a] = shadowMatch;
                            tokenCard.effects = [{
                                type: 'DROP_SHADOW',
                                color: {
                                    r: parseInt(r) / 255,
                                    g: parseInt(g) / 255,
                                    b: parseInt(b) / 255,
                                    a: parseFloat(a) * 1.5
                                },
                                offset: { x: parseInt(x), y: parseInt(y) },
                                radius: parseInt(blur),
                                visible: true,
                                blendMode: 'NORMAL'
                            }];
                        }
                    }

                    tokenCard.layoutMode = 'VERTICAL';
                    tokenCard.primaryAxisSizingMode = 'AUTO';
                    tokenCard.counterAxisSizingMode = 'FIXED';
                    tokenCard.itemSpacing = 8;
                    tokenCard.paddingLeft = 14;
                    tokenCard.paddingRight = 14;
                    tokenCard.paddingTop = 18;
                    tokenCard.paddingBottom = 18;
                    tokenCard.primaryAxisAlignItems = 'CENTER';

                    const nameText = figma.createText();
                    try {
                        nameText.fontName = { family: "Inter", style: "Medium" };
                    } catch (e) {
                        // Fallback
                    }
                    nameText.fontSize = 10;
                    safeSetCharacters(nameText, name.replace('shadow-', '').toUpperCase());
                    nameText.fills = [{ type: 'SOLID', color: { r: 0.55, g: 0.55, b: 0.57 } }];
                    nameText.letterSpacing = { value: 0.4, unit: "PIXELS" };
                    tokenCard.appendChild(nameText);

                    const valueText = figma.createText();
                    try {
                        valueText.fontName = { family: "Inter", style: "Semi Bold" };
                    } catch (e) {
                        // Fallback
                    }
                    valueText.fontSize = 18;
                    safeSetCharacters(valueText, name.replace('shadow-', '').charAt(0).toUpperCase() + name.replace('shadow-', '').slice(1));
                    valueText.fills = [{ type: 'SOLID', color: { r: 0.15, g: 0.15, b: 0.15 } }];
                    tokenCard.appendChild(valueText);

                    shadowSection.appendChild(tokenCard);
                });

                frame.appendChild(shadowSection);
            }

            // Center the frame in viewport
            figma.viewport.scrollAndZoomIntoView([frame]);

            // Create layout grid styles if grid data is provided
            let gridCount = 0;
            if (msg.grids) {
                console.log('Creating layout grid styles:', msg.grids);

                const grids = msg.grids;

                // Helper function to create or update a grid style
                async function createOrUpdateGridStyle(name, config) {
                    const existingStyles = await figma.getLocalGridStylesAsync();
                    let style = existingStyles.find(s => s.name === name);

                    if (!style) {
                        style = figma.createGridStyle();
                        style.name = name;
                        console.log('Created new grid style:', style.name);
                    } else {
                        console.log('Updating existing grid style:', style.name);
                    }

                    // Create column grid with STRETCH alignment
                    const columnGrid = {
                        pattern: 'COLUMNS',
                        count: config.columns,
                        gutterSize: config.gutter,
                        alignment: 'STRETCH',
                        offset: config.margin,
                        color: { r: 1, g: 0, b: 0, a: 0.1 },
                        visible: true
                    };

                    style.layoutGrids = [columnGrid];
                    return style;
                }

                // Create Desktop Grid Style
                if (grids.desktop) {
                    await createOrUpdateGridStyle('Layout Grid/Desktop', grids.desktop);
                    gridCount++;
                }

                // Create Tablet Grid Style
                if (grids.tablet) {
                    await createOrUpdateGridStyle('Layout Grid/Tablet', grids.tablet);
                    gridCount++;
                }

                // Create Mobile Grid Style
                if (grids.mobile) {
                    await createOrUpdateGridStyle('Layout Grid/Mobile', grids.mobile);
                    gridCount++;
                }
            }

            const varMessage = `${createdCount} colors (Light + Dark modes), ${spacingCount} spacing, ${paddingCount} padding, ${radiusCount} radius, ${strokeCount} stroke`;
            const shadowMessage = shadowCount > 0 ? ` + ${shadowCount} shadow styles` : '';
            const gridMessage = gridCount > 0 ? ` + ${gridCount} layout grid styles` : '';
            figma.notify(`✅ Created ${createdCount + spacingCount + paddingCount + radiusCount + strokeCount} variables (${varMessage})${shadowMessage}${gridMessage}!`);
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

    if (msg.type === 'add-icons') {
        try {
            const iconColor = msg.iconColor;
            const icons = msg.icons;
            const svgData = msg.svgData;

            figma.notify(`🔄 Loading ${icons.length} icons...`);

            // Load fonts
            await figma.loadFontAsync({ family: "Inter", style: "Regular" });
            await figma.loadFontAsync({ family: "Inter", style: "Medium" });
            await figma.loadFontAsync({ family: "Inter", style: "SemiBold" });

            // Helper to convert hex to RGB
            function hexToRgb(hex) {
                const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                return result ? {
                    r: parseInt(result[1], 16) / 255,
                    g: parseInt(result[2], 16) / 255,
                    b: parseInt(result[3], 16) / 255
                } : { r: 0, g: 0, b: 0 };
            }

            // Create icon color variable
            const collections = await figma.variables.getLocalVariableCollectionsAsync();
            let iconCollection = collections.find(c => c.name === 'Icon Colors');

            if (!iconCollection) {
                iconCollection = figma.variables.createVariableCollection('Icon Colors');
            }

            const existingVars = await figma.variables.getLocalVariablesAsync('COLOR');
            let iconColorVar = existingVars.find(v => v.name === 'icon/default' && v.variableCollectionId === iconCollection.id);

            if (!iconColorVar) {
                iconColorVar = figma.variables.createVariable('icon/default', iconCollection, 'COLOR');
            }

            const colorRgb = hexToRgb(iconColor);
            iconColorVar.setValueForMode(iconCollection.modes[0].modeId, colorRgb);

            // Group icons by style
            const iconsByStyle = {};
            icons.forEach(icon => {
                if (!iconsByStyle[icon.style]) {
                    iconsByStyle[icon.style] = [];
                }
                iconsByStyle[icon.style].push(icon);
            });

            // Create main container frame with auto-layout
            const mainFrame = figma.createFrame();
            mainFrame.name = "Icon Library";
            mainFrame.fills = [{ type: 'SOLID', color: { r: 0.97, g: 0.97, b: 0.97 } }];
            mainFrame.layoutMode = 'VERTICAL';
            mainFrame.primaryAxisSizingMode = 'AUTO';
            mainFrame.counterAxisSizingMode = 'AUTO';
            mainFrame.itemSpacing = 32;
            mainFrame.paddingLeft = 32;
            mainFrame.paddingRight = 32;
            mainFrame.paddingTop = 32;
            mainFrame.paddingBottom = 32;

            // Title
            const title = figma.createText();
            title.fontName = { family: "Inter", style: "SemiBold" };
            title.characters = "Icon Library";
            title.fontSize = 24;
            title.fills = [{ type: 'SOLID', color: { r: 0.15, g: 0.15, b: 0.15 } }];
            title.letterSpacing = { value: -0.3, unit: "PIXELS" };
            mainFrame.appendChild(title);

            // Metadata
            const metadata = figma.createText();
            metadata.fontName = { family: "Inter", style: "Regular" };
            metadata.characters = `${icons.length} icons • ${Object.keys(iconsByStyle).length} styles • 24×24px`;
            metadata.fontSize = 13;
            metadata.fills = [{ type: 'SOLID', color: { r: 0.55, g: 0.55, b: 0.55 } }];
            mainFrame.appendChild(metadata);

            // Create sections for each style
            let createdCount = 0;
            const iconSize = 24;
            const iconsPerRow = 24;

            for (const [style, styleIcons] of Object.entries(iconsByStyle)) {
                // Create style section container
                const styleSection = figma.createFrame();
                styleSection.name = style.charAt(0).toUpperCase() + style.slice(1);
                styleSection.fills = [];
                styleSection.layoutMode = 'VERTICAL';
                styleSection.primaryAxisSizingMode = 'AUTO';
                styleSection.counterAxisSizingMode = 'AUTO';
                styleSection.itemSpacing = 16;

                // Section title
                const sectionTitle = figma.createText();
                sectionTitle.fontName = { family: "Inter", style: "Medium" };
                sectionTitle.characters = `${style.charAt(0).toUpperCase() + style.slice(1)} (${styleIcons.length})`;
                sectionTitle.fontSize = 15;
                sectionTitle.fills = [{ type: 'SOLID', color: { r: 0.25, g: 0.25, b: 0.25 } }];
                styleSection.appendChild(sectionTitle);

                // Create grid container with wrapping
                const gridContainer = figma.createFrame();
                gridContainer.name = "Grid";
                gridContainer.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
                gridContainer.cornerRadius = 6;
                gridContainer.layoutMode = 'HORIZONTAL';
                gridContainer.primaryAxisSizingMode = 'FIXED';
                gridContainer.counterAxisSizingMode = 'AUTO';
                gridContainer.layoutWrap = 'WRAP';
                gridContainer.itemSpacing = 34;
                gridContainer.counterAxisSpacing = 34;
                gridContainer.paddingLeft = 34;
                gridContainer.paddingRight = 34;
                gridContainer.paddingTop = 34;
                gridContainer.paddingBottom = 34;
                gridContainer.resize(1200, 100);

                for (let i = 0; i < styleIcons.length; i++) {
                    const icon = styleIcons[i];
                    const svgKey = `${icon.style}-${icon.name}`;
                    const svg = svgData[svgKey];

                    if (!svg) {
                        console.warn(`No SVG data for icon: ${svgKey}`);
                        continue;
                    }

                    try {
                        // Create icon component
                        const iconComponent = figma.createComponent();
                        iconComponent.name = `${icon.style}/${icon.name}`;
                        iconComponent.resize(iconSize, iconSize);
                        iconComponent.fills = [];

                        // Create SVG node
                        const svgNode = figma.createNodeFromSvg(svg);

                        // Resize to fit
                        const scaleX = iconSize / svgNode.width;
                        const scaleY = iconSize / svgNode.height;
                        const scale = Math.min(scaleX, scaleY);
                        svgNode.resize(svgNode.width * scale, svgNode.height * scale);

                        // Center the SVG
                        svgNode.x = (iconSize - svgNode.width) / 2;
                        svgNode.y = (iconSize - svgNode.height) / 2;

                        // Apply color to all vector paths
                        function applyColorToNode(node) {
                            if (node.type === 'VECTOR' || node.type === 'BOOLEAN_OPERATION' || node.type === 'STAR' || node.type === 'ELLIPSE' || node.type === 'POLYGON' || node.type === 'RECTANGLE') {
                                if (node.fills && node.fills !== figma.mixed && node.fills.length > 0) {
                                    try {
                                        node.fills = [{
                                            type: 'SOLID',
                                            color: colorRgb,
                                            boundVariables: {
                                                color: {
                                                    type: 'VARIABLE_ALIAS',
                                                    id: iconColorVar.id
                                                }
                                            }
                                        }];
                                    } catch (e) {
                                        node.fills = [{ type: 'SOLID', color: colorRgb }];
                                    }
                                }

                                if (node.strokes && node.strokes !== figma.mixed && node.strokes.length > 0) {
                                    try {
                                        node.strokes = [{
                                            type: 'SOLID',
                                            color: colorRgb,
                                            boundVariables: {
                                                color: {
                                                    type: 'VARIABLE_ALIAS',
                                                    id: iconColorVar.id
                                                }
                                            }
                                        }];
                                    } catch (e) {
                                        node.strokes = [{ type: 'SOLID', color: colorRgb }];
                                    }
                                }
                            }

                            if ('children' in node) {
                                node.children.forEach(child => applyColorToNode(child));
                            }
                        }

                        applyColorToNode(svgNode);

                        // Flatten SVG children into icon component
                        if (svgNode.type === 'FRAME' || svgNode.type === 'GROUP') {
                            const children = [...svgNode.children];
                            children.forEach(child => {
                                child.x += svgNode.x;
                                child.y += svgNode.y;
                                iconComponent.appendChild(child);
                            });
                            svgNode.remove();
                        } else {
                            iconComponent.appendChild(svgNode);
                        }

                        // Add icon directly to grid container - wrapping handles layout
                        gridContainer.appendChild(iconComponent);

                        createdCount++;

                    } catch (error) {
                        console.error(`Error creating icon ${icon.name}:`, error);
                    }
                }

                styleSection.appendChild(gridContainer);
                mainFrame.appendChild(styleSection);
            }

            // Add to current page
            figma.currentPage.appendChild(mainFrame);

            // Center in viewport
            figma.viewport.scrollAndZoomIntoView([mainFrame]);

            figma.notify(`✅ Created ${createdCount} icon components in ${Object.keys(iconsByStyle).length} sections`);
        } catch (error) {
            figma.notify(`❌ Error adding icons: ${error.message}`);
            console.error('Add icons error:', error);
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

            // STEP 2: CREATE TYPOGRAPHY SIZE VARIABLES (Desktop & Mobile)
            let typographyCollection = collections.find(c => c.name === 'Typography/Sizes');

            if (!typographyCollection) {
                typographyCollection = figma.variables.createVariableCollection('Typography/Sizes');
                // Rename default mode to Desktop
                typographyCollection.renameMode(typographyCollection.modes[0].modeId, 'Desktop');
                // Add Mobile mode
                typographyCollection.addMode('Mobile');
            } else {
                // Check if Mobile mode exists, if not add it
                const hasMobileMode = typographyCollection.modes.some(mode => mode.name === 'Mobile');
                if (!hasMobileMode) {
                    typographyCollection.addMode('Mobile');
                }
            }

            // Get mode IDs
            const desktopModeId = typographyCollection.modes.find(m => m.name === 'Desktop').modeId;
            const mobileModeId = typographyCollection.modes.find(m => m.name === 'Mobile').modeId;

            // Create variables for each typography style
            const existingFloatVars = await figma.variables.getLocalVariablesAsync('FLOAT');
            const typographyVariables = {};

            for (const [key, style] of Object.entries(typography.styles)) {
                // Calculate mobile sizes (typically 80-90% of desktop)
                const mobileSize = Math.round(style.size * 0.85);
                const mobileLetterSpacing = style.letterSpacing;

                // Font Size Variable
                const sizeVarName = `typography/${key}/size`;
                let sizeVar = existingFloatVars.find(v => v.name === sizeVarName && v.variableCollectionId === typographyCollection.id);
                if (!sizeVar) {
                    sizeVar = figma.variables.createVariable(sizeVarName, typographyCollection, 'FLOAT');
                }
                sizeVar.setValueForMode(desktopModeId, style.size);
                sizeVar.setValueForMode(mobileModeId, mobileSize);

                // Letter Spacing Variable
                const letterSpacingVarName = `typography/${key}/letterSpacing`;
                let letterSpacingVar = existingFloatVars.find(v => v.name === letterSpacingVarName && v.variableCollectionId === typographyCollection.id);
                if (!letterSpacingVar) {
                    letterSpacingVar = figma.variables.createVariable(letterSpacingVarName, typographyCollection, 'FLOAT');
                }
                letterSpacingVar.setValueForMode(desktopModeId, style.letterSpacing);
                letterSpacingVar.setValueForMode(mobileModeId, mobileLetterSpacing);

                // Store variables for later use (no line height variable)
                typographyVariables[key] = {
                    size: sizeVar,
                    letterSpacing: letterSpacingVar,
                    lineHeight: style.lineHeight // Store as value, not variable
                };
            }

            // STEP 3: CREATE TEXT STYLES IN FIGMA
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
            let variableCount = Object.keys(typographyVariables).length * 2; // size and letterSpacing only

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

                    // Bind variables to text style (fontSize and letterSpacing only, NOT lineHeight)
                    if (typographyVariables[key]) {
                        try {
                            textStyle.setBoundVariable('fontSize', typographyVariables[key].size);
                            textStyle.setBoundVariable('letterSpacing', typographyVariables[key].letterSpacing);
                        } catch (error) {
                            console.log('Note: Some variable bindings not supported in this Figma version');
                        }
                    }

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

                        // Bind variables to text style (fontSize and letterSpacing only, NOT lineHeight)
                        if (typographyVariables[key]) {
                            try {
                                textStyle.setBoundVariable('fontSize', typographyVariables[key].size);
                                textStyle.setBoundVariable('letterSpacing', typographyVariables[key].letterSpacing);
                            } catch (error) {
                                console.log('Note: Some variable bindings not supported in this Figma version');
                            }
                        }

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

            // STEP 4: CREATE TYPOGRAPHY SYSTEM WITH MINIMAL CARD LAYOUT
            // Helper function to create a modern typography system
            async function createTypographyTable(title, fontFamily, styles, yPosition) {
                // Load Inter font for UI elements first
                await figma.loadFontAsync({ family: "Inter", style: "Bold" });
                await figma.loadFontAsync({ family: "Inter", style: "Semi Bold" });
                await figma.loadFontAsync({ family: "Inter", style: "Medium" });
                await figma.loadFontAsync({ family: "Inter", style: "Regular" });

                const categories = Object.keys(styles);

                // Create main container with modern styling
                const container = figma.createFrame();
                container.name = title;
                container.fills = [{ type: 'SOLID', color: { r: 0.98, g: 0.98, b: 0.99 } }];
                container.layoutMode = 'VERTICAL';
                container.primaryAxisSizingMode = 'AUTO';
                container.counterAxisSizingMode = 'AUTO';
                container.paddingLeft = 48;
                container.paddingRight = 48;
                container.paddingTop = 40;
                container.paddingBottom = 40;
                container.itemSpacing = 32;
                container.cornerRadius = 16;
                container.y = yPosition;

                // Header section
                const header = figma.createFrame();
                header.name = "Header";
                header.fills = [];
                header.layoutMode = 'VERTICAL';
                header.primaryAxisSizingMode = 'AUTO';
                header.counterAxisSizingMode = 'AUTO';
                header.itemSpacing = 8;

                // Title text
                const titleText = figma.createText();
                await figma.loadFontAsync({ family: "Inter", style: "Bold" });
                titleText.fontName = { family: "Inter", style: "Bold" };
                safeSetCharacters(titleText, title);
                titleText.fontSize = 32;
                titleText.fills = [{ type: 'SOLID', color: { r: 0.08, g: 0.08, b: 0.08 } }];
                header.appendChild(titleText);

                // Subtitle text
                const subtitleText = figma.createText();
                await figma.loadFontAsync({ family: "Inter", style: "Regular" });
                subtitleText.fontName = { family: "Inter", style: "Regular" };
                safeSetCharacters(subtitleText, `${fontFamily} • ${categories.length} Styles • Responsive Design`);
                subtitleText.fontSize = 15;
                subtitleText.fills = [{ type: 'SOLID', color: { r: 0.45, g: 0.45, b: 0.45 } }];
                header.appendChild(subtitleText);

                container.appendChild(header);

                // Create grid of style cards
                const grid = figma.createFrame();
                grid.name = "Typography Grid";
                grid.fills = [];
                grid.layoutMode = 'VERTICAL';
                grid.primaryAxisSizingMode = 'AUTO';
                grid.counterAxisSizingMode = 'AUTO';
                grid.itemSpacing = 16;

                // Create a card for each typography style
                for (const category of categories) {
                    const styleData = styles[category];
                    const mobileSize = Math.round(styleData.size * 0.85);
                    const lineHeightPercent = Math.round(styleData.lineHeight * 100);

                    // Determine weight value
                    let previewWeightValue = 400;
                    if (styleData.weight === 'Bold') previewWeightValue = 700;
                    else if (styleData.weight === 'Semibold') previewWeightValue = 600;
                    else if (styleData.weight === 'Medium') previewWeightValue = 500;

                    // Load the font for preview text
                    const previewFontName = findBestFont(fontFamily, previewWeightValue);
                    await figma.loadFontAsync(previewFontName);

                    // Card container
                    const card = figma.createFrame();
                    card.name = `${category} Card`;
                    card.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
                    card.layoutMode = 'VERTICAL';
                    card.primaryAxisSizingMode = 'AUTO'; // Hug height
                    card.counterAxisSizingMode = 'AUTO'; // Hug width
                    card.paddingLeft = 32;
                    card.paddingRight = 32;
                    card.paddingTop = 28;
                    card.paddingBottom = 28;
                    card.itemSpacing = 20;
                    card.cornerRadius = 12;
                    card.effects = [{
                        type: 'DROP_SHADOW',
                        color: { r: 0, g: 0, b: 0, a: 0.04 },
                        offset: { x: 0, y: 2 },
                        radius: 8,
                        visible: true,
                        blendMode: 'NORMAL'
                    }];

                    // Top section: Category name and preview
                    const topSection = figma.createFrame();
                    topSection.name = "Top Section";
                    topSection.fills = [];
                    topSection.layoutMode = 'VERTICAL';
                    topSection.primaryAxisSizingMode = 'AUTO';
                    topSection.counterAxisSizingMode = 'AUTO';
                    topSection.itemSpacing = 16;

                    // Category label
                    const categoryLabel = figma.createText();
                    await figma.loadFontAsync({ family: "Inter", style: "Semi Bold" });
                    categoryLabel.fontName = { family: "Inter", style: "Semi Bold" };
                    safeSetCharacters(categoryLabel, category.toUpperCase());
                    categoryLabel.fontSize = 13;
                    categoryLabel.fills = [{ type: 'SOLID', color: { r: 0.5, g: 0.5, b: 0.5 } }];
                    categoryLabel.letterSpacing = { value: 1, unit: 'PIXELS' };
                    topSection.appendChild(categoryLabel);

                    // Preview text with actual style
                    const previewText = figma.createText();
                    previewText.fontName = previewFontName;
                    safeSetCharacters(previewText, "The quick brown fox jumps over the lazy dog");
                    previewText.fontSize = styleData.size;
                    previewText.fills = [{ type: 'SOLID', color: { r: 0.1, g: 0.1, b: 0.1 } }];
                    previewText.lineHeight = { value: styleData.lineHeight * 100, unit: 'PERCENT' };
                    previewText.letterSpacing = { value: styleData.letterSpacing, unit: 'PIXELS' };
                    topSection.appendChild(previewText);

                    card.appendChild(topSection);

                    // Divider
                    const divider = figma.createFrame();
                    divider.name = "Divider";
                    divider.resize(736, 1);
                    divider.fills = [{ type: 'SOLID', color: { r: 0.93, g: 0.93, b: 0.94 } }];
                    card.appendChild(divider);

                    // Specs section
                    const specsSection = figma.createFrame();
                    specsSection.name = "Specs";
                    specsSection.fills = [];
                    specsSection.layoutMode = 'HORIZONTAL';
                    specsSection.primaryAxisSizingMode = 'AUTO';
                    specsSection.counterAxisSizingMode = 'AUTO';
                    specsSection.itemSpacing = 40;

                    // Create spec items inline to avoid scope issues
                    // Desktop spec
                    const desktopItem = figma.createFrame();
                    desktopItem.name = "Desktop";
                    desktopItem.fills = [];
                    desktopItem.layoutMode = 'VERTICAL';
                    desktopItem.primaryAxisSizingMode = 'AUTO';
                    desktopItem.counterAxisSizingMode = 'AUTO';
                    desktopItem.itemSpacing = 6;

                    const desktopLabel = figma.createText();
                    await figma.loadFontAsync({ family: "Inter", style: "Medium" });
                    desktopLabel.fontName = { family: "Inter", style: "Medium" };
                    safeSetCharacters(desktopLabel, "Desktop");
                    desktopLabel.fontSize = 11;
                    desktopLabel.fills = [{ type: 'SOLID', color: { r: 0.55, g: 0.55, b: 0.55 } }];
                    desktopItem.appendChild(desktopLabel);

                    const desktopValue = figma.createText();
                    await figma.loadFontAsync({ family: "Inter", style: "Semi Bold" });
                    desktopValue.fontName = { family: "Inter", style: "Semi Bold" };
                    safeSetCharacters(desktopValue, `${styleData.size}px`);
                    desktopValue.fontSize = 16;
                    desktopValue.fills = [{ type: 'SOLID', color: { r: 0.15, g: 0.15, b: 0.15 } }];
                    desktopItem.appendChild(desktopValue);

                    const desktopSublabel = figma.createText();
                    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
                    desktopSublabel.fontName = { family: "Inter", style: "Regular" };
                    safeSetCharacters(desktopSublabel, "Font Size");
                    desktopSublabel.fontSize = 10;
                    desktopSublabel.fills = [{ type: 'SOLID', color: { r: 0.6, g: 0.6, b: 0.6 } }];
                    desktopItem.appendChild(desktopSublabel);

                    specsSection.appendChild(desktopItem);

                    // Mobile spec
                    const mobileItem = figma.createFrame();
                    mobileItem.name = "Mobile";
                    mobileItem.fills = [];
                    mobileItem.layoutMode = 'VERTICAL';
                    mobileItem.primaryAxisSizingMode = 'AUTO';
                    mobileItem.counterAxisSizingMode = 'AUTO';
                    mobileItem.itemSpacing = 6;

                    const mobileLabel = figma.createText();
                    mobileLabel.fontName = { family: "Inter", style: "Medium" };
                    safeSetCharacters(mobileLabel, "Mobile");
                    mobileLabel.fontSize = 11;
                    mobileLabel.fills = [{ type: 'SOLID', color: { r: 0.55, g: 0.55, b: 0.55 } }];
                    mobileItem.appendChild(mobileLabel);

                    const mobileValue = figma.createText();
                    mobileValue.fontName = { family: "Inter", style: "Semi Bold" };
                    safeSetCharacters(mobileValue, `${mobileSize}px`);
                    mobileValue.fontSize = 16;
                    mobileValue.fills = [{ type: 'SOLID', color: { r: 0.15, g: 0.15, b: 0.15 } }];
                    mobileItem.appendChild(mobileValue);

                    const mobileSublabel = figma.createText();
                    mobileSublabel.fontName = { family: "Inter", style: "Regular" };
                    safeSetCharacters(mobileSublabel, "Font Size");
                    mobileSublabel.fontSize = 10;
                    mobileSublabel.fills = [{ type: 'SOLID', color: { r: 0.6, g: 0.6, b: 0.6 } }];
                    mobileItem.appendChild(mobileSublabel);

                    specsSection.appendChild(mobileItem);

                    // Line Height spec
                    const lineHeightItem = figma.createFrame();
                    lineHeightItem.name = "Line Height";
                    lineHeightItem.fills = [];
                    lineHeightItem.layoutMode = 'VERTICAL';
                    lineHeightItem.primaryAxisSizingMode = 'AUTO';
                    lineHeightItem.counterAxisSizingMode = 'AUTO';
                    lineHeightItem.itemSpacing = 6;

                    const lineHeightLabel = figma.createText();
                    lineHeightLabel.fontName = { family: "Inter", style: "Medium" };
                    safeSetCharacters(lineHeightLabel, "Line Height");
                    lineHeightLabel.fontSize = 11;
                    lineHeightLabel.fills = [{ type: 'SOLID', color: { r: 0.55, g: 0.55, b: 0.55 } }];
                    lineHeightItem.appendChild(lineHeightLabel);

                    const lineHeightValue = figma.createText();
                    lineHeightValue.fontName = { family: "Inter", style: "Semi Bold" };
                    safeSetCharacters(lineHeightValue, `${lineHeightPercent}%`);
                    lineHeightValue.fontSize = 16;
                    lineHeightValue.fills = [{ type: 'SOLID', color: { r: 0.15, g: 0.15, b: 0.15 } }];
                    lineHeightItem.appendChild(lineHeightValue);

                    specsSection.appendChild(lineHeightItem);

                    // Letter Spacing spec
                    const letterSpacingItem = figma.createFrame();
                    letterSpacingItem.name = "Letter Spacing";
                    letterSpacingItem.fills = [];
                    letterSpacingItem.layoutMode = 'VERTICAL';
                    letterSpacingItem.primaryAxisSizingMode = 'AUTO';
                    letterSpacingItem.counterAxisSizingMode = 'AUTO';
                    letterSpacingItem.itemSpacing = 6;

                    const letterSpacingLabel = figma.createText();
                    letterSpacingLabel.fontName = { family: "Inter", style: "Medium" };
                    safeSetCharacters(letterSpacingLabel, "Letter Spacing");
                    letterSpacingLabel.fontSize = 11;
                    letterSpacingLabel.fills = [{ type: 'SOLID', color: { r: 0.55, g: 0.55, b: 0.55 } }];
                    letterSpacingItem.appendChild(letterSpacingLabel);

                    const letterSpacingValue = figma.createText();
                    letterSpacingValue.fontName = { family: "Inter", style: "Semi Bold" };
                    safeSetCharacters(letterSpacingValue, `${styleData.letterSpacing}px`);
                    letterSpacingValue.fontSize = 16;
                    letterSpacingValue.fills = [{ type: 'SOLID', color: { r: 0.15, g: 0.15, b: 0.15 } }];
                    letterSpacingItem.appendChild(letterSpacingValue);

                    specsSection.appendChild(letterSpacingItem);


                    card.appendChild(specsSection);
                    grid.appendChild(card);
                }

                container.appendChild(grid);
                return container;
            }

            const frames = [];
            let currentY = 0;

            // Create PRIMARY font table
            const primaryFrame = await createTypographyTable(
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
                const secondaryFrame = await createTypographyTable(
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

            const systemCount = frames.length;
            figma.notify(`✅ Created ${variableCount} typography variables (Desktop + Mobile), ${createdStylesCount} text styles, and ${systemCount} typography system(s)!`);
        } catch (error) {
            figma.notify(`❌ Error creating text styles: ${error.message}`);
            console.error('Text styles error:', error);
        }
    }

    if (msg.type === 'import-github-icons') {
        try {
            const { library, iconColor } = msg;

            figma.notify(`🔄 Loading ${library} icons from GitHub...`);

            // Helper to convert hex to RGB
            function hexToRgb(hex) {
                const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                return result ? {
                    r: parseInt(result[1], 16) / 255,
                    g: parseInt(result[2], 16) / 255,
                    b: parseInt(result[3], 16) / 255
                } : { r: 0, g: 0, b: 0 };
            }

            const colorRgb = hexToRgb(iconColor);

            // Create or get pages for icon libraries
            let vuesaxPage = figma.root.findChild(node => node.name === 'Icon Library – Vuesax');
            let boxPage = figma.root.findChild(node => node.name === 'Icon Library – Box Icons');

            if (library === 'vuesax' && !vuesaxPage) {
                vuesaxPage = figma.createPage();
                vuesaxPage.name = 'Icon Library – Vuesax';
            } else if (library === 'box' && !boxPage) {
                boxPage = figma.createPage();
                boxPage.name = 'Icon Library – Box Icons';
            }

            const targetPage = library === 'vuesax' ? vuesaxPage : boxPage;

            // Switch to target page
            figma.currentPage = targetPage;

            // Send request to UI to fetch icons
            figma.ui.postMessage({
                type: 'fetch-github-icons',
                library: library
            });

        } catch (error) {
            figma.notify(`❌ Error importing icons: ${error.message}`);
            console.error('Import icons error:', error);
        }
    }

    if (msg.type === 'create-github-icons') {
        (async () => {
            try {
                const { library, icons, iconColor } = msg;

                // Validate inputs
                if (!library || !icons || !iconColor) {
                    figma.notify('❌ Missing required parameters');
                    return;
                }

                if (!Array.isArray(icons) || icons.length === 0) {
                    figma.notify('❌ No icons to import');
                    return;
                }

                // Helper to convert hex to RGB
                function hexToRgb(hex) {
                    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                    return result ? {
                        r: parseInt(result[1], 16) / 255,
                        g: parseInt(result[2], 16) / 255,
                        b: parseInt(result[3], 16) / 255
                    } : { r: 0, g: 0, b: 0 };
                }

                const colorRgb = hexToRgb(iconColor);

                // Helper to sanitize SVG
                function sanitizeSVG(svgString) {
                    try {
                        if (!svgString) return null;
                        // Remove fill and stroke attributes
                        let sanitized = svgString.replace(/fill="[^"]*"/g, '');
                        sanitized = sanitized.replace(/stroke="[^"]*"/g, '');
                        // Remove width and height but keep viewBox
                        sanitized = sanitized.replace(/width="[^"]*"/g, '');
                        sanitized = sanitized.replace(/height="[^"]*"/g, '');
                        return sanitized;
                    } catch (e) {
                        console.error('SVG sanitization error:', e);
                        return null;
                    }
                }

                // Helper to apply color to SVG nodes
                function applyColorToNode(node, color) {
                    try {
                        if (node.type === 'VECTOR' || node.type === 'BOOLEAN_OPERATION' ||
                            node.type === 'STAR' || node.type === 'ELLIPSE' ||
                            node.type === 'POLYGON' || node.type === 'RECTANGLE') {

                            // Apply fill color
                            if (node.fills && node.fills !== figma.mixed && node.fills.length > 0) {
                                node.fills = [{ type: 'SOLID', color: color }];
                            }

                            // Apply stroke color
                            if (node.strokes && node.strokes !== figma.mixed && node.strokes.length > 0) {
                                node.strokes = [{ type: 'SOLID', color: color }];
                            }
                        }

                        // Recursively apply to children
                        if ('children' in node) {
                            node.children.forEach(child => applyColorToNode(child, color));
                        }
                    } catch (e) {
                        console.error('Error applying color to node:', e);
                    }
                }

                let createdCount = 0;
                let skippedCount = 0;

                // Try to load Inter fonts, fallback to Roboto if not available
                let fontBold = { family: "Roboto", style: "Bold" };
                let fontSemiBold = { family: "Roboto", style: "Medium" }; // Roboto doesn't have SemiBold
                let fontMedium = { family: "Roboto", style: "Medium" };
                let fontRegular = { family: "Roboto", style: "Regular" };

                try {
                    await figma.loadFontAsync({ family: "Inter", style: "Bold" });
                    await figma.loadFontAsync({ family: "Inter", style: "SemiBold" });
                    await figma.loadFontAsync({ family: "Inter", style: "Medium" });
                    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
                    fontBold = { family: "Inter", style: "Bold" };
                    fontSemiBold = { family: "Inter", style: "SemiBold" };
                    fontMedium = { family: "Inter", style: "Medium" };
                    fontRegular = { family: "Inter", style: "Regular" };
                } catch (fontError) {
                    console.log('Inter font not available, using Roboto');
                    // Load Roboto fonts
                    await figma.loadFontAsync(fontBold);
                    await figma.loadFontAsync(fontMedium);
                    await figma.loadFontAsync(fontRegular);
                }

                // Group icons by style
                const iconsByStyle = {};
                icons.forEach(icon => {
                    const style = icon.style || 'default';
                    if (!iconsByStyle[style]) {
                        iconsByStyle[style] = [];
                    }
                    iconsByStyle[style].push(icon);
                });

                // Create main page container
                const mainContainer = figma.createFrame();
                const libraryName = library === 'vuesax' ? 'Vuesax' : 'Box';
                mainContainer.name = `${libraryName} Icons`;
                mainContainer.fills = [{ type: 'SOLID', color: { r: 0.97, g: 0.97, b: 0.97 } }];

                // Set auto-layout for main container - VERTICAL (header on top, sections below)
                mainContainer.layoutMode = 'VERTICAL';
                mainContainer.primaryAxisSizingMode = 'AUTO';
                mainContainer.counterAxisSizingMode = 'AUTO';
                mainContainer.itemSpacing = 32;
                mainContainer.paddingLeft = 32;
                mainContainer.paddingRight = 32;
                mainContainer.paddingTop = 32;
                mainContainer.paddingBottom = 32;

                figma.currentPage.appendChild(mainContainer);

                // Create simple header
                const headerText = figma.createText();
                await figma.loadFontAsync(fontBold);
                headerText.fontName = fontBold;
                headerText.fontSize = 24;
                headerText.characters = `${libraryName} Icons (${icons.length} total)`;
                headerText.fills = [{ type: 'SOLID', color: { r: 0.15, g: 0.15, b: 0.15 } }];
                headerText.letterSpacing = { value: -0.3, unit: "PIXELS" };
                mainContainer.appendChild(headerText);

                // Create sections container - HORIZONTAL for side by side sections
                const sectionsContainer = figma.createFrame();
                sectionsContainer.name = "Sections";
                sectionsContainer.fills = [];
                sectionsContainer.layoutMode = 'HORIZONTAL';
                sectionsContainer.primaryAxisSizingMode = 'AUTO';
                sectionsContainer.counterAxisSizingMode = 'AUTO';
                sectionsContainer.primaryAxisAlignItems = 'MIN'; // Align to top
                sectionsContainer.itemSpacing = 32; // Space between sections
                mainContainer.appendChild(sectionsContainer);

                // Process icons by style
                for (const [styleName, styleIcons] of Object.entries(iconsByStyle)) {
                    const styleNameCapitalized = styleName.charAt(0).toUpperCase() + styleName.slice(1);

                    // Create style section
                    const styleSection = figma.createFrame();
                    styleSection.name = styleNameCapitalized;
                    styleSection.fills = [];
                    styleSection.layoutMode = 'VERTICAL';
                    styleSection.primaryAxisSizingMode = 'AUTO';
                    styleSection.counterAxisSizingMode = 'AUTO';
                    styleSection.itemSpacing = 16;

                    // Style title
                    const styleTitle = figma.createText();
                    await figma.loadFontAsync(fontMedium);
                    styleTitle.fontName = fontMedium;
                    styleTitle.fontSize = 15;
                    styleTitle.characters = `${styleNameCapitalized} (${styleIcons.length})`;
                    styleTitle.fills = [{ type: 'SOLID', color: { r: 0.25, g: 0.25, b: 0.25 } }];
                    styleSection.appendChild(styleTitle);

                    // Auto-layout grid with wrapping
                    const gridContainer = figma.createFrame();
                    gridContainer.name = "Grid";
                    gridContainer.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
                    gridContainer.cornerRadius = 6;

                    // Set up horizontal auto-layout with wrapping
                    gridContainer.layoutMode = 'HORIZONTAL';
                    gridContainer.primaryAxisSizingMode = 'FIXED'; // Fixed width
                    gridContainer.counterAxisSizingMode = 'AUTO'; // Auto height
                    gridContainer.layoutWrap = 'WRAP'; // Enable wrapping
                    gridContainer.itemSpacing = 34; // 34px spacing between icons horizontally
                    gridContainer.counterAxisSpacing = 34; // 34px spacing between rows vertically
                    gridContainer.paddingLeft = 34;
                    gridContainer.paddingRight = 34;
                    gridContainer.paddingTop = 34;
                    gridContainer.paddingBottom = 34;
                    gridContainer.resize(1200, 100); // Fixed width 1200px, height will auto-adjust

                    // Grid configuration
                    const iconSize = 24;

                    // Process icons in this style
                    for (let i = 0; i < styleIcons.length; i++) {
                        const icon = styleIcons[i];

                        try {
                            const sanitized = sanitizeSVG(icon.svg);
                            if (!sanitized) {
                                skippedCount++;
                                continue;
                            }

                            // Create the icon component
                            const styleNameFormatted = styleName.charAt(0).toUpperCase() + styleName.slice(1);
                            const iconComponent = figma.createComponent();
                            iconComponent.name = `${libraryName}/${styleNameFormatted}/${icon.name}`;
                            iconComponent.resize(iconSize, iconSize);
                            iconComponent.fills = [];

                            // Create SVG node
                            const svgNode = figma.createNodeFromSvg(sanitized);

                            // Scale to 24x24
                            const scaleX = iconSize / svgNode.width;
                            const scaleY = iconSize / svgNode.height;
                            const scale = Math.min(scaleX, scaleY);
                            svgNode.resize(svgNode.width * scale, svgNode.height * scale);

                            // Center within icon component
                            svgNode.x = (iconSize - svgNode.width) / 2;
                            svgNode.y = (iconSize - svgNode.height) / 2;

                            // Apply color
                            applyColorToNode(svgNode, colorRgb);

                            // Move children to component
                            if (svgNode.type === 'FRAME' || svgNode.type === 'GROUP') {
                                const children = [...svgNode.children];
                                children.forEach(child => {
                                    child.x += svgNode.x;
                                    child.y += svgNode.y;
                                    iconComponent.appendChild(child);
                                });
                                svgNode.remove();
                            } else {
                                iconComponent.appendChild(svgNode);
                            }

                            // Add icon directly to grid container - wrapping handles rows automatically
                            gridContainer.appendChild(iconComponent);

                            allComponents.push(iconComponent);
                            createdCount++;

                        } catch (error) {
                            console.error(`Error creating icon ${icon.name}:`, error);
                            skippedCount++;
                        }
                    }

                    styleSection.appendChild(gridContainer);
                    sectionsContainer.appendChild(styleSection);

                    // Update progress
                    figma.notify(`Creating ${styleNameCapitalized}... (${createdCount} / ${icons.length})`);
                }

                // Center viewport
                figma.viewport.scrollAndZoomIntoView([mainContainer]);

                // Show summary
                figma.notify(`✅ Created ${createdCount} icons! Skipped: ${skippedCount}`);

            } catch (error) {
                const errorMsg = error && error.message ? error.message : String(error);
                figma.notify(`❌ Error creating icons: ${errorMsg}`);
                console.error('Create icons error:', error);
            }
        })();
    }

    // Icon Library handlers
    if (msg.type === 'generate-icon-library') {
        (async () => {
            try {
                console.log('Received generate-icon-library message:', msg);
                console.log('Icon list length:', msg.iconList.length);
                const result = await generateIconLibrary(msg.libraryId, msg.categoryId, msg.iconList);
                figma.notify(`✅ Created ${result.successCount} icons! Failed: ${result.failCount}`);
                figma.ui.postMessage({ type: 'generation-complete' });
            } catch (error) {
                console.error('Icon library error:', error);
                figma.notify(`❌ Error: ${error.message}`);
                figma.ui.postMessage({ type: 'generation-complete' });
            }
        })();
    }

    if (msg.type === 'generate-all-library-icons') {
        (async () => {
            try {
                console.log('Received generate-all-library-icons message:', msg);
                console.log('Categories:', msg.categories.length);
                figma.notify('🚀 Starting to generate all icons...');
                const result = await generateAllLibraryIcons(msg.libraryId, msg.categories);
                figma.notify(`✅ Created ${result.totalSuccess} icons in ${result.categoriesCreated} categories! Failed: ${result.totalFailed}`);
                figma.ui.postMessage({ type: 'generation-complete' });
            } catch (error) {
                console.error('Generate all icons error:', error);
                figma.notify(`❌ Error: ${error.message}`);
                figma.ui.postMessage({ type: 'generation-complete' });
            }
        })();
    }

    if (msg.type === 'insert-single-icon') {
        (async () => {
            try {
                const iconList = [msg.iconName];
                const result = await generateIconLibrary(msg.libraryId, msg.categoryId, iconList);
                if (result.successCount > 0) {
                    figma.notify(`✅ Icon inserted!`);
                } else {
                    figma.notify(`❌ Failed to insert icon`);
                }
            } catch (error) {
                figma.notify(`❌ Error: ${error.message}`);
                console.error('Insert icon error:', error);
            }
        })();
    }
};

// Icon Library Functions
async function fetchSVG(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.status}`);
        }
        return await response.text();
    } catch (error) {
        console.error(`Error fetching SVG from ${url}:`, error);
        return null;
    }
}

function cleanSVG(svgText) {
    let cleaned = svgText.replace(/\s*width="[^"]*"/gi, '');
    cleaned = cleaned.replace(/\s*height="[^"]*"/gi, '');
    return cleaned;
}

function createIconComponent(svgText, iconName, size = 24) {
    const cleaned = cleanSVG(svgText);
    const svgNode = figma.createNodeFromSvg(cleaned);

    const component = figma.createComponent();
    component.name = iconName;
    component.resize(size, size);
    component.fills = [];

    const scaleX = size / svgNode.width;
    const scaleY = size / svgNode.height;
    const scale = Math.min(scaleX, scaleY);
    svgNode.resize(svgNode.width * scale, svgNode.height * scale);

    svgNode.x = (size - svgNode.width) / 2;
    svgNode.y = (size - svgNode.height) / 2;

    if (svgNode.type === 'FRAME' || svgNode.type === 'GROUP') {
        const children = [...svgNode.children];
        children.forEach(child => {
            child.x += svgNode.x;
            child.y += svgNode.y;
            component.appendChild(child);
        });
        svgNode.remove();
    } else {
        component.appendChild(svgNode);
    }

    return component;
}

function getOrCreateIconLibraryPage() {
    let page = figma.root.children.find(p => p.name === 'Icon Library');
    if (!page) {
        page = figma.createPage();
        page.name = 'Icon Library';
    }
    return page;
}

function createCategoryFrame(categoryName, x = 0, y = 0) {
    const frame = figma.createFrame();
    frame.name = categoryName;
    frame.x = x;
    frame.y = y;
    frame.fills = [];

    frame.layoutMode = 'HORIZONTAL';
    frame.primaryAxisSizingMode = 'AUTO';
    frame.counterAxisSizingMode = 'AUTO';
    frame.primaryAxisAlignItems = 'MIN';
    frame.counterAxisAlignItems = 'MIN';
    frame.itemSpacing = 16;
    frame.paddingLeft = 16;
    frame.paddingRight = 16;
    frame.paddingTop = 16;
    frame.paddingBottom = 16;
    frame.layoutWrap = 'WRAP';

    return frame;
}

async function generateIconLibrary(libraryId, categoryId, iconList) {
    const ICON_LIBRARIES = {
        'box-icons': {
            name: 'Box Icons',
            categories: {
                'logos': {
                    name: 'Logos',
                    baseUrl: 'https://raw.githubusercontent.com/harsh2277/Box-Icon/192522ef45d183c510a068c65fbbb208ddca0813/svg/logos'
                },
                'regular': {
                    name: 'Regular',
                    baseUrl: 'https://raw.githubusercontent.com/harsh2277/Box-Icon/192522ef45d183c510a068c65fbbb208ddca0813/svg/regular'
                },
                'solid': {
                    name: 'Solid',
                    baseUrl: 'https://raw.githubusercontent.com/harsh2277/Box-Icon/192522ef45d183c510a068c65fbbb208ddca0813/svg/solid'
                }
            }
        },
        'vuesax-icons': {
            name: 'Vuesax Icons',
            categories: {
                'outline': {
                    name: 'Outline',
                    baseUrl: 'https://raw.githubusercontent.com/harsh2277/Vuesax-Icon/1fc373df0cef028768f13d29571b0f6e163d7d68/outline'
                },
                'bulk': {
                    name: 'Bulk',
                    baseUrl: 'https://raw.githubusercontent.com/harsh2277/Vuesax-Icon/1fc373df0cef028768f13d29571b0f6e163d7d68/bulk'
                },
                'bold': {
                    name: 'Bold',
                    baseUrl: 'https://raw.githubusercontent.com/harsh2277/Vuesax-Icon/1fc373df0cef028768f13d29571b0f6e163d7d68/bold'
                }
            }
        },
        'unicons': {
            name: 'Unicons',
            categories: {
                'line': {
                    name: 'Line',
                    baseUrl: 'https://raw.githubusercontent.com/harsh2277/unicons/41643545a256b97c0c4cd646817cf352da4ce866/line'
                },
                'monochrome': {
                    name: 'Monochrome',
                    baseUrl: 'https://raw.githubusercontent.com/harsh2277/unicons/41643545a256b97c0c4cd646817cf352da4ce866/monochrome'
                },
                'solid': {
                    name: 'Solid',
                    baseUrl: 'https://raw.githubusercontent.com/harsh2277/unicons/41643545a256b97c0c4cd646817cf352da4ce866/solid'
                },
                'thinline': {
                    name: 'Thinline',
                    baseUrl: 'https://raw.githubusercontent.com/harsh2277/unicons/41643545a256b97c0c4cd646817cf352da4ce866/thinline'
                }
            }
        }
    };

    const page = getOrCreateIconLibraryPage();
    const originalPage = figma.currentPage;
    await figma.setCurrentPageAsync(page);

    try {
        const library = ICON_LIBRARIES[libraryId];
        if (!library) {
            throw new Error(`Library ${libraryId} not found`);
        }

        const category = library.categories[categoryId];
        if (!category) {
            throw new Error(`Category ${categoryId} not found`);
        }

        const categoryFrame = createCategoryFrame(
            `${library.name} / ${category.name}`,
            0,
            0
        );
        page.appendChild(categoryFrame);

        const components = [];
        let successCount = 0;
        let failCount = 0;

        const BATCH_SIZE = 20; // Fetch 20 icons at a time

        // Process icons in batches for better performance
        for (let i = 0; i < iconList.length; i += BATCH_SIZE) {
            const batch = iconList.slice(i, i + BATCH_SIZE);

            // Fetch SVGs in parallel
            const svgPromises = batch.map(iconName => {
                const url = `${category.baseUrl}/${iconName}`;
                return fetchSVG(url).then(svgText => ({ iconName, svgText }));
            });

            const results = await Promise.all(svgPromises);

            // Create components from fetched SVGs
            for (const { iconName, svgText } of results) {
                if (svgText) {
                    try {
                        const component = createIconComponent(svgText, iconName.replace('.svg', ''), 24);
                        // Add to page directly, not to categoryFrame
                        page.appendChild(component);
                        components.push(component);
                        successCount++;
                    } catch (error) {
                        console.error(`Error creating component for ${iconName}:`, error);
                        failCount++;
                    }
                } else {
                    failCount++;
                }
            }

            // Update progress
            const progress = Math.min(i + BATCH_SIZE, iconList.length);
            figma.notify(`📦 Creating icons... (${progress}/${iconList.length})`);
        }

        // Remove the temporary category frame (no longer needed)
        categoryFrame.remove();

        // Don't combine into component set - keep as individual components
        if (components.length > 0) {
            figma.notify(`✅ Created ${components.length} individual icon components`);

            // Create container frame with heading and subheading
            await figma.loadFontAsync({ family: "Inter", style: "Bold" });
            await figma.loadFontAsync({ family: "Inter", style: "Regular" });

            const containerFrame = figma.createFrame();
            containerFrame.name = `🎨 ${library.name} / ${category.name}`;
            containerFrame.layoutMode = 'VERTICAL';
            containerFrame.primaryAxisSizingMode = 'AUTO';
            containerFrame.counterAxisSizingMode = 'AUTO';
            containerFrame.primaryAxisAlignItems = 'MIN';
            containerFrame.counterAxisAlignItems = 'MIN';
            containerFrame.itemSpacing = 24;
            containerFrame.paddingLeft = 40;
            containerFrame.paddingRight = 40;
            containerFrame.paddingTop = 40;
            containerFrame.paddingBottom = 40;
            containerFrame.fills = [{ type: 'SOLID', color: { r: 0.97, g: 0.97, b: 0.98 } }];
            containerFrame.cornerRadius = 12;

            // Create heading
            const heading = figma.createText();
            heading.fontName = { family: "Inter", style: "Bold" };
            heading.fontSize = 24;
            heading.characters = `${library.name} / ${category.name}`;
            heading.fills = [{ type: 'SOLID', color: { r: 0.1, g: 0.1, b: 0.1 } }];

            // Create subheading
            const subheading = figma.createText();
            subheading.fontName = { family: "Inter", style: "Regular" };
            subheading.fontSize = 14;
            subheading.characters = `${successCount} icons • ${iconList.length} total`;
            subheading.fills = [{ type: 'SOLID', color: { r: 0.5, g: 0.5, b: 0.5 } }];

            // Create icons container frame with grid layout
            const iconsFrame = figma.createFrame();
            iconsFrame.name = "Icons";
            iconsFrame.layoutMode = 'HORIZONTAL';
            iconsFrame.primaryAxisSizingMode = 'AUTO';
            iconsFrame.counterAxisSizingMode = 'AUTO';
            iconsFrame.primaryAxisAlignItems = 'MIN';
            iconsFrame.counterAxisAlignItems = 'MIN';
            iconsFrame.itemSpacing = 16;
            iconsFrame.counterAxisSpacing = 16;
            iconsFrame.paddingLeft = 16;
            iconsFrame.paddingRight = 16;
            iconsFrame.paddingTop = 16;
            iconsFrame.paddingBottom = 16;
            iconsFrame.layoutWrap = 'WRAP';
            iconsFrame.fills = [];

            // Calculate max width for 20 icons per row
            const iconWidth = 24;
            const spacing = 16;
            const iconsPerRow = 20;
            const padding = 32;
            const maxWidth = (iconWidth + spacing) * iconsPerRow - spacing + padding;
            iconsFrame.resize(maxWidth, iconsFrame.height);

            // Add all components to the icons frame
            components.forEach(component => {
                iconsFrame.appendChild(component);
            });

            page.appendChild(containerFrame);
            containerFrame.appendChild(heading);
            containerFrame.appendChild(subheading);
            containerFrame.appendChild(iconsFrame);

            figma.viewport.scrollAndZoomIntoView([containerFrame]);
        }

        await figma.setCurrentPageAsync(originalPage);

        return {
            success: true,
            successCount,
            failCount,
            total: iconList.length
        };

    } catch (error) {
        await figma.setCurrentPageAsync(originalPage);
        throw error;
    }
}

async function generateAllLibraryIcons(libraryId, categories) {
    const ICON_LIBRARIES = {
        'box-icons': {
            name: 'Box Icons',
            categories: {
                'logos': {
                    name: 'Logos',
                    baseUrl: 'https://raw.githubusercontent.com/harsh2277/Box-Icon/192522ef45d183c510a068c65fbbb208ddca0813/svg/logos'
                },
                'regular': {
                    name: 'Regular',
                    baseUrl: 'https://raw.githubusercontent.com/harsh2277/Box-Icon/192522ef45d183c510a068c65fbbb208ddca0813/svg/regular'
                },
                'solid': {
                    name: 'Solid',
                    baseUrl: 'https://raw.githubusercontent.com/harsh2277/Box-Icon/192522ef45d183c510a068c65fbbb208ddca0813/svg/solid'
                }
            }
        },
        'vuesax-icons': {
            name: 'Vuesax Icons',
            categories: {
                'outline': {
                    name: 'Outline',
                    baseUrl: 'https://raw.githubusercontent.com/harsh2277/Vuesax-Icon/1fc373df0cef028768f13d29571b0f6e163d7d68/outline'
                },
                'bulk': {
                    name: 'Bulk',
                    baseUrl: 'https://raw.githubusercontent.com/harsh2277/Vuesax-Icon/1fc373df0cef028768f13d29571b0f6e163d7d68/bulk'
                },
                'bold': {
                    name: 'Bold',
                    baseUrl: 'https://raw.githubusercontent.com/harsh2277/Vuesax-Icon/1fc373df0cef028768f13d29571b0f6e163d7d68/bold'
                }
            }
        },
        'unicons': {
            name: 'Unicons',
            categories: {
                'line': {
                    name: 'Line',
                    baseUrl: 'https://raw.githubusercontent.com/harsh2277/unicons/41643545a256b97c0c4cd646817cf352da4ce866/line'
                },
                'monochrome': {
                    name: 'Monochrome',
                    baseUrl: 'https://raw.githubusercontent.com/harsh2277/unicons/41643545a256b97c0c4cd646817cf352da4ce866/monochrome'
                },
                'solid': {
                    name: 'Solid',
                    baseUrl: 'https://raw.githubusercontent.com/harsh2277/unicons/41643545a256b97c0c4cd646817cf352da4ce866/solid'
                },
                'thinline': {
                    name: 'Thinline',
                    baseUrl: 'https://raw.githubusercontent.com/harsh2277/unicons/41643545a256b97c0c4cd646817cf352da4ce866/thinline'
                }
            }
        }
    };

    const page = getOrCreateIconLibraryPage();
    const originalPage = figma.currentPage;
    await figma.setCurrentPageAsync(page);

    try {
        const library = ICON_LIBRARIES[libraryId];
        if (!library) {
            throw new Error(`Library ${libraryId} not found`);
        }

        let totalSuccess = 0;
        let totalFailed = 0;
        let categoriesCreated = 0;
        const allContainerFrames = [];
        let yOffset = 0;

        const BATCH_SIZE = 20; // Fetch 20 icons at a time

        // Load fonts once at the beginning
        await figma.loadFontAsync({ family: "Inter", style: "Bold" });
        await figma.loadFontAsync({ family: "Inter", style: "Regular" });

        for (const categoryData of categories) {
            const { categoryId, categoryName, iconList } = categoryData;
            const category = library.categories[categoryId];

            if (!category) continue;

            figma.notify(`📦 Creating ${categoryName}... (0/${iconList.length})`);

            const categoryFrame = createCategoryFrame(
                `${library.name} / ${categoryName}`,
                0,
                yOffset
            );
            page.appendChild(categoryFrame);

            const components = [];
            let successCount = 0;
            let failCount = 0;

            // Process icons in batches for better performance
            for (let i = 0; i < iconList.length; i += BATCH_SIZE) {
                const batch = iconList.slice(i, i + BATCH_SIZE);

                // Fetch SVGs in parallel
                const svgPromises = batch.map(iconName => {
                    const url = `${category.baseUrl}/${iconName}`;
                    return fetchSVG(url).then(svgText => ({ iconName, svgText }));
                });

                const results = await Promise.all(svgPromises);

                // Create components from fetched SVGs
                for (const { iconName, svgText } of results) {
                    if (svgText) {
                        try {
                            const component = createIconComponent(svgText, iconName.replace('.svg', ''), 24);
                            // Add to page directly, not to categoryFrame
                            page.appendChild(component);
                            components.push(component);
                            successCount++;
                        } catch (error) {
                            console.error(`Error creating component for ${iconName}:`, error);
                            failCount++;
                        }
                    } else {
                        failCount++;
                    }
                }

                // Update progress
                const progress = Math.min(i + BATCH_SIZE, iconList.length);
                figma.notify(`📦 Creating ${categoryName}... (${progress}/${iconList.length})`);
            }

            // Remove the temporary category frame (no longer needed)
            categoryFrame.remove();

            // Don't combine into component set - keep as individual components
            if (components.length > 0) {
                figma.notify(`✅ Created ${components.length} individual icon components`);

                // Create container frame with heading and subheading
                const containerFrame = figma.createFrame();
                containerFrame.name = `🎨 ${library.name} / ${categoryName}`;
                containerFrame.layoutMode = 'VERTICAL';
                containerFrame.primaryAxisSizingMode = 'AUTO';
                containerFrame.counterAxisSizingMode = 'AUTO';
                containerFrame.primaryAxisAlignItems = 'MIN';
                containerFrame.counterAxisAlignItems = 'MIN';
                containerFrame.itemSpacing = 24;
                containerFrame.paddingLeft = 40;
                containerFrame.paddingRight = 40;
                containerFrame.paddingTop = 40;
                containerFrame.paddingBottom = 40;
                containerFrame.fills = [{ type: 'SOLID', color: { r: 0.97, g: 0.97, b: 0.98 } }];
                containerFrame.cornerRadius = 12;
                containerFrame.y = yOffset;

                // Create heading
                const heading = figma.createText();
                heading.fontName = { family: "Inter", style: "Bold" };
                heading.fontSize = 24;
                heading.characters = `${library.name} / ${categoryName}`;
                heading.fills = [{ type: 'SOLID', color: { r: 0.1, g: 0.1, b: 0.1 } }];

                // Create subheading
                const subheading = figma.createText();
                subheading.fontName = { family: "Inter", style: "Regular" };
                subheading.fontSize = 14;
                subheading.characters = `${successCount} icons • ${iconList.length} total`;
                subheading.fills = [{ type: 'SOLID', color: { r: 0.5, g: 0.5, b: 0.5 } }];

                // Create icons container frame with grid layout
                const iconsFrame = figma.createFrame();
                iconsFrame.name = "Icons";
                iconsFrame.layoutMode = 'HORIZONTAL';
                iconsFrame.primaryAxisSizingMode = 'AUTO';
                iconsFrame.counterAxisSizingMode = 'AUTO';
                iconsFrame.primaryAxisAlignItems = 'MIN';
                iconsFrame.counterAxisAlignItems = 'MIN';
                iconsFrame.itemSpacing = 16;
                iconsFrame.counterAxisSpacing = 16;
                iconsFrame.paddingLeft = 16;
                iconsFrame.paddingRight = 16;
                iconsFrame.paddingTop = 16;
                iconsFrame.paddingBottom = 16;
                iconsFrame.layoutWrap = 'WRAP';
                iconsFrame.fills = [];

                // Calculate max width for 20 icons per row
                const iconWidth = 24;
                const spacing = 16;
                const iconsPerRow = 20;
                const padding = 32;
                const maxWidth = (iconWidth + spacing) * iconsPerRow - spacing + padding;
                iconsFrame.resize(maxWidth, iconsFrame.height);

                // Add all components to the icons frame
                components.forEach(component => {
                    iconsFrame.appendChild(component);
                });

                page.appendChild(containerFrame);
                containerFrame.appendChild(heading);
                containerFrame.appendChild(subheading);
                containerFrame.appendChild(iconsFrame);

                allContainerFrames.push(containerFrame);
                yOffset += containerFrame.height + 100;
            }

            totalSuccess += successCount;
            totalFailed += failCount;
            categoriesCreated++;

            figma.notify(`✅ ${categoryName} complete! (${successCount} icons)`);
        }

        if (allContainerFrames.length > 0) {
            figma.viewport.scrollAndZoomIntoView(allContainerFrames);
        }

        await figma.setCurrentPageAsync(originalPage);

        return {
            success: true,
            totalSuccess,
            totalFailed,
            categoriesCreated
        };

    } catch (error) {
        await figma.setCurrentPageAsync(originalPage);
        throw error;
    }
}

