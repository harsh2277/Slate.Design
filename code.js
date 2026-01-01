// Figma plugin backend code
// Import icon data
// Note: In Figma plugins, we need to pass icon data through the UI
figma.showUI(__html__, { width: 1000, height: 600, themeColors: true });

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
                    const leftIcon = leftIconComponent.createInstance();
                    leftIcon.name = "LeftIcon";
                    leftIcon.resize(size.iconSize, size.iconSize);
                    leftIcon.visible = false; // Default to hidden

                    // Apply the correct color to the icon based on button text color
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

                    applyColorToIconInstance(leftIcon, state.textColor);
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
                    const rightIcon = rightIconComponent.createInstance();
                    rightIcon.name = "RightIcon";
                    rightIcon.resize(size.iconSize, size.iconSize);
                    rightIcon.visible = false; // Default to hidden

                    applyColorToIconInstance(rightIcon, state.textColor);
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

    // Position icon components near the button component set
    leftIconComponent.x = componentSet.x + componentSet.width + 100;
    leftIconComponent.y = componentSet.y;
    rightIconComponent.x = leftIconComponent.x + leftIconComponent.width + 20;
    rightIconComponent.y = componentSet.y;

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

    // Center in viewport (include icon components)
    figma.viewport.scrollAndZoomIntoView([componentSet, leftIconComponent, rightIconComponent]);

    const totalVariants = sizes.length * variants.length * variants[0].states.length * iconConfigs.length;
    figma.notify(`✅ Button component set created with 3 sizes, 4 variants, 4 states, and swappable icon components! Total: ${totalVariants} components`);
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

    // Position icon components near the input component set
    searchIconComponent.x = componentSet.x + componentSet.width + 100;
    searchIconComponent.y = componentSet.y;
    closeIconComponent.x = searchIconComponent.x + searchIconComponent.width + 20;
    closeIconComponent.y = componentSet.y;

    // Center in viewport
    figma.viewport.scrollAndZoomIntoView([componentSet, searchIconComponent, closeIconComponent]);

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

                // Check if Dark mode exists, if not add it
                const hasDarkMode = collection.modes.some(mode => mode.name === 'Dark');
                if (!hasDarkMode) {
                    collection.addMode('Dark');
                }
            } else {
                collection = figma.variables.createVariableCollection('Design System Colors');
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

                    const groupedName = `Primary/${name}`;
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

                    const groupedName = `Secondary/${name}`;
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
                    const groupedName = `Success/${name}`;
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
                    const groupedName = `Error/${name}`;
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
                    const groupedName = `Warning/${name}`;
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
                    const groupedName = `Info/${name}`;
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

                    const groupedName = `Neutral/${name}`;
                    await createOrUpdateVariable(groupedName, lightValue, darkValue, collection, lightModeId, darkModeId);
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

            // Create visual documentation frame with modern design
            const frame = figma.createFrame();
            frame.name = "Design System Tokens";
            frame.resize(1400, 800);
            frame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }]; // Pure white background

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

            let yOffset = 80;

            // Add header section with background
            const headerBg = figma.createRectangle();
            headerBg.resize(1400, 120);
            headerBg.x = 0;
            headerBg.y = 0;
            headerBg.fills = [{ type: 'SOLID', color: { r: 0.02, g: 0.02, b: 0.08 } }]; // Dark navy
            frame.appendChild(headerBg);

            // Add title
            const title = figma.createText();
            try {
                title.fontName = { family: "Inter", style: "Bold" };
            } catch (e) {
                // Fallback to default font
            }
            title.fontSize = 36;
            title.characters = "Design System Tokens";
            title.x = 48;
            title.y = 36;
            title.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
            title.letterSpacing = { value: -1, unit: "PIXELS" };
            frame.appendChild(title);

            // Add description
            const description = figma.createText();
            try {
                description.fontName = { family: "Inter", style: "Regular" };
            } catch (e) {
                // Fallback to default font
            }
            description.fontSize = 14;
            description.x = 48;
            description.y = 78;
            description.fills = [{ type: 'SOLID', color: { r: 0.7, g: 0.7, b: 0.75 } }];
            frame.appendChild(description);

            yOffset = 160;

            // Helper function to create modern color swatch
            function createColorSwatch(colorName, hexColor, x, y, parent) {
                const swatchContainer = figma.createFrame();
                swatchContainer.name = colorName;
                swatchContainer.resize(100, 130);
                swatchContainer.x = x;
                swatchContainer.y = y;
                swatchContainer.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
                swatchContainer.cornerRadius = 12;
                swatchContainer.strokes = [{ type: 'SOLID', color: { r: 0.92, g: 0.92, b: 0.94 } }];
                swatchContainer.strokeWeight = 1;

                // Add subtle shadow
                swatchContainer.effects = [{
                    type: 'DROP_SHADOW',
                    color: { r: 0, g: 0, b: 0, a: 0.04 },
                    offset: { x: 0, y: 2 },
                    radius: 8,
                    visible: true,
                    blendMode: 'NORMAL'
                }];

                // Color rectangle with rounded corners
                const colorRect = figma.createRectangle();
                colorRect.resize(84, 76);
                colorRect.x = 8;
                colorRect.y = 8;
                colorRect.cornerRadius = 8;
                const rgb = hexToRgb(hexColor);
                colorRect.fills = [{ type: 'SOLID', color: rgb }];

                // Add inner border for light colors
                const brightness = rgb.r * 0.299 + rgb.g * 0.587 + rgb.b * 0.114;
                if (brightness > 0.9) {
                    colorRect.strokes = [{ type: 'SOLID', color: { r: 0.9, g: 0.9, b: 0.92 } }];
                    colorRect.strokeWeight = 1;
                }

                swatchContainer.appendChild(colorRect);

                // Color name text
                const nameText = figma.createText();
                try {
                    nameText.fontName = { family: "Inter", style: "Semi Bold" };
                } catch (e) {
                    // Fallback to default font
                }
                nameText.fontSize = 11;
                nameText.characters = colorName.split('/')[1] || colorName;
                nameText.x = 8;
                nameText.y = 92;
                nameText.resize(84, 16);
                nameText.fills = [{ type: 'SOLID', color: { r: 0.1, g: 0.1, b: 0.12 } }];
                nameText.letterSpacing = { value: -0.2, unit: "PIXELS" };
                swatchContainer.appendChild(nameText);

                // Hex value text
                const hexText = figma.createText();
                try {
                    hexText.fontName = { family: "Inter", style: "Regular" };
                } catch (e) {
                    // Fallback to default font
                }
                hexText.fontSize = 10;
                hexText.characters = hexColor.toUpperCase();
                hexText.x = 8;
                hexText.y = 108;
                hexText.resize(84, 14);
                hexText.fills = [{ type: 'SOLID', color: { r: 0.45, g: 0.45, b: 0.5 } }];
                swatchContainer.appendChild(hexText);

                parent.appendChild(swatchContainer);
                return swatchContainer;
            }

            // Helper function to create modern section
            function createSection(sectionTitle, colorData, yPos) {
                if (!colorData || Object.keys(colorData).length === 0) return yPos;

                // Section container with background
                const sectionBg = figma.createRectangle();
                sectionBg.resize(1304, 40);
                sectionBg.x = 48;
                sectionBg.y = yPos;
                sectionBg.cornerRadius = 8;
                sectionBg.fills = [{ type: 'SOLID', color: { r: 0.97, g: 0.97, b: 0.98 } }];
                frame.appendChild(sectionBg);

                // Section title
                const sectionLabel = figma.createText();
                try {
                    sectionLabel.fontName = { family: "Inter", style: "Bold" };
                } catch (e) {
                    // Fallback to default font
                }
                sectionLabel.fontSize = 14;
                sectionLabel.characters = sectionTitle;
                sectionLabel.x = 64;
                sectionLabel.y = yPos + 12;
                sectionLabel.fills = [{ type: 'SOLID', color: { r: 0.1, g: 0.1, b: 0.12 } }];
                sectionLabel.letterSpacing = { value: 0.5, unit: "PIXELS" };
                sectionLabel.textCase = 'UPPER';
                frame.appendChild(sectionLabel);

                // Create swatches
                let xOffset = 48;
                let currentY = yPos + 56;
                let swatchCount = 0;
                const maxSwatchesPerRow = 12;

                Object.entries(colorData).forEach(([name, value]) => {
                    if (swatchCount > 0 && swatchCount % maxSwatchesPerRow === 0) {
                        xOffset = 48;
                        currentY += 146;
                    }

                    createColorSwatch(name, value, xOffset, currentY, frame);
                    xOffset += 108;
                    swatchCount++;
                });

                return currentY + 162;
            }

            // Create sections for each color group (use light mode colors for display)
            if (colors.primary && colors.primary.light) {
                yOffset = createSection("Primary", colors.primary.light, yOffset);
            }

            if (colors.secondary && colors.secondary.light) {
                yOffset = createSection("Secondary", colors.secondary.light, yOffset);
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

            if (colors.info) {
                yOffset = createSection("Info", colors.info, yOffset);
            }

            if (colors.neutral && colors.neutral.light) {
                yOffset = createSection("Neutral", colors.neutral.light, yOffset);
            }

            // Add spacing section if spacing data exists
            if (msg.spacing && Object.keys(msg.spacing).length > 0) {
                // Section container with background
                const sectionBg = figma.createRectangle();
                sectionBg.resize(1304, 40);
                sectionBg.x = 48;
                sectionBg.y = yOffset;
                sectionBg.cornerRadius = 8;
                sectionBg.fills = [{ type: 'SOLID', color: { r: 0.97, g: 0.97, b: 0.98 } }];
                frame.appendChild(sectionBg);

                // Section title
                const spacingLabel = figma.createText();
                try {
                    spacingLabel.fontName = { family: "Inter", style: "Bold" };
                } catch (e) {
                    // Fallback to default font
                }
                spacingLabel.fontSize = 14;
                spacingLabel.characters = "Spacing";
                spacingLabel.x = 64;
                spacingLabel.y = yOffset + 12;
                spacingLabel.fills = [{ type: 'SOLID', color: { r: 0.1, g: 0.1, b: 0.12 } }];
                spacingLabel.letterSpacing = { value: 0.5, unit: "PIXELS" };
                spacingLabel.textCase = 'UPPER';
                frame.appendChild(spacingLabel);

                // Create spacing tokens
                let xOffset = 48;
                let currentY = yOffset + 56;
                let tokenCount = 0;
                const maxTokensPerRow = 16;

                Object.entries(msg.spacing).forEach(([name, value]) => {
                    if (tokenCount > 0 && tokenCount % maxTokensPerRow === 0) {
                        xOffset = 48;
                        currentY += 76;
                    }

                    // Create modern spacing token card
                    const tokenCard = figma.createFrame();
                    tokenCard.name = name;
                    tokenCard.resize(76, 64);
                    tokenCard.x = xOffset;
                    tokenCard.y = currentY;
                    tokenCard.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
                    tokenCard.cornerRadius = 10;
                    tokenCard.strokes = [{ type: 'SOLID', color: { r: 0.92, g: 0.92, b: 0.94 } }];
                    tokenCard.strokeWeight = 1;

                    // Add subtle shadow
                    tokenCard.effects = [{
                        type: 'DROP_SHADOW',
                        color: { r: 0, g: 0, b: 0, a: 0.03 },
                        offset: { x: 0, y: 1 },
                        radius: 4,
                        visible: true,
                        blendMode: 'NORMAL'
                    }];

                    // Token name
                    const tokenName = figma.createText();
                    try {
                        tokenName.fontName = { family: "Inter", style: "Medium" };
                    } catch (e) {
                        // Fallback
                    }
                    tokenName.fontSize = 9;
                    tokenName.characters = name;
                    tokenName.x = 0;
                    tokenName.y = 10;
                    tokenName.resize(76, 12);
                    tokenName.textAlignHorizontal = 'CENTER';
                    tokenName.fills = [{ type: 'SOLID', color: { r: 0.45, g: 0.45, b: 0.5 } }];
                    tokenCard.appendChild(tokenName);

                    // Token value
                    const tokenValue = figma.createText();
                    try {
                        tokenValue.fontName = { family: "Inter", style: "Bold" };
                    } catch (e) {
                        // Fallback
                    }
                    tokenValue.fontSize = 16;
                    tokenValue.characters = `${value}`;
                    tokenValue.x = 0;
                    tokenValue.y = 28;
                    tokenValue.resize(76, 20);
                    tokenValue.textAlignHorizontal = 'CENTER';
                    tokenValue.fills = [{ type: 'SOLID', color: { r: 0.1, g: 0.1, b: 0.12 } }];
                    tokenCard.appendChild(tokenValue);

                    // Unit label
                    const unitLabel = figma.createText();
                    try {
                        unitLabel.fontName = { family: "Inter", style: "Regular" };
                    } catch (e) {
                        // Fallback
                    }
                    unitLabel.fontSize = 9;
                    unitLabel.characters = "px";
                    unitLabel.x = 0;
                    unitLabel.y = 48;
                    unitLabel.resize(76, 10);
                    unitLabel.textAlignHorizontal = 'CENTER';
                    unitLabel.fills = [{ type: 'SOLID', color: { r: 0.55, g: 0.55, b: 0.6 } }];
                    tokenCard.appendChild(unitLabel);

                    frame.appendChild(tokenCard);
                    xOffset += 82;
                    tokenCount++;
                });

                yOffset = currentY + 92;
            }

            // Add radius section if radius data exists
            if (msg.radius && Object.keys(msg.radius).length > 0) {
                // Section container with background
                const sectionBg = figma.createRectangle();
                sectionBg.resize(1304, 40);
                sectionBg.x = 48;
                sectionBg.y = yOffset;
                sectionBg.cornerRadius = 8;
                sectionBg.fills = [{ type: 'SOLID', color: { r: 0.97, g: 0.97, b: 0.98 } }];
                frame.appendChild(sectionBg);

                // Section title
                const radiusLabel = figma.createText();
                try {
                    radiusLabel.fontName = { family: "Inter", style: "Bold" };
                } catch (e) {
                    // Fallback to default font
                }
                radiusLabel.fontSize = 14;
                radiusLabel.characters = "Radius";
                radiusLabel.x = 64;
                radiusLabel.y = yOffset + 12;
                radiusLabel.fills = [{ type: 'SOLID', color: { r: 0.1, g: 0.1, b: 0.12 } }];
                radiusLabel.letterSpacing = { value: 0.5, unit: "PIXELS" };
                radiusLabel.textCase = 'UPPER';
                frame.appendChild(radiusLabel);

                // Create radius tokens
                let xOffset = 48;
                let currentY = yOffset + 56;
                let tokenCount = 0;
                const maxTokensPerRow = 16;

                Object.entries(msg.radius).forEach(([name, value]) => {
                    if (tokenCount > 0 && tokenCount % maxTokensPerRow === 0) {
                        xOffset = 48;
                        currentY += 76;
                    }

                    // Create modern radius token card
                    const tokenCard = figma.createFrame();
                    tokenCard.name = name;
                    tokenCard.resize(76, 64);
                    tokenCard.x = xOffset;
                    tokenCard.y = currentY;
                    tokenCard.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
                    tokenCard.cornerRadius = value === 9999 ? 32 : Math.min(value, 10);
                    tokenCard.strokes = [{ type: 'SOLID', color: { r: 0.92, g: 0.92, b: 0.94 } }];
                    tokenCard.strokeWeight = 1;

                    // Add subtle shadow
                    tokenCard.effects = [{
                        type: 'DROP_SHADOW',
                        color: { r: 0, g: 0, b: 0, a: 0.03 },
                        offset: { x: 0, y: 1 },
                        radius: 4,
                        visible: true,
                        blendMode: 'NORMAL'
                    }];

                    // Token name
                    const tokenName = figma.createText();
                    try {
                        tokenName.fontName = { family: "Inter", style: "Medium" };
                    } catch (e) {
                        // Fallback
                    }
                    tokenName.fontSize = 9;
                    tokenName.characters = name;
                    tokenName.x = 0;
                    tokenName.y = 10;
                    tokenName.resize(76, 12);
                    tokenName.textAlignHorizontal = 'CENTER';
                    tokenName.fills = [{ type: 'SOLID', color: { r: 0.45, g: 0.45, b: 0.5 } }];
                    tokenCard.appendChild(tokenName);

                    // Token value
                    const tokenValue = figma.createText();
                    try {
                        tokenValue.fontName = { family: "Inter", style: "Bold" };
                    } catch (e) {
                        // Fallback
                    }
                    tokenValue.fontSize = 16;
                    const displayValue = value === 9999 ? '∞' : `${value}`;
                    tokenValue.characters = displayValue;
                    tokenValue.x = 0;
                    tokenValue.y = 28;
                    tokenValue.resize(76, 20);
                    tokenValue.textAlignHorizontal = 'CENTER';
                    tokenValue.fills = [{ type: 'SOLID', color: { r: 0.1, g: 0.1, b: 0.12 } }];
                    tokenCard.appendChild(tokenValue);

                    // Unit label
                    const unitLabel = figma.createText();
                    try {
                        unitLabel.fontName = { family: "Inter", style: "Regular" };
                    } catch (e) {
                        // Fallback
                    }
                    unitLabel.fontSize = 9;
                    unitLabel.characters = value === 9999 ? '' : 'px';
                    unitLabel.x = 0;
                    unitLabel.y = 48;
                    unitLabel.resize(76, 10);
                    unitLabel.textAlignHorizontal = 'CENTER';
                    unitLabel.fills = [{ type: 'SOLID', color: { r: 0.55, g: 0.55, b: 0.6 } }];
                    tokenCard.appendChild(unitLabel);

                    frame.appendChild(tokenCard);
                    xOffset += 82;
                    tokenCount++;
                });

                yOffset = currentY + 92;
            }

            // Add stroke section if stroke data exists
            if (msg.strokes && Object.keys(msg.strokes).length > 0) {
                // Section container with background
                const sectionBg = figma.createRectangle();
                sectionBg.resize(1304, 40);
                sectionBg.x = 48;
                sectionBg.y = yOffset;
                sectionBg.cornerRadius = 8;
                sectionBg.fills = [{ type: 'SOLID', color: { r: 0.97, g: 0.97, b: 0.98 } }];
                frame.appendChild(sectionBg);

                // Section title
                const strokeLabel = figma.createText();
                try {
                    strokeLabel.fontName = { family: "Inter", style: "Bold" };
                } catch (e) {
                    // Fallback to default font
                }
                strokeLabel.fontSize = 14;
                strokeLabel.characters = "Stroke";
                strokeLabel.x = 64;
                strokeLabel.y = yOffset + 12;
                strokeLabel.fills = [{ type: 'SOLID', color: { r: 0.1, g: 0.1, b: 0.12 } }];
                strokeLabel.letterSpacing = { value: 0.5, unit: "PIXELS" };
                strokeLabel.textCase = 'UPPER';
                frame.appendChild(strokeLabel);

                // Create stroke tokens
                let xOffset = 48;
                let currentY = yOffset + 56;
                let tokenCount = 0;
                const maxTokensPerRow = 16;

                Object.entries(msg.strokes).forEach(([name, value]) => {
                    if (tokenCount > 0 && tokenCount % maxTokensPerRow === 0) {
                        xOffset = 48;
                        currentY += 76;
                    }

                    // Create modern stroke token card
                    const tokenCard = figma.createFrame();
                    tokenCard.name = name;
                    tokenCard.resize(76, 64);
                    tokenCard.x = xOffset;
                    tokenCard.y = currentY;
                    tokenCard.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
                    tokenCard.cornerRadius = 10;
                    tokenCard.strokes = [{ type: 'SOLID', color: { r: 0.1, g: 0.1, b: 0.12 } }];
                    tokenCard.strokeWeight = Math.min(value, 4);

                    // Add subtle shadow
                    tokenCard.effects = [{
                        type: 'DROP_SHADOW',
                        color: { r: 0, g: 0, b: 0, a: 0.03 },
                        offset: { x: 0, y: 1 },
                        radius: 4,
                        visible: true,
                        blendMode: 'NORMAL'
                    }];

                    // Token name
                    const tokenName = figma.createText();
                    try {
                        tokenName.fontName = { family: "Inter", style: "Medium" };
                    } catch (e) {
                        // Fallback
                    }
                    tokenName.fontSize = 9;
                    tokenName.characters = name;
                    tokenName.x = 0;
                    tokenName.y = 10;
                    tokenName.resize(76, 12);
                    tokenName.textAlignHorizontal = 'CENTER';
                    tokenName.fills = [{ type: 'SOLID', color: { r: 0.45, g: 0.45, b: 0.5 } }];
                    tokenCard.appendChild(tokenName);

                    // Token value
                    const tokenValue = figma.createText();
                    try {
                        tokenValue.fontName = { family: "Inter", style: "Bold" };
                    } catch (e) {
                        // Fallback
                    }
                    tokenValue.fontSize = 16;
                    tokenValue.characters = `${value}`;
                    tokenValue.x = 0;
                    tokenValue.y = 28;
                    tokenValue.resize(76, 20);
                    tokenValue.textAlignHorizontal = 'CENTER';
                    tokenValue.fills = [{ type: 'SOLID', color: { r: 0.1, g: 0.1, b: 0.12 } }];
                    tokenCard.appendChild(tokenValue);

                    // Unit label
                    const unitLabel = figma.createText();
                    try {
                        unitLabel.fontName = { family: "Inter", style: "Regular" };
                    } catch (e) {
                        // Fallback
                    }
                    unitLabel.fontSize = 9;
                    unitLabel.characters = "px";
                    unitLabel.x = 0;
                    unitLabel.y = 48;
                    unitLabel.resize(76, 10);
                    unitLabel.textAlignHorizontal = 'CENTER';
                    unitLabel.fills = [{ type: 'SOLID', color: { r: 0.55, g: 0.55, b: 0.6 } }];
                    tokenCard.appendChild(unitLabel);

                    frame.appendChild(tokenCard);
                    xOffset += 82;
                    tokenCount++;
                });

                yOffset = currentY + 92;
            }

            // Add shadow section if shadow data exists
            if (msg.shadows && Object.keys(msg.shadows).length > 0) {
                // Section container with background
                const sectionBg = figma.createRectangle();
                sectionBg.resize(1304, 40);
                sectionBg.x = 48;
                sectionBg.y = yOffset;
                sectionBg.cornerRadius = 8;
                sectionBg.fills = [{ type: 'SOLID', color: { r: 0.97, g: 0.97, b: 0.98 } }];
                frame.appendChild(sectionBg);

                // Section title
                const shadowLabel = figma.createText();
                try {
                    shadowLabel.fontName = { family: "Inter", style: "Bold" };
                } catch (e) {
                    // Fallback to default font
                }
                shadowLabel.fontSize = 14;
                shadowLabel.characters = "Shadow";
                shadowLabel.x = 64;
                shadowLabel.y = yOffset + 12;
                shadowLabel.fills = [{ type: 'SOLID', color: { r: 0.1, g: 0.1, b: 0.12 } }];
                shadowLabel.letterSpacing = { value: 0.5, unit: "PIXELS" };
                shadowLabel.textCase = 'UPPER';
                frame.appendChild(shadowLabel);

                // Create shadow tokens
                let xOffset = 48;
                let currentY = yOffset + 56;
                let tokenCount = 0;
                const maxTokensPerRow = 16;

                Object.entries(msg.shadows).forEach(([name, value]) => {
                    if (tokenCount > 0 && tokenCount % maxTokensPerRow === 0) {
                        xOffset = 48;
                        currentY += 76;
                    }

                    // Create modern shadow token card
                    const tokenCard = figma.createFrame();
                    tokenCard.name = name;
                    tokenCard.resize(76, 64);
                    tokenCard.x = xOffset;
                    tokenCard.y = currentY;
                    tokenCard.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
                    tokenCard.cornerRadius = 10;
                    tokenCard.strokes = [{ type: 'SOLID', color: { r: 0.92, g: 0.92, b: 0.94 } }];
                    tokenCard.strokeWeight = 1;

                    // Add shadow effect if not 'none'
                    if (value !== 'none') {
                        // Parse shadow value to apply actual shadow
                        const shadowMatch = value.match(/(-?\d+)(?:px)?\s+(-?\d+)(?:px)?\s+(-?\d+)(?:px)?\s+rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
                        if (shadowMatch) {
                            const [, x, y, blur, r, g, b, a] = shadowMatch;
                            tokenCard.effects = [{
                                type: 'DROP_SHADOW',
                                color: {
                                    r: parseInt(r) / 255,
                                    g: parseInt(g) / 255,
                                    b: parseInt(b) / 255,
                                    a: parseFloat(a)
                                },
                                offset: { x: parseInt(x), y: parseInt(y) },
                                radius: parseInt(blur),
                                visible: true,
                                blendMode: 'NORMAL'
                            }];
                        }
                    }

                    // Token name
                    const tokenName = figma.createText();
                    try {
                        tokenName.fontName = { family: "Inter", style: "Medium" };
                    } catch (e) {
                        // Fallback
                    }
                    tokenName.fontSize = 9;
                    tokenName.characters = name.replace('shadow-', '');
                    tokenName.x = 0;
                    tokenName.y = 10;
                    tokenName.resize(76, 12);
                    tokenName.textAlignHorizontal = 'CENTER';
                    tokenName.fills = [{ type: 'SOLID', color: { r: 0.45, g: 0.45, b: 0.5 } }];
                    tokenCard.appendChild(tokenName);

                    // Token value (elevation indicator)
                    const tokenValue = figma.createText();
                    try {
                        tokenValue.fontName = { family: "Inter", style: "Bold" };
                    } catch (e) {
                        // Fallback
                    }
                    tokenValue.fontSize = 16;
                    tokenValue.characters = name.replace('shadow-', '').toUpperCase();
                    tokenValue.x = 0;
                    tokenValue.y = 28;
                    tokenValue.resize(76, 20);
                    tokenValue.textAlignHorizontal = 'CENTER';
                    tokenValue.fills = [{ type: 'SOLID', color: { r: 0.1, g: 0.1, b: 0.12 } }];
                    tokenCard.appendChild(tokenValue);

                    frame.appendChild(tokenCard);
                    xOffset += 82;
                    tokenCount++;
                });

                yOffset = currentY + 92;
            }

            // Resize frame to fit content
            frame.resize(1400, yOffset + 60);

            // Center the frame in viewport
            figma.viewport.scrollAndZoomIntoView([frame]);

            const totalVars = createdCount + spacingCount + radiusCount + strokeCount;
            const varMessage = `${createdCount} colors (Light + Dark modes), ${spacingCount} spacing, ${radiusCount} radius, ${strokeCount} stroke`;
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
            title.fontSize = 24;
            title.characters = "Icon Library";
            title.fills = [{ type: 'SOLID', color: { r: 0.15, g: 0.15, b: 0.15 } }];
            title.letterSpacing = { value: -0.3, unit: "PIXELS" };
            mainFrame.appendChild(title);

            // Metadata
            const metadata = figma.createText();
            metadata.fontName = { family: "Inter", style: "Regular" };
            metadata.fontSize = 13;
            metadata.characters = `${icons.length} icons • ${Object.keys(iconsByStyle).length} styles • 24×24px`;
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
                sectionTitle.fontSize = 15;
                sectionTitle.characters = `${style.charAt(0).toUpperCase() + style.slice(1)} (${styleIcons.length})`;
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

            // STEP 4: CREATE TYPOGRAPHY TABLES WITH AUTO LAYOUT
            // Helper function to create a typography table
            function createTypographyTable(title, fontFamily, styles, yPosition) {
                const cellWidth = 150;
                const cellHeight = 60;
                const padding = 16;

                const categories = Object.keys(styles);
                const rowLabels = ['Category', 'Font Size (Desktop)', 'Font Size (Mobile)', 'Line Height', 'Letter Spacing'];

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
                subtitleText.characters = `Font: ${fontFamily} • Responsive: Desktop & Mobile`;
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

                // Create rows (now 5 rows instead of 4)
                for (let row = 0; row < 5; row++) {
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
                                // Font Size (Desktop)
                                text.fontName = { family: "Inter", style: "Medium" };
                                text.fontSize = 12;
                                text.characters = `${styleData.size}px`;
                                text.fills = [{ type: 'SOLID', color: { r: 0.3, g: 0.3, b: 0.3 } }];
                            } else if (row === 2) {
                                // Font Size (Mobile)
                                text.fontName = { family: "Inter", style: "Medium" };
                                text.fontSize = 12;
                                const mobileSize = Math.round(styleData.size * 0.85);
                                text.characters = `${mobileSize}px`;
                                text.fills = [{ type: 'SOLID', color: { r: 0.4, g: 0.4, b: 0.4 } }];
                            } else if (row === 3) {
                                // Line Height
                                text.fontName = { family: "Inter", style: "Medium" };
                                text.fontSize = 12;
                                const lineHeightPercent = Math.round(styleData.lineHeight * 100);
                                text.characters = `${lineHeightPercent}%`;
                                text.fills = [{ type: 'SOLID', color: { r: 0.3, g: 0.3, b: 0.3 } }];
                            } else if (row === 4) {
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
            figma.notify(`✅ Created ${variableCount} typography variables (Desktop + Mobile), ${createdStylesCount} text styles, and ${tableCount} table(s)!`);
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
                'twotone': {
                    name: 'Twotone',
                    baseUrl: 'https://raw.githubusercontent.com/harsh2277/Vuesax-Icon/1fc373df0cef028768f13d29571b0f6e163d7d68/twotone'
                },
                'outline': {
                    name: 'Outline',
                    baseUrl: 'https://raw.githubusercontent.com/harsh2277/Vuesax-Icon/1fc373df0cef028768f13d29571b0f6e163d7d68/outline'
                },
                'linear': {
                    name: 'Linear',
                    baseUrl: 'https://raw.githubusercontent.com/harsh2277/Vuesax-Icon/1fc373df0cef028768f13d29571b0f6e163d7d68/linear'
                },
                'bulk': {
                    name: 'Bulk',
                    baseUrl: 'https://raw.githubusercontent.com/harsh2277/Vuesax-Icon/1fc373df0cef028768f13d29571b0f6e163d7d68/bulk'
                },
                'broken': {
                    name: 'Broken',
                    baseUrl: 'https://raw.githubusercontent.com/harsh2277/Vuesax-Icon/1fc373df0cef028768f13d29571b0f6e163d7d68/broken'
                },
                'bold': {
                    name: 'Bold',
                    baseUrl: 'https://raw.githubusercontent.com/harsh2277/Vuesax-Icon/1fc373df0cef028768f13d29571b0f6e163d7d68/bold'
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
                        categoryFrame.appendChild(component);
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
        
        if (components.length > 1) {
            figma.notify(`🔧 Combining ${components.length} icons into Component Set...`);
            const componentSet = figma.combineAsVariants(components, page);
            componentSet.name = `${library.name} / ${category.name}`;
            
            // Set up grid layout with 20 icons per row
            componentSet.layoutMode = 'HORIZONTAL';
            componentSet.primaryAxisSizingMode = 'AUTO';
            componentSet.counterAxisSizingMode = 'AUTO';
            componentSet.primaryAxisAlignItems = 'MIN';
            componentSet.counterAxisAlignItems = 'MIN';
            componentSet.itemSpacing = 16;
            componentSet.counterAxisSpacing = 16;
            componentSet.paddingLeft = 16;
            componentSet.paddingRight = 16;
            componentSet.paddingTop = 16;
            componentSet.paddingBottom = 16;
            componentSet.layoutWrap = 'WRAP';
            
            // Calculate max width for 20 icons per row
            // Icon size (24) + spacing (16) = 40px per icon
            // 20 icons = 20 * 40 - 16 (last spacing) + 32 (padding) = 816px
            const iconWidth = 24;
            const spacing = 16;
            const iconsPerRow = 20;
            const padding = 32; // left + right
            const maxWidth = (iconWidth + spacing) * iconsPerRow - spacing + padding;
            componentSet.resize(maxWidth, componentSet.height);
            
            componentSet.fills = [];
            categoryFrame.remove();
            figma.viewport.scrollAndZoomIntoView([componentSet]);
        } else if (components.length === 1) {
            figma.viewport.scrollAndZoomIntoView([components[0]]);
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
                'twotone': {
                    name: 'Twotone',
                    baseUrl: 'https://raw.githubusercontent.com/harsh2277/Vuesax-Icon/1fc373df0cef028768f13d29571b0f6e163d7d68/twotone'
                },
                'outline': {
                    name: 'Outline',
                    baseUrl: 'https://raw.githubusercontent.com/harsh2277/Vuesax-Icon/1fc373df0cef028768f13d29571b0f6e163d7d68/outline'
                },
                'linear': {
                    name: 'Linear',
                    baseUrl: 'https://raw.githubusercontent.com/harsh2277/Vuesax-Icon/1fc373df0cef028768f13d29571b0f6e163d7d68/linear'
                },
                'bulk': {
                    name: 'Bulk',
                    baseUrl: 'https://raw.githubusercontent.com/harsh2277/Vuesax-Icon/1fc373df0cef028768f13d29571b0f6e163d7d68/bulk'
                },
                'broken': {
                    name: 'Broken',
                    baseUrl: 'https://raw.githubusercontent.com/harsh2277/Vuesax-Icon/1fc373df0cef028768f13d29571b0f6e163d7d68/broken'
                },
                'bold': {
                    name: 'Bold',
                    baseUrl: 'https://raw.githubusercontent.com/harsh2277/Vuesax-Icon/1fc373df0cef028768f13d29571b0f6e163d7d68/bold'
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
        const allComponentSets = [];
        let yOffset = 0;
        
        const BATCH_SIZE = 20; // Fetch 20 icons at a time
        
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
                            categoryFrame.appendChild(component);
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
            
            // Create component set
            if (components.length > 1) {
                figma.notify(`🔧 Combining ${components.length} icons into Component Set...`);
                const componentSet = figma.combineAsVariants(components, page);
                componentSet.name = `${library.name} / ${categoryName}`;
                
                // Set up grid layout with 20 icons per row
                componentSet.layoutMode = 'HORIZONTAL';
                componentSet.primaryAxisSizingMode = 'AUTO';
                componentSet.counterAxisSizingMode = 'AUTO';
                componentSet.primaryAxisAlignItems = 'MIN';
                componentSet.counterAxisAlignItems = 'MIN';
                componentSet.itemSpacing = 16;
                componentSet.counterAxisSpacing = 16;
                componentSet.paddingLeft = 16;
                componentSet.paddingRight = 16;
                componentSet.paddingTop = 16;
                componentSet.paddingBottom = 16;
                componentSet.layoutWrap = 'WRAP';
                
                // Calculate max width for 20 icons per row
                const iconWidth = 24;
                const spacing = 16;
                const iconsPerRow = 20;
                const padding = 32;
                const maxWidth = (iconWidth + spacing) * iconsPerRow - spacing + padding;
                componentSet.resize(maxWidth, componentSet.height);
                
                componentSet.fills = [];
                componentSet.y = yOffset;
                allComponentSets.push(componentSet);
                categoryFrame.remove();
                yOffset += componentSet.height + 100;
            } else if (components.length === 1) {
                components[0].y = yOffset;
                allComponentSets.push(components[0]);
                categoryFrame.remove();
                yOffset += components[0].height + 100;
            }
            
            totalSuccess += successCount;
            totalFailed += failCount;
            categoriesCreated++;
            
            figma.notify(`✅ ${categoryName} complete! (${successCount} icons)`);
        }
        
        if (allComponentSets.length > 0) {
            figma.viewport.scrollAndZoomIntoView(allComponentSets);
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

