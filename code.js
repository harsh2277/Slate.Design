/**
 * ============================================
 * SLATE.DESIGN - FIGMA PLUGIN
 * ============================================
 * A comprehensive design system generator for Figma
 * 
 * Features:
 * - Button Components
 * - Input Components  
 * - Design Tokens (Colors, Spacing, Radius, etc.)
 * - Typography System
 * - Icon Library
 * ============================================
 */

// ============================================
// PLUGIN INITIALIZATION
// ============================================

figma.showUI(__html__, { width: 424, height: 700, themeColors: true });

figma.on('close', () => {
    figma.notify('👋 Bye Bye Thanks for using Slate.Design', { timeout: 3000 });
});

// ============================================
// UTILITY FUNCTIONS
// ============================================

function hexToRgb(hex) {
    if (!hex) return { r: 0, g: 0, b: 0 };
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255
    } : { r: 0, g: 0, b: 0 };
}

function darkenColor(rgb, amount) {
    return {
        r: Math.max(0, rgb.r - amount),
        g: Math.max(0, rgb.g - amount),
        b: Math.max(0, rgb.b - amount)
    };
}

function lightenColor(rgb, amount) {
    return {
        r: Math.min(1, rgb.r + amount),
        g: Math.min(1, rgb.g + amount),
        b: Math.min(1, rgb.b + amount)
    };
}

function safeSetCharacters(textNode, value) {
    const stringValue = String(value || '');
    textNode.characters = stringValue.trim() === '' ? ' ' : stringValue;
}

function applyColorToNode(node, color) {
    if (node.type === 'VECTOR') {
        if (node.fills && node.fills !== figma.mixed && node.fills.length > 0) {
            node.fills = [{ type: 'SOLID', color: color }];
        }
        if (node.strokes && node.strokes !== figma.mixed && node.strokes.length > 0) {
            node.strokes = [{ type: 'SOLID', color: color }];
        }
    }
    if ('children' in node) {
        node.children.forEach(child => applyColorToNode(child, color));
    }
}

// ============================================
// BUTTON COMPONENT - START
// ============================================

async function createButtonComponentSet(buttonText, bgColor, textColor, radius) {
    await figma.loadFontAsync({ family: "Poppins", style: "Medium" });
    await figma.loadFontAsync({ family: "Poppins", style: "Bold" });
    await figma.loadFontAsync({ family: "Poppins", style: "Regular" });

    const baseRgb = hexToRgb(bgColor);
    const textRgb = hexToRgb(textColor);

    // Arrow icons SVG
    const arrowLeftSVG = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9.57 5.93L3.5 12L9.57 18.07" stroke="#292D32" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M20.5 12H3.67" stroke="#292D32" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;

    const arrowRightSVG = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14.43 5.93L20.5 12L14.43 18.07" stroke="#292D32" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M3.5 12H20.33" stroke="#292D32" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;

    // Create icon components
    function createIconComponent(svgString, name, color, size = 16) {
        const iconComponent = figma.createComponent();
        iconComponent.name = name;
        iconComponent.resize(size, size);
        iconComponent.fills = [];

        const svgNode = figma.createNodeFromSvg(svgString);
        const scale = Math.min(size / svgNode.width, size / svgNode.height);
        svgNode.resize(svgNode.width * scale, svgNode.height * scale);
        svgNode.x = (size - svgNode.width) / 2;
        svgNode.y = (size - svgNode.height) / 2;

        applyColorToNode(svgNode, color);

        if (svgNode.type === 'FRAME' || svgNode.type === 'GROUP') {
            [...svgNode.children].forEach(child => {
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

    const leftIconComponent = createIconComponent(arrowLeftSVG, "Icon/arrow-left", textRgb, 16);
    const rightIconComponent = createIconComponent(arrowRightSVG, "Icon/arrow-right", textRgb, 16);
    figma.currentPage.appendChild(leftIconComponent);
    figma.currentPage.appendChild(rightIconComponent);

    // Button configurations
    const sizes = [
        { name: 'Small', height: 32, paddingX: 12, paddingY: 6, fontSize: 12, iconSize: 14 },
        { name: 'Medium', height: 40, paddingX: 16, paddingY: 10, fontSize: 14, iconSize: 16 },
        { name: 'Large', height: 48, paddingX: 20, paddingY: 12, fontSize: 16, iconSize: 18 }
    ];

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

    const components = [];
    const buttonWidth = 140;
    const componentSpacing = 16;
    const sizeGroupSpacing = 32;
    let xOffset = 0;
    let yOffset = 0;

    // Create all button variants
    for (const size of sizes) {
        xOffset = 0;
        for (const variant of variants) {
            xOffset = 0;
            for (const state of variant.states) {
                const button = figma.createComponent();
                button.name = `Size=${size.name}, Variant=${variant.name}, State=${state.name}`;
                button.resize(buttonWidth, size.height);
                button.x = xOffset;
                button.y = yOffset;

                if (state.bgColor.a === 0) {
                    button.fills = [];
                } else {
                    button.fills = [{ type: 'SOLID', color: state.bgColor }];
                }

                button.cornerRadius = radius;

                if (state.borderColor && state.borderWidth > 0) {
                    button.strokes = [{ type: 'SOLID', color: state.borderColor }];
                    button.strokeWeight = state.borderWidth;
                }

                button.layoutMode = 'HORIZONTAL';
                button.primaryAxisAlignItems = 'CENTER';
                button.counterAxisAlignItems = 'CENTER';
                button.primaryAxisSizingMode = 'AUTO';
                button.paddingLeft = size.paddingX;
                button.paddingRight = size.paddingX;
                button.paddingTop = size.paddingY;
                button.paddingBottom = size.paddingY;
                button.itemSpacing = 8;

                // Left icon
                const leftIcon = leftIconComponent.createInstance();
                leftIcon.name = "LeftIcon";
                leftIcon.resize(size.iconSize, size.iconSize);
                leftIcon.visible = false;
                button.appendChild(leftIcon);

                // Text
                const text = figma.createText();
                text.fontName = { family: "Poppins", style: "Medium" };
                text.fontSize = size.fontSize;
                text.characters = buttonText;
                text.fills = [{ type: 'SOLID', color: state.textColor }];
                if (state.textDecoration === 'UNDERLINE') {
                    text.textDecoration = 'UNDERLINE';
                }
                button.appendChild(text);

                // Right icon
                const rightIcon = rightIconComponent.createInstance();
                rightIcon.name = "RightIcon";
                rightIcon.resize(size.iconSize, size.iconSize);
                rightIcon.visible = false;
                button.appendChild(rightIcon);

                figma.currentPage.appendChild(button);
                components.push(button);
                xOffset += buttonWidth + componentSpacing;
            }
            yOffset += size.height + componentSpacing;
        }
        yOffset += sizeGroupSpacing;
    }

    // Create component set
    const componentSet = figma.combineAsVariants(components, figma.currentPage);
    componentSet.name = "Button";
    componentSet.layoutMode = 'NONE';
    componentSet.fills = [];

    // Container frame
    const containerFrame = figma.createFrame();
    containerFrame.name = "🎨 Button Component System";
    containerFrame.resize(componentSet.width + 128, componentSet.height + 200);
    containerFrame.fills = [{ type: 'SOLID', color: { r: 0.97, g: 0.97, b: 0.98 } }];
    containerFrame.cornerRadius = 12;
    containerFrame.layoutMode = 'VERTICAL';
    containerFrame.primaryAxisSizingMode = 'AUTO';
    containerFrame.counterAxisSizingMode = 'AUTO';
    containerFrame.itemSpacing = 34;
    containerFrame.paddingLeft = 48;
    containerFrame.paddingRight = 48;
    containerFrame.paddingTop = 40;
    containerFrame.paddingBottom = 40;

    // Title
    const titleFrame = figma.createFrame();
    titleFrame.name = "Title";
    titleFrame.layoutMode = 'VERTICAL';
    titleFrame.primaryAxisSizingMode = 'AUTO';
    titleFrame.counterAxisSizingMode = 'AUTO';
    titleFrame.itemSpacing = 8;
    titleFrame.fills = [];

    const titleText = figma.createText();
    titleText.fontName = { family: "Poppins", style: "Bold" };
    titleText.fontSize = 28;
    titleText.characters = "Button Component";
    titleText.fills = [{ type: 'SOLID', color: { r: 0.1, g: 0.1, b: 0.1 } }];
    titleFrame.appendChild(titleText);

    const subtitleText = figma.createText();
    subtitleText.fontName = { family: "Poppins", style: "Regular" };
    subtitleText.fontSize = 14;
    subtitleText.characters = "3 Variants • 3 Sizes • 4 States • Swappable Icons";
    subtitleText.fills = [{ type: 'SOLID', color: { r: 0.5, g: 0.5, b: 0.5 } }];
    titleFrame.appendChild(subtitleText);

    figma.currentPage.appendChild(containerFrame);
    containerFrame.appendChild(titleFrame);
    containerFrame.appendChild(componentSet);

    // Icons frame
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
    iconsFrame.fills = [{ type: 'SOLID', color: { r: 0.95, g: 0.95, b: 0.96 } }];
    iconsFrame.cornerRadius = 12;

    figma.currentPage.appendChild(iconsFrame);
    iconsFrame.appendChild(leftIconComponent);
    iconsFrame.appendChild(rightIconComponent);
    iconsFrame.x = containerFrame.x + containerFrame.width + 40;
    iconsFrame.y = containerFrame.y;

    // Add boolean properties
    const leftIconPropKey = componentSet.addComponentProperty("LeftIcon", "BOOLEAN", false);
    const rightIconPropKey = componentSet.addComponentProperty("RightIcon", "BOOLEAN", false);

    componentSet.children.forEach(component => {
        const leftIconLayer = component.findOne(node => node.name === "LeftIcon");
        const rightIconLayer = component.findOne(node => node.name === "RightIcon");
        if (leftIconLayer) leftIconLayer.componentPropertyReferences = { visible: leftIconPropKey };
        if (rightIconLayer) rightIconLayer.componentPropertyReferences = { visible: rightIconPropKey };
    });

    figma.viewport.scrollAndZoomIntoView([containerFrame, iconsFrame]);
    figma.notify(`✅ Button Component System created!`);
}

// ============================================
// BUTTON COMPONENT - END
// ============================================


// ============================================
// INPUT COMPONENT - START
// ============================================

async function createInputComponentSet(placeholder, borderColor, primaryColor, textColor, radius) {
    await figma.loadFontAsync({ family: "Poppins", style: "Regular" });
    await figma.loadFontAsync({ family: "Poppins", style: "Medium" });
    await figma.loadFontAsync({ family: "Poppins", style: "Bold" });

    const borderRgb = hexToRgb(borderColor);
    const textRgb = hexToRgb(textColor);
    const primaryRgb = hexToRgb(primaryColor);
    const successRgb = hexToRgb('#10b981');
    const errorRgb = hexToRgb('#ef4444');

    // Icon SVGs
    const searchIconSVG = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z" stroke="#292D32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M22 22L20 20" stroke="#292D32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;

    const closeIconSVG = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z" stroke="#292D32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M9.17 14.83L14.83 9.17" stroke="#292D32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M14.83 14.83L9.17 9.17" stroke="#292D32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;

    function createIconComponent(svgString, name, color, size = 16) {
        const iconComponent = figma.createComponent();
        iconComponent.name = name;
        iconComponent.resize(size, size);
        iconComponent.fills = [];

        const svgNode = figma.createNodeFromSvg(svgString);
        const scale = Math.min(size / svgNode.width, size / svgNode.height);
        svgNode.resize(svgNode.width * scale, svgNode.height * scale);
        svgNode.x = (size - svgNode.width) / 2;
        svgNode.y = (size - svgNode.height) / 2;

        applyColorToNode(svgNode, color);

        if (svgNode.type === 'FRAME' || svgNode.type === 'GROUP') {
            [...svgNode.children].forEach(child => {
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

    const searchIconComponent = createIconComponent(searchIconSVG, "Icon/search", textRgb, 16);
    const closeIconComponent = createIconComponent(closeIconSVG, "Icon/close", textRgb, 16);
    figma.currentPage.appendChild(searchIconComponent);
    figma.currentPage.appendChild(closeIconComponent);

    // Input states
    const states = [
        { name: 'Default', borderColor: borderRgb, borderWidth: 1, bgColor: { r: 1, g: 1, b: 1 }, textColor: textRgb, placeholderOpacity: 0.5, hasErrorMsg: false },
        { name: 'Click', borderColor: primaryRgb, borderWidth: 2, bgColor: { r: 1, g: 1, b: 1 }, textColor: textRgb, placeholderOpacity: 0.5, hasErrorMsg: false },
        { name: 'Error', borderColor: errorRgb, borderWidth: 1, bgColor: { r: 1, g: 1, b: 1 }, textColor: textRgb, placeholderOpacity: 0.5, hasErrorMsg: true },
        { name: 'Success', borderColor: successRgb, borderWidth: 1, bgColor: { r: 1, g: 1, b: 1 }, textColor: textRgb, placeholderOpacity: 0.5, hasErrorMsg: false },
        { name: 'Disabled', borderColor: { r: 0.88, g: 0.88, b: 0.88 }, borderWidth: 1, bgColor: { r: 0.98, g: 0.98, b: 0.98 }, textColor: { r: 0.6, g: 0.6, b: 0.6 }, placeholderOpacity: 1, hasErrorMsg: false }
    ];

    // Input types
    const types = [
        { name: 'Text', placeholder: placeholder, height: 40, showIcons: true, isOTP: false, isTextarea: false },
        { name: 'Textarea', placeholder: placeholder, height: 120, showIcons: false, isOTP: false, isTextarea: true },
        { name: 'OTP', placeholder: '0', height: 56, showIcons: false, isOTP: true, isTextarea: false, digitCount: 4 }
    ];

    const components = [];
    let yOffset = 0;

    for (const type of types) {
        for (const state of states) {
            const wrapper = figma.createComponent();
            wrapper.name = `Type=${type.name}, State=${state.name}`;
            wrapper.x = 0;
            wrapper.y = yOffset;
            wrapper.fills = [];
            wrapper.layoutMode = 'VERTICAL';
            wrapper.primaryAxisAlignItems = 'MIN';
            wrapper.counterAxisAlignItems = 'MIN';
            wrapper.primaryAxisSizingMode = 'AUTO';
            wrapper.counterAxisSizingMode = 'AUTO';
            wrapper.itemSpacing = 6;

            // Label
            const label = figma.createText();
            label.fontName = { family: "Poppins", style: "Medium" };
            label.fontSize = 12;
            label.characters = "Label";
            label.fills = [{ type: 'SOLID', color: state.textColor }];
            label.name = "Label";
            label.visible = false;
            wrapper.appendChild(label);

            if (type.isOTP) {
                // OTP input
                const otpContainer = figma.createFrame();
                otpContainer.name = "InputField";
                otpContainer.fills = [];
                otpContainer.layoutMode = 'HORIZONTAL';
                otpContainer.primaryAxisAlignItems = 'CENTER';
                otpContainer.counterAxisAlignItems = 'CENTER';
                otpContainer.primaryAxisSizingMode = 'AUTO';
                otpContainer.counterAxisSizingMode = 'AUTO';
                otpContainer.itemSpacing = 10;

                const boxSize = 48;
                for (let i = 0; i < 6; i++) {
                    const digitBox = figma.createFrame();
                    digitBox.name = `Digit${i + 1}`;
                    digitBox.resize(boxSize, boxSize);
                    if (i >= 4) digitBox.visible = false;
                    digitBox.fills = [{ type: 'SOLID', color: state.bgColor }];
                    digitBox.cornerRadius = 12;
                    digitBox.strokes = [{ type: 'SOLID', color: state.borderColor }];
                    digitBox.strokeWeight = state.borderWidth;
                    digitBox.layoutMode = 'HORIZONTAL';
                    digitBox.primaryAxisAlignItems = 'CENTER';
                    digitBox.counterAxisAlignItems = 'CENTER';
                    digitBox.primaryAxisSizingMode = 'FIXED';

                    const digitText = figma.createText();
                    digitText.fontName = { family: "Poppins", style: "Medium" };
                    digitText.fontSize = 20;
                    digitText.characters = type.placeholder;
                    digitText.fills = [{ type: 'SOLID', color: state.textColor, opacity: state.placeholderOpacity }];
                    digitText.textAlignHorizontal = 'CENTER';
                    digitText.textAlignVertical = 'CENTER';

                    digitBox.appendChild(digitText);
                    otpContainer.appendChild(digitBox);
                }
                wrapper.appendChild(otpContainer);
            } else {
                // Regular input
                const input = figma.createFrame();
                input.name = "InputField";
                input.fills = [{ type: 'SOLID', color: state.bgColor }];
                input.cornerRadius = radius;
                input.strokes = [{ type: 'SOLID', color: state.borderColor }];
                input.strokeWeight = state.borderWidth;
                input.layoutMode = 'HORIZONTAL';
                input.primaryAxisAlignItems = type.isTextarea ? 'MIN' : 'CENTER';
                input.counterAxisAlignItems = type.isTextarea ? 'MIN' : 'CENTER';
                input.primaryAxisSizingMode = 'FIXED';
                input.counterAxisSizingMode = 'FIXED';
                input.paddingLeft = 12;
                input.paddingRight = 12;
                input.paddingTop = 10;
                input.paddingBottom = 10;
                input.itemSpacing = 8;
                input.resize(324, type.height);

                if (type.showIcons) {
                    const leftIcon = searchIconComponent.createInstance();
                    leftIcon.name = "LeftIcon";
                    leftIcon.resize(16, 16);
                    leftIcon.visible = false;
                    input.appendChild(leftIcon);
                }

                const text = figma.createText();
                text.fontName = { family: "Poppins", style: "Regular" };
                text.fontSize = 14;
                text.characters = type.placeholder;
                text.textAlignHorizontal = 'LEFT';
                text.textAlignVertical = 'TOP';
                text.fills = [{ type: 'SOLID', color: state.textColor, opacity: state.placeholderOpacity }];
                text.layoutGrow = 1;
                input.appendChild(text);

                if (type.showIcons) {
                    const rightIcon = closeIconComponent.createInstance();
                    rightIcon.name = "RightIcon";
                    rightIcon.resize(16, 16);
                    rightIcon.visible = false;
                    input.appendChild(rightIcon);
                }

                wrapper.appendChild(input);
            }

            if (state.hasErrorMsg) {
                const errorMsg = figma.createText();
                errorMsg.fontName = { family: "Poppins", style: "Regular" };
                errorMsg.fontSize = 11;
                errorMsg.characters = "This field has an error";
                errorMsg.fills = [{ type: 'SOLID', color: errorRgb }];
                errorMsg.name = "ErrorMessage";
                wrapper.appendChild(errorMsg);
            }

            figma.currentPage.appendChild(wrapper);
            components.push(wrapper);
            yOffset += wrapper.height + 24;
        }
        yOffset += 24;
    }

    // Create component set
    const componentSet = figma.combineAsVariants(components, figma.currentPage);
    componentSet.name = "Input";
    componentSet.layoutMode = 'NONE';
    componentSet.fills = [];

    // Container frame
    const containerFrame = figma.createFrame();
    containerFrame.name = "🎨 Input Component System";
    containerFrame.resize(componentSet.width + 128, componentSet.height + 200);
    containerFrame.fills = [{ type: 'SOLID', color: { r: 0.97, g: 0.97, b: 0.98 } }];
    containerFrame.cornerRadius = 12;
    containerFrame.layoutMode = 'VERTICAL';
    containerFrame.primaryAxisSizingMode = 'AUTO';
    containerFrame.counterAxisSizingMode = 'AUTO';
    containerFrame.itemSpacing = 34;
    containerFrame.paddingLeft = 48;
    containerFrame.paddingRight = 48;
    containerFrame.paddingTop = 40;
    containerFrame.paddingBottom = 40;

    // Title
    const titleFrame = figma.createFrame();
    titleFrame.name = "Title";
    titleFrame.layoutMode = 'VERTICAL';
    titleFrame.primaryAxisSizingMode = 'AUTO';
    titleFrame.counterAxisSizingMode = 'AUTO';
    titleFrame.itemSpacing = 8;
    titleFrame.fills = [];

    const titleText = figma.createText();
    titleText.fontName = { family: "Poppins", style: "Bold" };
    titleText.fontSize = 28;
    titleText.characters = "Input Component";
    titleText.fills = [{ type: 'SOLID', color: { r: 0.1, g: 0.1, b: 0.1 } }];
    titleFrame.appendChild(titleText);

    const subtitleText = figma.createText();
    subtitleText.fontName = { family: "Poppins", style: "Regular" };
    subtitleText.fontSize = 14;
    subtitleText.characters = "3 Types • 5 States • Label & Icons • OTP Support";
    subtitleText.fills = [{ type: 'SOLID', color: { r: 0.5, g: 0.5, b: 0.5 } }];
    titleFrame.appendChild(subtitleText);

    figma.currentPage.appendChild(containerFrame);
    containerFrame.appendChild(titleFrame);
    containerFrame.appendChild(componentSet);

    // Icons frame
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
    iconsFrame.fills = [{ type: 'SOLID', color: { r: 0.95, g: 0.95, b: 0.96 } }];
    iconsFrame.cornerRadius = 12;

    figma.currentPage.appendChild(iconsFrame);
    iconsFrame.appendChild(searchIconComponent);
    iconsFrame.appendChild(closeIconComponent);
    iconsFrame.x = containerFrame.x + containerFrame.width + 40;
    iconsFrame.y = containerFrame.y;

    // Add boolean properties
    const labelPropKey = componentSet.addComponentProperty("Label", "BOOLEAN", false);
    const leftIconPropKey = componentSet.addComponentProperty("LeftIcon", "BOOLEAN", false);
    const rightIconPropKey = componentSet.addComponentProperty("RightIcon", "BOOLEAN", false);
    const sixDigitPropKey = componentSet.addComponentProperty("6-Digit", "BOOLEAN", false);

    componentSet.children.forEach(component => {
        const labelLayer = component.findOne(node => node.name === "Label");
        const leftIconLayer = component.findOne(node => node.name === "LeftIcon");
        const rightIconLayer = component.findOne(node => node.name === "RightIcon");
        const digit5Layer = component.findOne(node => node.name === "Digit5");
        const digit6Layer = component.findOne(node => node.name === "Digit6");

        if (labelLayer) labelLayer.componentPropertyReferences = { visible: labelPropKey };
        if (leftIconLayer) leftIconLayer.componentPropertyReferences = { visible: leftIconPropKey };
        if (rightIconLayer) rightIconLayer.componentPropertyReferences = { visible: rightIconPropKey };
        if (digit5Layer) digit5Layer.componentPropertyReferences = { visible: sixDigitPropKey };
        if (digit6Layer) digit6Layer.componentPropertyReferences = { visible: sixDigitPropKey };
    });

    figma.viewport.scrollAndZoomIntoView([containerFrame, iconsFrame]);
    figma.notify(`✅ Input Component System created!`);
}

// ============================================
// INPUT COMPONENT - END
// ============================================


// ============================================
// ICON LIBRARY FUNCTIONS - START
// ============================================

async function fetchSVG(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);
        return await response.text();
    } catch (error) {
        console.error(`Error fetching SVG from ${url}:`, error);
        return null;
    }
}

function cleanSVG(svgText) {
    return svgText.replace(/\s*width="[^"]*"/gi, '').replace(/\s*height="[^"]*"/gi, '');
}

function createIconComponentFromSVG(svgText, iconName, size = 24) {
    const cleaned = cleanSVG(svgText);
    const svgNode = figma.createNodeFromSvg(cleaned);

    const component = figma.createComponent();
    component.name = iconName;
    component.resize(size, size);
    component.fills = [];

    const scale = Math.min(size / svgNode.width, size / svgNode.height);
    svgNode.resize(svgNode.width * scale, svgNode.height * scale);
    svgNode.x = (size - svgNode.width) / 2;
    svgNode.y = (size - svgNode.height) / 2;

    if (svgNode.type === 'FRAME' || svgNode.type === 'GROUP') {
        [...svgNode.children].forEach(child => {
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
    frame.itemSpacing = 16;
    frame.paddingLeft = 16;
    frame.paddingRight = 16;
    frame.paddingTop = 16;
    frame.paddingBottom = 16;
    frame.layoutWrap = 'WRAP';
    return frame;
}

const ICON_LIBRARIES = {
    'box-icons': {
        name: 'Box Icons',
        categories: {
            'logos': { name: 'Logos', baseUrl: 'https://raw.githubusercontent.com/harsh2277/Box-Icon/192522ef45d183c510a068c65fbbb208ddca0813/svg/logos' },
            'regular': { name: 'Regular', baseUrl: 'https://raw.githubusercontent.com/harsh2277/Box-Icon/192522ef45d183c510a068c65fbbb208ddca0813/svg/regular' },
            'solid': { name: 'Solid', baseUrl: 'https://raw.githubusercontent.com/harsh2277/Box-Icon/192522ef45d183c510a068c65fbbb208ddca0813/svg/solid' }
        }
    },
    'vuesax-icons': {
        name: 'Vuesax Icons',
        categories: {
            'outline': { name: 'Outline', baseUrl: 'https://raw.githubusercontent.com/harsh2277/Vuesax-Icon/1fc373df0cef028768f13d29571b0f6e163d7d68/outline' },
            'bulk': { name: 'Bulk', baseUrl: 'https://raw.githubusercontent.com/harsh2277/Vuesax-Icon/1fc373df0cef028768f13d29571b0f6e163d7d68/bulk' },
            'bold': { name: 'Bold', baseUrl: 'https://raw.githubusercontent.com/harsh2277/Vuesax-Icon/1fc373df0cef028768f13d29571b0f6e163d7d68/bold' }
        }
    },
    'unicons': {
        name: 'Unicons',
        categories: {
            'line': { name: 'Line', baseUrl: 'https://raw.githubusercontent.com/harsh2277/unicons/41643545a256b97c0c4cd646817cf352da4ce866/line' },
            'monochrome': { name: 'Monochrome', baseUrl: 'https://raw.githubusercontent.com/harsh2277/unicons/41643545a256b97c0c4cd646817cf352da4ce866/monochrome' },
            'solid': { name: 'Solid', baseUrl: 'https://raw.githubusercontent.com/harsh2277/unicons/41643545a256b97c0c4cd646817cf352da4ce866/solid' },
            'thinline': { name: 'Thinline', baseUrl: 'https://raw.githubusercontent.com/harsh2277/unicons/41643545a256b97c0c4cd646817cf352da4ce866/thinline' }
        }
    }
};

async function generateIconLibrary(libraryId, categoryId, iconList) {
    const page = getOrCreateIconLibraryPage();
    const originalPage = figma.currentPage;
    await figma.setCurrentPageAsync(page);

    try {
        const library = ICON_LIBRARIES[libraryId];
        if (!library) throw new Error(`Library ${libraryId} not found`);

        const category = library.categories[categoryId];
        if (!category) throw new Error(`Category ${categoryId} not found`);

        const components = [];
        let successCount = 0;
        let failCount = 0;
        const BATCH_SIZE = 20;

        for (let i = 0; i < iconList.length; i += BATCH_SIZE) {
            const batch = iconList.slice(i, i + BATCH_SIZE);
            const results = await Promise.all(
                batch.map(iconName => fetchSVG(`${category.baseUrl}/${iconName}`).then(svgText => ({ iconName, svgText })))
            );

            for (const { iconName, svgText } of results) {
                if (svgText) {
                    try {
                        const component = createIconComponentFromSVG(svgText, iconName.replace('.svg', ''), 24);
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
        }

        if (components.length > 0) {
            await figma.loadFontAsync({ family: "Poppins", style: "Bold" });
            await figma.loadFontAsync({ family: "Poppins", style: "Regular" });

            const containerFrame = figma.createFrame();
            containerFrame.name = `🎨 ${library.name} / ${category.name}`;
            containerFrame.layoutMode = 'VERTICAL';
            containerFrame.primaryAxisSizingMode = 'AUTO';
            containerFrame.counterAxisSizingMode = 'AUTO';
            containerFrame.itemSpacing = 24;
            containerFrame.paddingLeft = 40;
            containerFrame.paddingRight = 40;
            containerFrame.paddingTop = 40;
            containerFrame.paddingBottom = 40;
            containerFrame.fills = [{ type: 'SOLID', color: { r: 0.97, g: 0.97, b: 0.98 } }];
            containerFrame.cornerRadius = 12;

            const heading = figma.createText();
            heading.fontName = { family: "Poppins", style: "Bold" };
            heading.fontSize = 24;
            heading.characters = `${library.name} / ${category.name}`;
            heading.fills = [{ type: 'SOLID', color: { r: 0.1, g: 0.1, b: 0.1 } }];

            const subheading = figma.createText();
            subheading.fontName = { family: "Poppins", style: "Regular" };
            subheading.fontSize = 14;
            subheading.characters = `${successCount} icons • ${iconList.length} total`;
            subheading.fills = [{ type: 'SOLID', color: { r: 0.5, g: 0.5, b: 0.5 } }];

            const iconsFrame = figma.createFrame();
            iconsFrame.name = "Icons";
            iconsFrame.layoutMode = 'HORIZONTAL';
            iconsFrame.primaryAxisSizingMode = 'AUTO';
            iconsFrame.counterAxisSizingMode = 'AUTO';
            iconsFrame.itemSpacing = 16;
            iconsFrame.counterAxisSpacing = 16;
            iconsFrame.paddingLeft = 16;
            iconsFrame.paddingRight = 16;
            iconsFrame.paddingTop = 16;
            iconsFrame.paddingBottom = 16;
            iconsFrame.layoutWrap = 'WRAP';
            iconsFrame.fills = [];
            iconsFrame.resize((24 + 16) * 20 - 16 + 32, iconsFrame.height);

            components.forEach(component => iconsFrame.appendChild(component));

            page.appendChild(containerFrame);
            containerFrame.appendChild(heading);
            containerFrame.appendChild(subheading);
            containerFrame.appendChild(iconsFrame);

            figma.viewport.scrollAndZoomIntoView([containerFrame]);
        }

        await figma.setCurrentPageAsync(originalPage);
        return { success: true, successCount, failCount, total: iconList.length };
    } catch (error) {
        await figma.setCurrentPageAsync(originalPage);
        throw error;
    }
}

async function generateAllLibraryIcons(libraryId, categories) {
    const page = getOrCreateIconLibraryPage();
    const originalPage = figma.currentPage;
    await figma.setCurrentPageAsync(page);

    try {
        const library = ICON_LIBRARIES[libraryId];
        if (!library) throw new Error(`Library ${libraryId} not found`);

        let totalSuccess = 0;
        let totalFailed = 0;
        let categoriesCreated = 0;
        const allContainerFrames = [];
        let yOffset = 0;
        const BATCH_SIZE = 20;

        await figma.loadFontAsync({ family: "Poppins", style: "Bold" });
        await figma.loadFontAsync({ family: "Poppins", style: "Regular" });

        for (const categoryData of categories) {
            const { categoryId, categoryName, iconList } = categoryData;
            const category = library.categories[categoryId];
            if (!category) continue;

            const components = [];
            let successCount = 0;
            let failCount = 0;

            for (let i = 0; i < iconList.length; i += BATCH_SIZE) {
                const batch = iconList.slice(i, i + BATCH_SIZE);
                const results = await Promise.all(
                    batch.map(iconName => fetchSVG(`${category.baseUrl}/${iconName}`).then(svgText => ({ iconName, svgText })))
                );

                for (const { iconName, svgText } of results) {
                    if (svgText) {
                        try {
                            const component = createIconComponentFromSVG(svgText, iconName.replace('.svg', ''), 24);
                            page.appendChild(component);
                            components.push(component);
                            successCount++;
                        } catch (error) {
                            failCount++;
                        }
                    } else {
                        failCount++;
                    }
                }
            }

            if (components.length > 0) {
                const containerFrame = figma.createFrame();
                containerFrame.name = `🎨 ${library.name} / ${categoryName}`;
                containerFrame.layoutMode = 'VERTICAL';
                containerFrame.primaryAxisSizingMode = 'AUTO';
                containerFrame.counterAxisSizingMode = 'AUTO';
                containerFrame.itemSpacing = 24;
                containerFrame.paddingLeft = 40;
                containerFrame.paddingRight = 40;
                containerFrame.paddingTop = 40;
                containerFrame.paddingBottom = 40;
                containerFrame.fills = [{ type: 'SOLID', color: { r: 0.97, g: 0.97, b: 0.98 } }];
                containerFrame.cornerRadius = 12;
                containerFrame.y = yOffset;

                const heading = figma.createText();
                heading.fontName = { family: "Poppins", style: "Bold" };
                heading.fontSize = 24;
                heading.characters = `${library.name} / ${categoryName}`;
                heading.fills = [{ type: 'SOLID', color: { r: 0.1, g: 0.1, b: 0.1 } }];

                const subheading = figma.createText();
                subheading.fontName = { family: "Poppins", style: "Regular" };
                subheading.fontSize = 14;
                subheading.characters = `${successCount} icons • ${iconList.length} total`;
                subheading.fills = [{ type: 'SOLID', color: { r: 0.5, g: 0.5, b: 0.5 } }];

                const iconsFrame = figma.createFrame();
                iconsFrame.name = "Icons";
                iconsFrame.layoutMode = 'HORIZONTAL';
                iconsFrame.primaryAxisSizingMode = 'AUTO';
                iconsFrame.counterAxisSizingMode = 'AUTO';
                iconsFrame.itemSpacing = 16;
                iconsFrame.counterAxisSpacing = 16;
                iconsFrame.paddingLeft = 16;
                iconsFrame.paddingRight = 16;
                iconsFrame.paddingTop = 16;
                iconsFrame.paddingBottom = 16;
                iconsFrame.layoutWrap = 'WRAP';
                iconsFrame.fills = [];
                iconsFrame.resize((24 + 16) * 20 - 16 + 32, iconsFrame.height);

                components.forEach(component => iconsFrame.appendChild(component));

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
        }

        if (allContainerFrames.length > 0) {
            figma.viewport.scrollAndZoomIntoView(allContainerFrames);
        }

        await figma.setCurrentPageAsync(originalPage);
        return { success: true, totalSuccess, totalFailed, categoriesCreated };
    } catch (error) {
        await figma.setCurrentPageAsync(originalPage);
        throw error;
    }
}

// ============================================
// ICON LIBRARY FUNCTIONS - END
// ============================================


// ============================================
// MESSAGE HANDLER - START
// ============================================

figma.ui.onmessage = async (msg) => {

    // ----------------------------------------
    // WINDOW & UI MESSAGES
    // ----------------------------------------

    if (msg.type === 'resize-window') {
        figma.ui.resize(msg.width, msg.height);
    }

    if (msg.type === 'copy-to-clipboard') {
        figma.ui.postMessage({ type: 'clipboard-ready' });
    }

    if (msg.type === 'download-json') {
        figma.ui.postMessage({ type: 'download-ready', data: msg.data });
    }

    if (msg.type === 'close-plugin') {
        figma.ui.postMessage({ type: 'show-goodbye' });
        setTimeout(() => figma.closePlugin(), 5000);
    }

    if (msg.type === 'notify') {
        figma.notify(msg.message);
    }

    // ----------------------------------------
    // COMPONENT CREATION MESSAGES
    // ----------------------------------------

    if (msg.type === 'create-button-component') {
        try {
            await createButtonComponentSet(msg.buttonText, msg.bgColor, msg.textColor, msg.radius);
            figma.ui.postMessage({ type: 'loading-complete' });
            figma.ui.postMessage({ type: 'show-success', title: 'Button Created!', message: 'Your button component system has been created successfully.' });
        } catch (error) {
            figma.notify(`❌ Error creating button component: ${error.message}`);
            figma.ui.postMessage({ type: 'loading-complete' });
        }
    }

    if (msg.type === 'create-input-component') {
        try {
            await createInputComponentSet(msg.placeholder, msg.borderColor, msg.primaryColor, msg.textColor, msg.radius);
            figma.ui.postMessage({ type: 'loading-complete' });
            figma.ui.postMessage({ type: 'show-success', title: 'Input Created!', message: 'Your input component system has been created successfully.' });
        } catch (error) {
            figma.notify(`❌ Error creating input component: ${error.message}`);
            figma.ui.postMessage({ type: 'loading-complete' });
        }
    }

    // ----------------------------------------
    // DESIGN TOKENS / VARIABLES MESSAGES
    // ----------------------------------------

    if (msg.type === 'create-variables') {
        try {
            if (!msg.colors) {
                throw new Error('No color data received');
            }

            // Get or create variable collection
            const collections = await figma.variables.getLocalVariableCollectionsAsync();
            let collection = collections.find(c => c.name === 'Design System Tokens');

            if (!collection) {
                collection = figma.variables.createVariableCollection('Design System Tokens');
                collection.renameMode(collection.modes[0].modeId, 'Light');
                collection.addMode('Dark');
            } else {
                if (!collection.modes.some(mode => mode.name === 'Dark')) {
                    collection.addMode('Dark');
                }
            }

            const lightModeId = collection.modes.find(m => m.name === 'Light').modeId;
            const darkModeId = collection.modes.find(m => m.name === 'Dark').modeId;

            async function createOrUpdateVariable(name, hexLight, hexDark, coll, lightId, darkId) {
                if (!name || !hexLight) return null;
                const rgbLight = hexToRgb(hexLight);
                const rgbDark = hexToRgb(hexDark || hexLight);

                const existingVars = await figma.variables.getLocalVariablesAsync('COLOR');
                const existingVar = existingVars.find(v => v.name === name && v.variableCollectionId === coll.id);

                if (existingVar) {
                    existingVar.setValueForMode(lightId, rgbLight);
                    existingVar.setValueForMode(darkId, rgbDark);
                    return existingVar;
                } else {
                    const variable = figma.variables.createVariable(name, coll, 'COLOR');
                    variable.setValueForMode(lightId, rgbLight);
                    variable.setValueForMode(darkId, rgbDark);
                    return variable;
                }
            }

            let createdCount = 0;
            const colors = msg.colors;

            // Create color variables for each category
            const colorCategories = [
                { key: 'primary', prefix: 'primary', hasLightDark: true },
                { key: 'secondary', prefix: 'secondary', hasLightDark: true },
                { key: 'success', prefix: 'success', hasLightDark: false },
                { key: 'error', prefix: 'error', hasLightDark: false },
                { key: 'warning', prefix: 'warning', hasLightDark: false },
                { key: 'info', prefix: 'info', hasLightDark: false },
                { key: 'neutral', prefix: 'neutral', hasLightDark: true }
            ];

            for (const cat of colorCategories) {
                if (cat.hasLightDark) {
                    if (colors[cat.key] && colors[cat.key].light) {
                        const lightColors = colors[cat.key].light;
                        const darkColors = colors[cat.key].dark || lightColors;
                        const keys = Object.keys(lightColors);

                        for (let i = 0; i < keys.length; i++) {
                            const name = keys[i];
                            const cleanName = name.replace(new RegExp(`^${cat.prefix}-`), '');
                            await createOrUpdateVariable(`${cat.prefix}/${cleanName}`, Object.values(lightColors)[i], Object.values(darkColors)[i], collection, lightModeId, darkModeId);
                            createdCount++;
                        }
                    }
                } else {
                    if (colors[cat.key]) {
                        const colorData = colors[cat.key];
                        const keys = Object.keys(colorData);

                        for (let i = 0; i < keys.length; i++) {
                            const name = keys[i];
                            const value = Object.values(colorData)[i];
                            const cleanName = name.replace(new RegExp(`^${cat.prefix}-`), '');
                            await createOrUpdateVariable(`${cat.prefix}/${cleanName}`, value, value, collection, lightModeId, darkModeId);
                            createdCount++;
                        }
                    }
                }
            }

            // Create responsive variable collections (spacing, padding, radius, stroke)
            const responsiveCollections = [
                { name: 'Spacing', data: msg.spacing },
                { name: 'Padding', data: msg.padding },
                { name: 'Radius', data: msg.radius },
                { name: 'Stroke', data: msg.strokes }
            ];

            let spacingCount = 0, paddingCount = 0, radiusCount = 0, strokeCount = 0;

            for (const rc of responsiveCollections) {
                if (rc.data && Object.keys(rc.data).length > 0) {
                    let coll = (await figma.variables.getLocalVariableCollectionsAsync()).find(c => c.name === rc.name);

                    if (!coll) {
                        coll = figma.variables.createVariableCollection(rc.name);
                        coll.renameMode(coll.modes[0].modeId, 'Desktop');
                        coll.addMode('Tablet');
                        coll.addMode('Mobile');
                    } else {
                        if (!coll.modes.some(m => m.name === 'Desktop')) coll.renameMode(coll.modes[0].modeId, 'Desktop');
                        if (!coll.modes.some(m => m.name === 'Tablet')) coll.addMode('Tablet');
                        if (!coll.modes.some(m => m.name === 'Mobile')) coll.addMode('Mobile');
                    }

                    const desktopId = coll.modes.find(m => m.name === 'Desktop').modeId;
                    const tabletId = coll.modes.find(m => m.name === 'Tablet').modeId;
                    const mobileId = coll.modes.find(m => m.name === 'Mobile').modeId;

                    for (const [name, valueData] of Object.entries(rc.data)) {
                        const existingVars = await figma.variables.getLocalVariablesAsync('FLOAT');
                        const existingVar = existingVars.find(v => v.name === name && v.variableCollectionId === coll.id);

                        const desktopVal = typeof valueData === 'object' ? valueData.desktop : valueData;
                        const tabletVal = typeof valueData === 'object' ? valueData.tablet : valueData;
                        const mobileVal = typeof valueData === 'object' ? valueData.mobile : valueData;

                        if (existingVar) {
                            existingVar.setValueForMode(desktopId, desktopVal);
                            existingVar.setValueForMode(tabletId, tabletVal);
                            existingVar.setValueForMode(mobileId, mobileVal);
                        } else {
                            const variable = figma.variables.createVariable(name, coll, 'FLOAT');
                            variable.setValueForMode(desktopId, desktopVal);
                            variable.setValueForMode(tabletId, tabletVal);
                            variable.setValueForMode(mobileId, mobileVal);
                        }

                        if (rc.name.includes('Spacing')) spacingCount++;
                        else if (rc.name.includes('Padding')) paddingCount++;
                        else if (rc.name.includes('Radius')) radiusCount++;
                        else if (rc.name.includes('Stroke')) strokeCount++;
                    }
                }
            }

            // Create shadow styles
            let shadowCount = 0;
            if (msg.shadows && Object.keys(msg.shadows).length > 0) {
                for (const [name, value] of Object.entries(msg.shadows)) {
                    if (value === 'none') continue;

                    const shadowMatch = value.match(/(-?\d+)(?:px)?\s+(-?\d+)(?:px)?\s+(-?\d+)(?:px)?\s+rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
                    if (shadowMatch) {
                        const [, x, y, blur, r, g, b, a] = shadowMatch;
                        const groupedName = `Shadow/${name.replace('shadow-', '')}`;
                        const existingStyles = await figma.getLocalEffectStylesAsync();
                        let style = existingStyles.find(s => s.name === groupedName);

                        if (!style) {
                            style = figma.createEffectStyle();
                            style.name = groupedName;
                        }

                        style.effects = [{
                            type: 'DROP_SHADOW',
                            color: { r: parseInt(r) / 255, g: parseInt(g) / 255, b: parseInt(b) / 255, a: parseFloat(a) },
                            offset: { x: parseInt(x), y: parseInt(y) },
                            radius: parseInt(blur),
                            visible: true,
                            blendMode: 'NORMAL',
                            spread: 0
                        }];
                        shadowCount++;
                    }
                }
            }

            // Create Layout Grid styles
            let gridCount = 0;
            if (msg.grids) {
                gridCount = await createLayoutGridStyles(msg.grids);
            }

            const totalVars = createdCount + spacingCount + paddingCount + radiusCount + strokeCount;
            if (totalVars === 0 && shadowCount === 0 && gridCount === 0) {
                figma.notify('⚠️ No data found to create variables.');
                figma.ui.postMessage({ type: 'loading-complete' });
                return;
            }

            // Create documentation frame
            try {
                await createTokenDocumentation(colors, msg, createdCount, spacingCount, paddingCount, radiusCount, strokeCount, shadowCount, gridCount);
            } catch (docError) {
                console.error('Error creating documentation:', docError);
                figma.notify(`⚠️ Variables created but documentation failed: ${docError.message}`);
            }

            figma.notify(`✅ Created ${totalVars} variables, ${shadowCount} shadows, ${gridCount} grid styles!`);
            figma.ui.postMessage({ type: 'loading-complete' });
            figma.ui.postMessage({ type: 'show-success', title: 'Variables Created!', message: `Created ${totalVars} variables and ${gridCount} grid styles successfully.` });

        } catch (error) {
            figma.notify(`❌ Error creating variables: ${error.message}`);
            figma.ui.postMessage({ type: 'loading-complete' });
        }
    }

    // ----------------------------------------
    // TYPOGRAPHY MESSAGES
    // ----------------------------------------

    if (msg.type === 'create-text-styles') {
        try {
            await createTypographySystem(msg.typography);
            figma.ui.postMessage({ type: 'loading-complete' });
            figma.ui.postMessage({ type: 'show-success', title: 'Typography Created!', message: 'Typography system created successfully.' });
        } catch (error) {
            figma.notify(`❌ Error creating typography: ${error.message}`);
            figma.ui.postMessage({ type: 'loading-complete' });
        }
    }

    // ----------------------------------------
    // ICON LIBRARY MESSAGES
    // ----------------------------------------

    if (msg.type === 'generate-icon-library') {
        (async () => {
            try {
                const result = await generateIconLibrary(msg.libraryId, msg.categoryId, msg.iconList);
                figma.notify(`✅ Created ${result.successCount} icons!`);
                figma.ui.postMessage({ type: 'generation-complete' });
                figma.ui.postMessage({ type: 'loading-complete' });
                figma.ui.postMessage({ type: 'show-success', title: 'Icons Created!', message: `Created ${result.successCount} icons successfully.` });
            } catch (error) {
                figma.notify(`❌ Error: ${error.message}`);
                figma.ui.postMessage({ type: 'generation-complete' });
                figma.ui.postMessage({ type: 'loading-complete' });
            }
        })();
    }

    if (msg.type === 'generate-all-library-icons') {
        (async () => {
            try {
                const result = await generateAllLibraryIcons(msg.libraryId, msg.categories);
                figma.notify(`✅ Created ${result.totalSuccess} icons in ${result.categoriesCreated} categories!`);
                figma.ui.postMessage({ type: 'generation-complete' });
                figma.ui.postMessage({ type: 'loading-complete' });
                figma.ui.postMessage({ type: 'show-success', title: 'Icons Created!', message: `Created ${result.totalSuccess} icons in ${result.categoriesCreated} categories.` });
            } catch (error) {
                figma.notify(`❌ Error: ${error.message}`);
                figma.ui.postMessage({ type: 'generation-complete' });
                figma.ui.postMessage({ type: 'loading-complete' });
            }
        })();
    }

    if (msg.type === 'insert-single-icon') {
        (async () => {
            try {
                const result = await generateIconLibrary(msg.libraryId, msg.categoryId, [msg.iconName]);
                figma.notify(result.successCount > 0 ? `✅ Icon inserted!` : `❌ Failed to insert icon`);
            } catch (error) {
                figma.notify(`❌ Error: ${error.message}`);
            }
        })();
    }
};

// ============================================
// MESSAGE HANDLER - END
// ============================================


// ============================================
// TOKEN DOCUMENTATION - START
// ============================================

async function createTokenDocumentation(colors, msg, createdCount, spacingCount, paddingCount, radiusCount, strokeCount, shadowCount, gridCount = 0) {
    // Load Fonts - using Roboto which is widely available in Figma
    await Promise.all([
        figma.loadFontAsync({ family: "Roboto", style: "Bold" }),
        figma.loadFontAsync({ family: "Roboto", style: "Medium" }),
        figma.loadFontAsync({ family: "Roboto", style: "Regular" })
    ]);

    // Main Documentation Frame
    const frame = figma.createFrame();
    frame.name = "Design System Documentation";
    frame.fills = [{ type: 'SOLID', color: { r: 0.98, g: 0.98, b: 0.99 } }];
    frame.layoutMode = 'VERTICAL';
    frame.primaryAxisSizingMode = 'AUTO';
    frame.counterAxisSizingMode = 'AUTO';
    frame.paddingBottom = 0;

    // --- HEADER WITH LOGO ---
    const header = figma.createFrame();
    header.name = "Header";
    header.layoutMode = 'VERTICAL';
    header.layoutAlign = 'STRETCH';
    header.primaryAxisSizingMode = 'AUTO';
    header.paddingLeft = 80;
    header.paddingRight = 80;
    header.paddingTop = 64;
    header.paddingBottom = 80;
    header.itemSpacing = 56;

    // Premium Dark Gradient Background
    header.fills = [{
        type: 'GRADIENT_LINEAR',
        gradientStops: [
            { position: 0, color: { r: 0.04, g: 0.06, b: 0.15, a: 1 } }, // #0A0F26
            { position: 1, color: { r: 0.08, g: 0.02, b: 0.18, a: 1 } } // Deep purple tone
        ],
        gradientTransform: [[1, 0, 0], [0, 1, 0]]
    }];

    // 1. HEADER TOP BAR (Logo + Brand)
    const topBar = figma.createFrame();
    topBar.layoutMode = 'HORIZONTAL';
    topBar.counterAxisAlignItems = 'CENTER';
    topBar.primaryAxisAlignItems = 'SPACE_BETWEEN';
    topBar.layoutAlign = 'STRETCH';
    topBar.fills = [];

    // Left side - Slate.Design Logo
    const leftBrand = figma.createFrame();
    leftBrand.layoutMode = 'HORIZONTAL';
    leftBrand.counterAxisAlignItems = 'CENTER';
    leftBrand.itemSpacing = 16;
    leftBrand.fills = [];

    // Logo SVG (Adjusted ViewBox to crop empty space)
    const logoSvg = `<svg width="48" height="48" viewBox="0 0 146 146" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M72.7272 130C72.7272 133.515 69.871 136.397 66.374 136.046C56.0327 135.008 46.0681 131.449 37.3728 125.639C26.9078 118.646 18.7514 108.708 13.9349 97.0798C9.11845 85.4518 7.85825 72.6567 10.3137 60.3124C12.7691 47.9682 18.8299 36.6292 27.7296 27.7296C36.6292 18.8299 47.9682 12.7691 60.3124 10.3137C72.6567 7.85825 85.4518 9.11845 97.0798 13.9349C108.708 18.7514 118.646 26.9078 125.639 37.3728C131.449 46.0681 135.008 56.0327 136.046 66.374C136.397 69.871 133.515 72.7272 130 72.7272C126.486 72.7272 123.677 69.8672 123.239 66.38C122.257 58.5603 119.467 51.0449 115.057 44.4438C109.463 36.0717 101.512 29.5465 92.2093 25.6934C82.9068 21.8403 72.6708 20.8321 62.7954 22.7963C52.92 24.7608 43.8488 29.6093 36.7291 36.7291C29.6093 43.8488 24.7608 52.92 22.7963 62.7954C20.8321 72.6708 21.8403 82.9068 25.6934 92.2093C29.5465 101.512 36.0717 109.463 44.4438 115.057C51.0449 119.467 58.5603 122.257 66.38 123.239C69.8672 123.677 72.7272 126.486 72.7272 130Z" fill="#0A5DF5"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M112.065 78.8519C110.221 70.649 98.6814 70.7003 96.9078 78.9191L96.8403 79.2326L96.7086 79.841C94.7743 88.6256 87.8086 95.3666 79.0586 96.9105C70.6167 98.4002 70.6169 110.691 79.0586 112.18C87.8392 113.729 94.8229 120.512 96.7286 129.342L96.9078 130.172C98.6814 138.391 110.221 138.442 112.065 130.239L112.283 129.272C114.261 120.474 121.255 113.741 130.021 112.194C138.478 110.702 138.478 98.3891 130.021 96.8969C121.302 95.3584 114.335 88.6881 112.315 79.9586C112.258 79.7146 112.206 79.4814 112.149 79.2275L112.065 78.8519Z" fill="url(#paint0_linear_574_2423)"/>
<defs>
<linearGradient id="paint0_linear_574_2423" x1="104.545" y1="65.4187" x2="104.545" y2="143.672" gradientUnits="userSpaceOnUse">
<stop stop-color="#D54BF6"/>
<stop offset="1" stop-color="#4B10D1"/>
</linearGradient>
</defs>
</svg>`;

    // Create Logo Icon
    const logoIcon = figma.createNodeFromSvg(logoSvg);
    logoIcon.name = "Logo Icon";
    logoIcon.resize(48, 48);
    leftBrand.appendChild(logoIcon);

    // Create Logo Text (Brand Name)
    const logoText = figma.createText();
    logoText.fontName = { family: "Roboto", style: "Bold" };
    logoText.fontSize = 28;
    logoText.characters = "Slate.Design";
    logoText.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
    leftBrand.appendChild(logoText);

    topBar.appendChild(leftBrand);

    // Right side - CODETHEOREM Logo
    const rightBrand = figma.createFrame();
    rightBrand.layoutMode = 'HORIZONTAL';
    rightBrand.counterAxisAlignItems = 'CENTER';
    rightBrand.itemSpacing = 12;
    rightBrand.fills = [];

    // "Created by" text
    const createdByText = figma.createText();
    createdByText.fontName = { family: "Roboto", style: "Regular" };
    createdByText.fontSize = 13;
    createdByText.characters = "Created by";
    createdByText.fills = [{ type: 'SOLID', color: { r: 0.7, g: 0.75, b: 0.85 }, opacity: 0.8 }];
    rightBrand.appendChild(createdByText);

    // CODETHEOREM Logo SVG
    const codetheoremSvg = `<svg width="40" height="40" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="200" height="200" rx="40" fill="url(#paint0_linear_codetheorem)"/>
<path d="M60 100L80 80M60 100L80 120M140 100L120 80M140 100L120 120" stroke="white" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
<circle cx="100" cy="100" r="8" fill="white"/>
<defs>
<linearGradient id="paint0_linear_codetheorem" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
<stop stop-color="#6366F1"/>
<stop offset="1" stop-color="#8B5CF6"/>
</linearGradient>
</defs>
</svg>`;

    const codetheoremIcon = figma.createNodeFromSvg(codetheoremSvg);
    codetheoremIcon.name = "CODETHEOREM Icon";
    codetheoremIcon.resize(40, 40);
    rightBrand.appendChild(codetheoremIcon);

    // CODETHEOREM Text
    const codetheoremText = figma.createText();
    codetheoremText.fontName = { family: "Roboto", style: "Bold" };
    codetheoremText.fontSize = 18;
    codetheoremText.characters = "CODETHEOREM";
    codetheoremText.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
    codetheoremText.letterSpacing = { value: 1, unit: 'PIXELS' };
    rightBrand.appendChild(codetheoremText);

    topBar.appendChild(rightBrand);

    header.appendChild(topBar);

    // 2. HERO TITLE SECTION
    const titleGroup = figma.createFrame();
    titleGroup.layoutMode = 'VERTICAL';
    titleGroup.primaryAxisSizingMode = 'AUTO';
    titleGroup.counterAxisSizingMode = 'AUTO';
    titleGroup.itemSpacing = 24;
    titleGroup.fills = [];

    const title = figma.createText();
    title.fontName = { family: "Roboto", style: "Bold" };
    title.fontSize = 64;
    title.letterSpacing = { value: -1.5, unit: 'PIXELS' };
    title.characters = "Design Tokens";
    title.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
    titleGroup.appendChild(title);

    const desc = figma.createText();
    desc.fontName = { family: "Roboto", style: "Regular" };
    desc.fontSize = 18;
    desc.lineHeight = { value: 160, unit: 'PERCENT' };
    desc.characters = "A comprehensive collection of design tokens for building consistent, accessible interfaces.";
    desc.resize(600, desc.height);
    desc.fills = [{ type: 'SOLID', color: { r: 0.75, g: 0.8, b: 0.9 } }]; // Light cool gray
    titleGroup.appendChild(desc);

    header.appendChild(titleGroup);

    // 3. STATS ROW (Glassmorphism)
    const statsRow = figma.createFrame();
    statsRow.layoutMode = 'HORIZONTAL';
    statsRow.primaryAxisSizingMode = 'AUTO';
    statsRow.counterAxisSizingMode = 'AUTO';
    statsRow.itemSpacing = 16;
    statsRow.fills = [];

    const tokenCount = Object.keys(colors).length + Object.keys(msg.spacing || {}).length + Object.keys(msg.radius || {}).length;

    // Inline function for dark stats to strictly follow design
    function createDarkStat(label, value) {
        const badge = figma.createFrame();
        badge.layoutMode = 'HORIZONTAL';
        badge.primaryAxisSizingMode = 'AUTO';
        badge.counterAxisSizingMode = 'AUTO';
        badge.paddingLeft = 20;
        badge.paddingRight = 20;
        badge.paddingTop = 10;
        badge.paddingBottom = 10;
        badge.cornerRadius = 100;

        // Glassmorphism Fill
        badge.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, opacity: 0.08 }];
        badge.strokes = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, opacity: 0.15 }];
        badge.strokeWeight = 1;
        badge.itemSpacing = 10;
        badge.counterAxisAlignItems = 'CENTER';

        // Blur effect
        badge.effects = [{
            type: 'BACKGROUND_BLUR',
            radius: 20,
            visible: true
        }];

        const tLabel = figma.createText();
        tLabel.fontName = { family: "Roboto", style: "Medium" };
        tLabel.fontSize = 13;
        tLabel.characters = label;
        tLabel.fills = [{ type: 'SOLID', color: { r: 0.7, g: 0.7, b: 0.8 } }];
        badge.appendChild(tLabel);

        const tValue = figma.createText();
        tValue.fontName = { family: "Roboto", style: "Bold" };
        tValue.fontSize = 13;
        tValue.characters = value;
        tValue.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
        badge.appendChild(tValue);

        statsRow.appendChild(badge);
    }

    createDarkStat("Total Tokens", String(tokenCount));
    const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    createDarkStat("Last Updated", dateStr);

    header.appendChild(statsRow);
    frame.appendChild(header);

    // --- CONTENT BODY ---
    const content = figma.createFrame();
    content.name = "Content";
    content.layoutMode = 'VERTICAL';
    content.layoutAlign = 'STRETCH';
    content.primaryAxisSizingMode = 'AUTO';
    content.itemSpacing = 48;
    content.paddingLeft = 80;
    content.paddingRight = 80;
    content.paddingTop = 24;
    content.paddingBottom = 80;
    content.fills = [];
    frame.appendChild(content);

    // Color Rows
    const colorCategories = [
        { key: 'primary', title: 'Primary Colors', desc: 'Main brand and interactive colors.' },
        { key: 'secondary', title: 'Secondary Colors', desc: 'Supporting brand colors.' },
        { key: 'neutral', title: 'Neutral Colors', desc: 'Grays for text, borders, and backgrounds.' },
        { key: 'success', title: 'Success', desc: 'Positive feedback states.' },
        { key: 'warning', title: 'Warning', desc: 'Cautionary states.' },
        { key: 'error', title: 'Error', desc: 'Critical alerts and errors.' },
        { key: 'info', title: 'Info', desc: 'Informational elements.' },
        { key: 'brand', title: 'Brand Colors', desc: 'Primary identity colors.' },
    ];

    for (const cat of colorCategories) {
        let colorData = null;
        if (colors[cat.key]) {
            colorData = colors[cat.key].light || colors[cat.key];
        }

        if (colorData && Object.keys(colorData).length > 0) {
            createDetailedColorRow(cat.title, cat.desc, colorData, content);
        }
    }
    figma.currentPage.appendChild(frame);

    // ============================================
    // CREATE TOKENS FRAME (Side by Side)
    // ============================================

    const tokensFrame = figma.createFrame();
    tokensFrame.name = "Tokens";
    tokensFrame.fills = [{ type: 'SOLID', color: { r: 0.98, g: 0.98, b: 0.99 } }];
    tokensFrame.layoutMode = 'VERTICAL';
    tokensFrame.primaryAxisSizingMode = 'AUTO';
    tokensFrame.counterAxisSizingMode = 'AUTO';
    tokensFrame.paddingBottom = 0;

    // --- TOKENS HEADER WITH LOGO ---
    const tokensHeader = figma.createFrame();
    tokensHeader.name = "Tokens Header";
    tokensHeader.layoutMode = 'VERTICAL';
    tokensHeader.layoutAlign = 'STRETCH';
    tokensHeader.primaryAxisSizingMode = 'AUTO';
    tokensHeader.paddingLeft = 80;
    tokensHeader.paddingRight = 80;
    tokensHeader.paddingTop = 64;
    tokensHeader.paddingBottom = 80;
    tokensHeader.itemSpacing = 56;

    // Premium Dark Gradient Background (same as main header)
    tokensHeader.fills = [{
        type: 'GRADIENT_LINEAR',
        gradientStops: [
            { position: 0, color: { r: 0.04, g: 0.06, b: 0.15, a: 1 } },
            { position: 1, color: { r: 0.08, g: 0.02, b: 0.18, a: 1 } }
        ],
        gradientTransform: [[1, 0, 0], [0, 1, 0]]
    }];

    // 1. HEADER TOP BAR (Logo + Brand)
    const tokensTopBar = figma.createFrame();
    tokensTopBar.layoutMode = 'HORIZONTAL';
    tokensTopBar.counterAxisAlignItems = 'CENTER';
    tokensTopBar.primaryAxisAlignItems = 'SPACE_BETWEEN';
    tokensTopBar.layoutAlign = 'STRETCH';
    tokensTopBar.fills = [];

    // Left side - Slate.Design Logo
    const tokensLeftBrand = figma.createFrame();
    tokensLeftBrand.layoutMode = 'HORIZONTAL';
    tokensLeftBrand.counterAxisAlignItems = 'CENTER';
    tokensLeftBrand.itemSpacing = 16;
    tokensLeftBrand.fills = [];

    // Logo SVG
    const tokensLogoSvg = `<svg width="48" height="48" viewBox="0 0 146 146" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M72.7272 130C72.7272 133.515 69.871 136.397 66.374 136.046C56.0327 135.008 46.0681 131.449 37.3728 125.639C26.9078 118.646 18.7514 108.708 13.9349 97.0798C9.11845 85.4518 7.85825 72.6567 10.3137 60.3124C12.7691 47.9682 18.8299 36.6292 27.7296 27.7296C36.6292 18.8299 47.9682 12.7691 60.3124 10.3137C72.6567 7.85825 85.4518 9.11845 97.0798 13.9349C108.708 18.7514 118.646 26.9078 125.639 37.3728C131.449 46.0681 135.008 56.0327 136.046 66.374C136.397 69.871 133.515 72.7272 130 72.7272C126.486 72.7272 123.677 69.8672 123.239 66.38C122.257 58.5603 119.467 51.0449 115.057 44.4438C109.463 36.0717 101.512 29.5465 92.2093 25.6934C82.9068 21.8403 72.6708 20.8321 62.7954 22.7963C52.92 24.7608 43.8488 29.6093 36.7291 36.7291C29.6093 43.8488 24.7608 52.92 22.7963 62.7954C20.8321 72.6708 21.8403 82.9068 25.6934 92.2093C29.5465 101.512 36.0717 109.463 44.4438 115.057C51.0449 119.467 58.5603 122.257 66.38 123.239C69.8672 123.677 72.7272 126.486 72.7272 130Z" fill="#0A5DF5"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M112.065 78.8519C110.221 70.649 98.6814 70.7003 96.9078 78.9191L96.8403 79.2326L96.7086 79.841C94.7743 88.6256 87.8086 95.3666 79.0586 96.9105C70.6167 98.4002 70.6169 110.691 79.0586 112.18C87.8392 113.729 94.8229 120.512 96.7286 129.342L96.9078 130.172C98.6814 138.391 110.221 138.442 112.065 130.239L112.283 129.272C114.261 120.474 121.255 113.741 130.021 112.194C138.478 110.702 138.478 98.3891 130.021 96.8969C121.302 95.3584 114.335 88.6881 112.315 79.9586C112.258 79.7146 112.206 79.4814 112.149 79.2275L112.065 78.8519Z" fill="url(#paint0_linear_574_2423)"/>
<defs>
<linearGradient id="paint0_linear_574_2423" x1="104.545" y1="65.4187" x2="104.545" y2="143.672" gradientUnits="userSpaceOnUse">
<stop stop-color="#D54BF6"/>
<stop offset="1" stop-color="#4B10D1"/>
</linearGradient>
</defs>
</svg>`;

    const tokensLogoIcon = figma.createNodeFromSvg(tokensLogoSvg);
    tokensLogoIcon.name = "Logo Icon";
    tokensLogoIcon.resize(48, 48);
    tokensLeftBrand.appendChild(tokensLogoIcon);

    const tokensLogoText = figma.createText();
    tokensLogoText.fontName = { family: "Roboto", style: "Bold" };
    tokensLogoText.fontSize = 28;
    tokensLogoText.characters = "Slate.Design";
    tokensLogoText.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
    tokensLeftBrand.appendChild(tokensLogoText);

    tokensTopBar.appendChild(tokensLeftBrand);

    // Right side - CODETHEOREM Logo
    const tokensRightBrand = figma.createFrame();
    tokensRightBrand.layoutMode = 'HORIZONTAL';
    tokensRightBrand.counterAxisAlignItems = 'CENTER';
    tokensRightBrand.itemSpacing = 12;
    tokensRightBrand.fills = [];

    // "Created by" text
    const tokensCreatedByText = figma.createText();
    tokensCreatedByText.fontName = { family: "Roboto", style: "Regular" };
    tokensCreatedByText.fontSize = 13;
    tokensCreatedByText.characters = "Created by";
    tokensCreatedByText.fills = [{ type: 'SOLID', color: { r: 0.7, g: 0.75, b: 0.85 }, opacity: 0.8 }];
    tokensRightBrand.appendChild(tokensCreatedByText);

    // CODETHEOREM Logo SVG
    const tokensCodetheoremSvg = `<svg width="40" height="40" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="200" height="200" rx="40" fill="url(#paint0_linear_codetheorem_tokens)"/>
<path d="M60 100L80 80M60 100L80 120M140 100L120 80M140 100L120 120" stroke="white" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
<circle cx="100" cy="100" r="8" fill="white"/>
<defs>
<linearGradient id="paint0_linear_codetheorem_tokens" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
<stop stop-color="#6366F1"/>
<stop offset="1" stop-color="#8B5CF6"/>
</linearGradient>
</defs>
</svg>`;

    const tokensCodetheoremIcon = figma.createNodeFromSvg(tokensCodetheoremSvg);
    tokensCodetheoremIcon.name = "CODETHEOREM Icon";
    tokensCodetheoremIcon.resize(40, 40);
    tokensRightBrand.appendChild(tokensCodetheoremIcon);

    // CODETHEOREM Text
    const tokensCodetheoremText = figma.createText();
    tokensCodetheoremText.fontName = { family: "Roboto", style: "Bold" };
    tokensCodetheoremText.fontSize = 18;
    tokensCodetheoremText.characters = "CODETHEOREM";
    tokensCodetheoremText.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
    tokensCodetheoremText.letterSpacing = { value: 1, unit: 'PIXELS' };
    tokensRightBrand.appendChild(tokensCodetheoremText);

    tokensTopBar.appendChild(tokensRightBrand);

    tokensHeader.appendChild(tokensTopBar);

    // 2. HERO TITLE SECTION
    const tokensTitleGroup = figma.createFrame();
    tokensTitleGroup.layoutMode = 'VERTICAL';
    tokensTitleGroup.primaryAxisSizingMode = 'AUTO';
    tokensTitleGroup.counterAxisSizingMode = 'AUTO';
    tokensTitleGroup.itemSpacing = 24;
    tokensTitleGroup.fills = [];

    const tokensTitle = figma.createText();
    tokensTitle.fontName = { family: "Roboto", style: "Bold" };
    tokensTitle.fontSize = 64;
    tokensTitle.letterSpacing = { value: -1.5, unit: 'PIXELS' };
    tokensTitle.characters = "Design Tokens";
    tokensTitle.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
    tokensTitleGroup.appendChild(tokensTitle);

    const tokensDesc = figma.createText();
    tokensDesc.fontName = { family: "Roboto", style: "Regular" };
    tokensDesc.fontSize = 18;
    tokensDesc.lineHeight = { value: 160, unit: 'PERCENT' };
    tokensDesc.characters = "Spacing, padding, radius, stroke, and shadow values for consistent design.";
    tokensDesc.resize(600, tokensDesc.height);
    tokensDesc.fills = [{ type: 'SOLID', color: { r: 0.75, g: 0.8, b: 0.9 } }];
    tokensTitleGroup.appendChild(tokensDesc);

    tokensHeader.appendChild(tokensTitleGroup);

    // 3. STATS ROW (Glassmorphism)
    const tokensStatsRow = figma.createFrame();
    tokensStatsRow.layoutMode = 'HORIZONTAL';
    tokensStatsRow.primaryAxisSizingMode = 'AUTO';
    tokensStatsRow.counterAxisSizingMode = 'AUTO';
    tokensStatsRow.itemSpacing = 16;
    tokensStatsRow.fills = [];

    // Calculate token counts
    const spacingTokens = (msg.spacing && Object.keys(msg.spacing).length) || 0;
    const paddingTokens = (msg.padding && Object.keys(msg.padding).length) || 0;
    const radiusTokens = (msg.radius && Object.keys(msg.radius).length) || 0;
    const strokeTokens = (msg.strokes && Object.keys(msg.strokes).length) || 0;
    const shadowTokens = (msg.shadows && Object.keys(msg.shadows).length) || 0;
    const totalTokens = spacingTokens + paddingTokens + radiusTokens + strokeTokens + shadowTokens;

    // Create stats badges
    function createTokensDarkStat(label, value) {
        const badge = figma.createFrame();
        badge.layoutMode = 'HORIZONTAL';
        badge.primaryAxisSizingMode = 'AUTO';
        badge.counterAxisSizingMode = 'AUTO';
        badge.paddingLeft = 20;
        badge.paddingRight = 20;
        badge.paddingTop = 10;
        badge.paddingBottom = 10;
        badge.cornerRadius = 100;
        badge.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, opacity: 0.08 }];
        badge.strokes = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, opacity: 0.15 }];
        badge.strokeWeight = 1;
        badge.itemSpacing = 10;
        badge.counterAxisAlignItems = 'CENTER';

        const tLabel = figma.createText();
        tLabel.fontName = { family: "Roboto", style: "Medium" };
        tLabel.fontSize = 13;
        tLabel.characters = label;
        tLabel.fills = [{ type: 'SOLID', color: { r: 0.75, g: 0.8, b: 0.9 } }];
        badge.appendChild(tLabel);

        const tValue = figma.createText();
        tValue.fontName = { family: "Roboto", style: "Bold" };
        tValue.fontSize = 13;
        tValue.characters = value;
        tValue.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
        badge.appendChild(tValue);

        return badge;
    }

    tokensStatsRow.appendChild(createTokensDarkStat("Total Tokens", String(totalTokens)));
    tokensStatsRow.appendChild(createTokensDarkStat("Last Updated", new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })));

    tokensHeader.appendChild(tokensStatsRow);
    tokensFrame.appendChild(tokensHeader);

    // Tokens Content
    const tokensContent = figma.createFrame();
    tokensContent.name = "Tokens Content";
    tokensContent.layoutMode = 'VERTICAL';
    tokensContent.primaryAxisSizingMode = 'AUTO';
    tokensContent.counterAxisSizingMode = 'AUTO';
    tokensContent.itemSpacing = 48;
    tokensContent.paddingLeft = 80;
    tokensContent.paddingRight = 80;
    tokensContent.paddingTop = 80;
    tokensContent.paddingBottom = 80;
    tokensContent.fills = [];

    // Add token sections
    if (msg.spacing && Object.keys(msg.spacing).length > 0) {
        createDetailedSystemTokenRow("Spacing Scale", "Consistent spacing values for layout and component sizing.", msg.spacing, "spacing", tokensContent);
    }
    if (msg.padding && Object.keys(msg.padding).length > 0) {
        createDetailedSystemTokenRow("Padding Scale", "Internal spacing for containers and components.", msg.padding, "padding", tokensContent);
    }
    if (msg.radius && Object.keys(msg.radius).length > 0) {
        createDetailedSystemTokenRow("Corner Radius", "Rounding values for creating organic shapes.", msg.radius, "radius", tokensContent);
    }
    if (msg.strokes && Object.keys(msg.strokes).length > 0) {
        createDetailedSystemTokenRow("Stroke Widths", "Border thickness values for definition and hierarchy.", msg.strokes, "stroke", tokensContent);
    }
    if (msg.shadows && Object.keys(msg.shadows).length > 0) {
        createDetailedShadowRow("Shadow Effects", "Depth and elevation values using drop shadows.", msg.shadows, tokensContent);
    }

    tokensFrame.appendChild(tokensContent);
    figma.currentPage.appendChild(tokensFrame);

    // Position Tokens frame side by side with Design System Documentation
    tokensFrame.x = frame.x + frame.width + 80;
    tokensFrame.y = frame.y;

    figma.viewport.scrollAndZoomIntoView([frame, tokensFrame]);
}

function hexToRgbValues(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return { r: 0, g: 0, b: 0 };
    return {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    };
}

function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }

    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    };
}

function createDetailedColorRow(title, description, data, parent) {
    const row = figma.createFrame();
    row.name = `Section - ${title}`;
    row.layoutMode = 'VERTICAL';
    row.primaryAxisSizingMode = 'AUTO';
    row.counterAxisSizingMode = 'AUTO';
    row.itemSpacing = 24;
    row.fills = [];

    // Section Header
    const header = figma.createFrame();
    header.layoutMode = 'VERTICAL';
    header.primaryAxisSizingMode = 'AUTO';
    header.counterAxisSizingMode = 'AUTO';
    header.itemSpacing = 8;
    header.fills = [];

    const h3 = figma.createText();
    h3.fontName = { family: "Roboto", style: "Bold" };
    h3.fontSize = 20;
    h3.characters = title;
    h3.fills = [{ type: 'SOLID', color: { r: 0.03, g: 0.06, b: 0.23 } }];
    header.appendChild(h3);

    const p = figma.createText();
    p.fontName = { family: "Roboto", style: "Regular" };
    p.fontSize = 14;
    p.characters = description;
    p.fills = [{ type: 'SOLID', color: { r: 0.45, g: 0.47, b: 0.53 } }];
    header.appendChild(p);

    row.appendChild(header);

    // Cards Grid
    const grid = figma.createFrame();
    grid.layoutMode = 'HORIZONTAL';
    grid.layoutWrap = 'WRAP';
    grid.primaryAxisSizingMode = 'AUTO';
    grid.counterAxisSizingMode = 'AUTO';
    grid.itemSpacing = 4;
    grid.counterAxisSpacing = 16;
    grid.fills = [];

    const entries = Object.entries(data).sort((a, b) => {
        const numA = parseInt(a[0].match(/\d+/) || 0);
        const numB = parseInt(b[0].match(/\d+/) || 0);
        return numA - numB;
    });

    for (const [key, hex] of entries) {
        // Map common naming patterns to numeric shades
        let shade;
        if (key.match(/\d+/)) {
            shade = key.match(/\d+/)[0];
        } else if (key.includes('light')) {
            shade = '100';
        } else if (key.includes('default') || key.includes('main')) {
            shade = '200';
        } else if (key.includes('dark')) {
            shade = '300';
        } else {
            shade = '200'; // default
        }

        const colorName = title.split(' ')[0];

        const card = figma.createFrame();
        card.name = `${colorName}-${shade}`;
        card.layoutMode = 'VERTICAL';
        card.primaryAxisSizingMode = 'AUTO';
        card.counterAxisSizingMode = 'AUTO';
        card.cornerRadius = 4;
        card.itemSpacing = 0;
        card.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
        card.effects = [{
            type: 'DROP_SHADOW',
            color: { r: 0, g: 0, b: 0, a: 0.04 },
            offset: { x: 0, y: 1 },
            radius: 3,
            visible: true,
            blendMode: 'NORMAL'
        }];
        card.strokes = [{ type: 'SOLID', color: { r: 0.93, g: 0.94, b: 0.95 } }];
        card.strokeWeight = 1;

        // Color Swatch Area
        const swatch = figma.createRectangle();
        swatch.name = "Color Swatch";
        swatch.resize(240, 120);
        const rgb = hexToRgb(hex);
        swatch.fills = [{ type: 'SOLID', color: rgb }];
        swatch.topLeftRadius = 4;
        swatch.topRightRadius = 4;
        swatch.bottomLeftRadius = 0;
        swatch.bottomRightRadius = 0;
        card.appendChild(swatch);

        // Info Area
        const info = figma.createFrame();
        info.name = "Info";
        info.layoutMode = 'HORIZONTAL';
        info.layoutAlign = 'STRETCH';
        info.primaryAxisSizingMode = 'AUTO';
        info.counterAxisSizingMode = 'AUTO';
        info.primaryAxisAlignItems = 'SPACE_BETWEEN';
        info.resize(218, 59);
        info.paddingLeft = 12;
        info.paddingRight = 12;
        info.paddingTop = 12;
        info.paddingBottom = 12;
        info.fills = [];

        // Left side - Name and Hex
        const leftInfo = figma.createFrame();
        leftInfo.name = "Left Info";
        leftInfo.layoutMode = 'VERTICAL';
        leftInfo.primaryAxisSizingMode = 'AUTO';
        leftInfo.counterAxisSizingMode = 'AUTO';
        leftInfo.itemSpacing = 4;
        leftInfo.fills = [];

        const tShade = figma.createText();
        tShade.fontName = { family: "Roboto", style: "Medium" };
        tShade.fontSize = 14;
        tShade.characters = `${colorName}-${shade}`;
        tShade.fills = [{ type: 'SOLID', color: { r: 0.03, g: 0.06, b: 0.23 } }];
        leftInfo.appendChild(tShade);

        const tHex = figma.createText();
        tHex.fontName = { family: "Roboto", style: "Regular" };
        tHex.fontSize = 13;
        tHex.characters = hex.toUpperCase();
        tHex.fills = [{ type: 'SOLID', color: { r: 0.55, g: 0.57, b: 0.63 } }];
        leftInfo.appendChild(tHex);

        info.appendChild(leftInfo);

        // Right side - RGB and HSL
        const rightInfo = figma.createFrame();
        rightInfo.name = "Right Info";
        rightInfo.layoutMode = 'VERTICAL';
        rightInfo.primaryAxisSizingMode = 'AUTO';
        rightInfo.counterAxisSizingMode = 'AUTO';
        rightInfo.counterAxisAlignItems = 'MAX';
        rightInfo.itemSpacing = 4;
        rightInfo.fills = [];

        const rgbValues = hexToRgbValues(hex);
        const hslValues = rgbToHsl(rgbValues.r, rgbValues.g, rgbValues.b);

        const tRgb = figma.createText();
        tRgb.fontName = { family: "Roboto", style: "Regular" };
        tRgb.fontSize = 13;
        tRgb.characters = `RGB(${rgbValues.r}, ${rgbValues.g}, ${rgbValues.b})`;
        tRgb.fills = [{ type: 'SOLID', color: { r: 0.55, g: 0.57, b: 0.63 } }];
        tRgb.textAlignHorizontal = 'RIGHT';
        rightInfo.appendChild(tRgb);

        const tHsl = figma.createText();
        tHsl.fontName = { family: "Roboto", style: "Regular" };
        tHsl.fontSize = 13;
        tHsl.characters = `HSL(${hslValues.h}, ${hslValues.s}%, ${hslValues.l}%)`;
        tHsl.fills = [{ type: 'SOLID', color: { r: 0.55, g: 0.57, b: 0.63 } }];
        tHsl.textAlignHorizontal = 'RIGHT';
        rightInfo.appendChild(tHsl);

        info.appendChild(rightInfo);

        card.appendChild(info);
        grid.appendChild(card);
    }
    row.appendChild(grid);
    parent.appendChild(row);
}

function createDetailedSystemTokenRow(title, description, data, type, parent) {
    const row = figma.createFrame();
    row.name = `Section - ${title}`;
    row.resize(2272, 100);
    row.layoutMode = 'VERTICAL';
    row.primaryAxisSizingMode = 'AUTO';
    row.itemSpacing = 24;
    row.fills = [];

    // Header
    const header = figma.createFrame();
    header.layoutMode = 'VERTICAL';
    header.primaryAxisSizingMode = 'AUTO';
    header.counterAxisSizingMode = 'AUTO';
    header.itemSpacing = 8;
    header.fills = [];

    const h3 = figma.createText();
    h3.fontName = { family: "Roboto", style: "Bold" };
    h3.fontSize = 20;
    h3.characters = title;
    h3.fills = [{ type: 'SOLID', color: { r: 0.03, g: 0.06, b: 0.23 } }];
    header.appendChild(h3);

    const p = figma.createText();
    p.fontName = { family: "Roboto", style: "Regular" };
    p.fontSize = 14;
    p.characters = description;
    p.fills = [{ type: 'SOLID', color: { r: 0.45, g: 0.47, b: 0.53 } }];
    header.appendChild(p);

    row.appendChild(header);

    const grid = figma.createFrame();
    grid.layoutMode = 'HORIZONTAL';
    grid.layoutWrap = 'WRAP';
    grid.primaryAxisSizingMode = 'AUTO';
    grid.counterAxisSizingMode = 'AUTO';
    grid.itemSpacing = 16;
    grid.counterAxisSpacing = 16;
    grid.fills = [];

    for (const [key, val] of Object.entries(data)) {
        // Safe value retrieval/parsing
        let rawVal = val;
        if (typeof val === 'object' && val !== null) {
            rawVal = val.desktop !== undefined ? val.desktop : (val.value !== undefined ? val.value : 0);
        }
        const displayVal = rawVal !== undefined ? rawVal : 0;
        const floatVal = parseFloat(displayVal) || 0;

        const card = figma.createFrame();
        card.name = key;
        card.layoutMode = 'VERTICAL';
        card.primaryAxisSizingMode = 'AUTO';
        card.counterAxisSizingMode = 'AUTO';
        card.cornerRadius = 8;
        card.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
        card.strokes = [{ type: 'SOLID', color: { r: 0.9, g: 0.91, b: 0.93 } }];
        card.strokeWeight = 1;
        card.paddingLeft = 16;
        card.paddingRight = 16;
        card.paddingTop = 16;
        card.paddingBottom = 16;
        card.itemSpacing = 12;

        // Visual Preview Area
        const preview = figma.createFrame();
        preview.layoutMode = 'HORIZONTAL';
        preview.layoutAlign = 'STRETCH';
        preview.resize(preview.width, 60);
        preview.primaryAxisSizingMode = 'FIXED';
        preview.primaryAxisAlignItems = 'CENTER';
        preview.counterAxisAlignItems = 'CENTER';
        preview.fills = [];

        // Visualization Logic
        if (type === 'spacing') {
            const spacer = figma.createRectangle();
            const width = Math.max(2, Math.min(100, floatVal));
            spacer.resize(width, 20);
            spacer.cornerRadius = 2;
            spacer.fills = [{ type: 'SOLID', color: { r: 0.04, g: 0.36, b: 0.96 } }];
            preview.appendChild(spacer);
        } else if (type === 'padding') {
            const container = figma.createFrame();
            container.resize(56, 56);
            container.cornerRadius = 4;
            container.fills = [];
            container.strokes = [{ type: 'SOLID', color: { r: 0.8, g: 0.82, b: 0.88 } }];

            const content = figma.createRectangle();
            const vizPadding = Math.min(20, floatVal);
            const contentSize = 56 - (vizPadding * 2);
            content.resize(Math.max(4, contentSize), Math.max(4, contentSize));
            content.cornerRadius = 2;
            content.fills = [{ type: 'SOLID', color: { r: 0.04, g: 0.36, b: 0.96 }, opacity: 0.2 }];

            content.x = (56 - content.width) / 2;
            content.y = (56 - content.height) / 2;
            container.appendChild(content);
            preview.appendChild(container);
        } else if (type === 'radius') {
            const shape = figma.createRectangle();
            shape.resize(48, 48);
            shape.cornerRadius = Math.min(24, floatVal);
            shape.fills = [];
            shape.strokes = [{ type: 'SOLID', color: { r: 0.04, g: 0.36, b: 0.96 } }];
            shape.strokeWeight = 2;
            preview.appendChild(shape);
        } else if (type === 'stroke') {
            const line = figma.createRectangle();
            line.resize(64, Math.max(1, floatVal));
            line.fills = [{ type: 'SOLID', color: { r: 0.04, g: 0.36, b: 0.96 } }];
            preview.appendChild(line);
        }

        card.appendChild(preview);

        // Info
        const info = figma.createFrame();
        info.layoutMode = 'VERTICAL';
        info.primaryAxisSizingMode = 'AUTO';
        info.counterAxisSizingMode = 'AUTO';
        info.itemSpacing = 2;
        info.fills = [];

        const t1 = figma.createText();
        t1.fontName = { family: "Roboto", style: "Medium" };
        t1.fontSize = 14;
        t1.characters = key;
        t1.fills = [{ type: 'SOLID', color: { r: 0.1, g: 0.12, b: 0.16 } }];
        info.appendChild(t1);

        const t2 = figma.createText();
        t2.fontName = { family: "Roboto", style: "Regular" };
        t2.fontSize = 12;
        t2.characters = `${floatVal}px`;
        t2.fills = [{ type: 'SOLID', color: { r: 0.5, g: 0.52, b: 0.58 } }];
        info.appendChild(t2);

        card.appendChild(info);
        grid.appendChild(card);
    }
    row.appendChild(grid);
    parent.appendChild(row);
}

function createDetailedShadowRow(title, description, data, parent) {
    const row = figma.createFrame();
    row.name = `Section - ${title}`;
    row.resize(2272, 100);
    row.layoutMode = 'VERTICAL';
    row.primaryAxisSizingMode = 'AUTO';
    row.itemSpacing = 24;
    row.fills = [];

    // Header
    const header = figma.createFrame();
    header.layoutMode = 'VERTICAL';
    header.primaryAxisSizingMode = 'AUTO';
    header.counterAxisSizingMode = 'AUTO';
    header.itemSpacing = 8;
    header.fills = [];

    const h3 = figma.createText();
    h3.fontName = { family: "Roboto", style: "Bold" };
    h3.fontSize = 20;
    h3.characters = title;
    h3.fills = [{ type: 'SOLID', color: { r: 0.03, g: 0.06, b: 0.23 } }];
    header.appendChild(h3);

    const p = figma.createText();
    p.fontName = { family: "Roboto", style: "Regular" };
    p.fontSize = 14;
    p.characters = description;
    p.fills = [{ type: 'SOLID', color: { r: 0.45, g: 0.47, b: 0.53 } }];
    header.appendChild(p);

    row.appendChild(header);

    const grid = figma.createFrame();
    grid.layoutMode = 'HORIZONTAL';
    grid.layoutWrap = 'WRAP';
    grid.primaryAxisSizingMode = 'AUTO';
    grid.counterAxisSizingMode = 'AUTO';
    grid.itemSpacing = 16;
    grid.counterAxisSpacing = 16;
    grid.fills = [];

    for (const [key, val] of Object.entries(data)) {
        if (val === 'none') continue;

        const card = figma.createFrame();
        card.name = key;
        card.layoutMode = 'VERTICAL';
        card.primaryAxisSizingMode = 'AUTO';
        card.counterAxisSizingMode = 'AUTO';
        card.cornerRadius = 12;
        card.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
        card.strokes = [{ type: 'SOLID', color: { r: 0.93, g: 0.94, b: 0.95 } }];
        card.strokeWeight = 1;
        card.paddingLeft = 16;
        card.paddingRight = 16;
        card.paddingTop = 16;
        card.paddingBottom = 16;
        card.itemSpacing = 12;

        // Visual Preview
        const preview = figma.createFrame();
        preview.layoutMode = 'HORIZONTAL';
        preview.primaryAxisSizingMode = 'FIXED';
        preview.counterAxisSizingMode = 'FIXED';
        preview.resize(148, 80);
        preview.primaryAxisAlignItems = 'CENTER';
        preview.counterAxisAlignItems = 'CENTER';
        preview.fills = [{ type: 'SOLID', color: { r: 0.98, g: 0.98, b: 0.99 } }];
        preview.cornerRadius = 8;

        const shape = figma.createRectangle();
        shape.resize(48, 48);
        shape.cornerRadius = 8;
        shape.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];

        // Parse shadow
        const shadowMatch = val.match(/(-?\d+)(?:px)?\s+(-?\d+)(?:px)?\s+(-?\d+)(?:px)?\s+rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
        if (shadowMatch) {
            const [, x, y, blur, r, g, b, a] = shadowMatch;
            shape.effects = [{
                type: 'DROP_SHADOW',
                color: { r: parseInt(r) / 255, g: parseInt(g) / 255, b: parseInt(b) / 255, a: parseFloat(a) },
                offset: { x: parseInt(x), y: parseInt(y) },
                radius: parseInt(blur),
                visible: true,
                blendMode: 'NORMAL'
            }];
        } else {
            shape.strokes = [{ type: 'SOLID', color: { r: 0.9, g: 0.9, b: 0.9 } }];
        }

        preview.appendChild(shape);
        card.appendChild(preview);

        // Info
        const info = figma.createFrame();
        info.layoutMode = 'VERTICAL';
        info.primaryAxisSizingMode = 'AUTO';
        info.counterAxisSizingMode = 'AUTO';
        info.itemSpacing = 4;
        info.fills = [];

        const t1 = figma.createText();
        t1.fontName = { family: "Roboto", style: "Medium" };
        t1.fontSize = 14;
        t1.characters = key;
        t1.fills = [{ type: 'SOLID', color: { r: 0.03, g: 0.06, b: 0.23 } }];
        info.appendChild(t1);

        const t2 = figma.createText();
        t2.fontName = { family: "Roboto", style: "Regular" };
        t2.fontSize = 11;
        t2.characters = val;
        t2.textAutoResize = 'HEIGHT';
        t2.resize(148, t2.height);
        t2.fills = [{ type: 'SOLID', color: { r: 0.55, g: 0.57, b: 0.63 } }];
        info.appendChild(t2);

        card.appendChild(info);
        grid.appendChild(card);
    }

    row.appendChild(grid);
    parent.appendChild(row);
}

// ============================================
// TOKEN DOCUMENTATION - END
// ============================================


// ============================================
// TYPOGRAPHY SYSTEM - START
// ============================================

async function createTypographySystem(typography) {
    // Validate typography data
    if (!typography || !typography.primaryFont || !typography.styles) {
        throw new Error('Invalid typography data. Please ensure primaryFont and styles are defined.');
    }

    // Try to load fonts with fallback options
    let fallbackFont = { family: "Roboto", style: "Regular" };
    try {
        // Try Inter first (most common in Figma)
        await figma.loadFontAsync({ family: "Inter", style: "Regular" });
        await figma.loadFontAsync({ family: "Inter", style: "Medium" });
        await figma.loadFontAsync({ family: "Inter", style: "Semi Bold" });
        await figma.loadFontAsync({ family: "Inter", style: "Bold" });
        fallbackFont = { family: "Inter", style: "Regular" };
    } catch (interError) {
        try {
            // Try Roboto as fallback
            await figma.loadFontAsync({ family: "Roboto", style: "Regular" });
            await figma.loadFontAsync({ family: "Roboto", style: "Medium" });
            await figma.loadFontAsync({ family: "Roboto", style: "Bold" });
            fallbackFont = { family: "Roboto", style: "Regular" };
        } catch (robotoError) {
            try {
                // Try Arial as last resort (always available)
                await figma.loadFontAsync({ family: "Arial", style: "Regular" });
                await figma.loadFontAsync({ family: "Arial", style: "Bold" });
                fallbackFont = { family: "Arial", style: "Regular" };
            } catch (arialError) {
                console.error('No suitable fonts available');
                throw new Error('Failed to load any fonts. Please ensure Inter, Roboto, or Arial fonts are available.');
            }
        }
    }

    // Create font name variables
    const collections = await figma.variables.getLocalVariableCollectionsAsync();
    let fontCollection = collections.find(c => c.name === 'Typography/Font Names');

    if (!fontCollection) {
        fontCollection = figma.variables.createVariableCollection('Typography/Font Names');
    }

    const existingVars = await figma.variables.getLocalVariablesAsync('STRING');
    let primaryFontVar = existingVars.find(v => v.name === 'font/primary' && v.variableCollectionId === fontCollection.id);

    if (!primaryFontVar) {
        primaryFontVar = figma.variables.createVariable('font/primary', fontCollection, 'STRING');
    }
    primaryFontVar.setValueForMode(fontCollection.modes[0].modeId, typography.primaryFont);

    let secondaryFontVar = null;
    if (typography.secondaryEnabled && typography.secondaryFont) {
        secondaryFontVar = existingVars.find(v => v.name === 'font/secondary' && v.variableCollectionId === fontCollection.id);
        if (!secondaryFontVar) {
            secondaryFontVar = figma.variables.createVariable('font/secondary', fontCollection, 'STRING');
        }
        secondaryFontVar.setValueForMode(fontCollection.modes[0].modeId, typography.secondaryFont);
    }

    // Create typography size variables
    let typographyCollection = collections.find(c => c.name === 'Typography/Sizes');

    if (!typographyCollection) {
        typographyCollection = figma.variables.createVariableCollection('Typography/Sizes');
        typographyCollection.renameMode(typographyCollection.modes[0].modeId, 'Desktop');
        typographyCollection.addMode('Mobile');
    } else {
        if (!typographyCollection.modes.some(mode => mode.name === 'Mobile')) {
            typographyCollection.addMode('Mobile');
        }
    }

    const desktopModeId = typographyCollection.modes.find(m => m.name === 'Desktop').modeId;
    const mobileModeId = typographyCollection.modes.find(m => m.name === 'Mobile').modeId;

    const existingFloatVars = await figma.variables.getLocalVariablesAsync('FLOAT');
    const typographyVariables = {};

    // Validate styles exist
    if (!typography.styles || Object.keys(typography.styles).length === 0) {
        throw new Error('No typography styles found. Please define at least one style.');
    }

    for (const [key, style] of Object.entries(typography.styles)) {
        // Validate style properties
        if (!style || typeof style.size !== 'number') {
            console.warn(`Invalid style data for ${key}, skipping...`);
            continue;
        }

        const mobileSize = Math.round(style.size * 0.85);

        const sizeVarName = `typography/${key}/size`;
        let sizeVar = existingFloatVars.find(v => v.name === sizeVarName && v.variableCollectionId === typographyCollection.id);
        if (!sizeVar) {
            sizeVar = figma.variables.createVariable(sizeVarName, typographyCollection, 'FLOAT');
        }
        sizeVar.setValueForMode(desktopModeId, style.size);
        sizeVar.setValueForMode(mobileModeId, mobileSize);

        const letterSpacingVarName = `typography/${key}/letterSpacing`;
        let letterSpacingVar = existingFloatVars.find(v => v.name === letterSpacingVarName && v.variableCollectionId === typographyCollection.id);
        if (!letterSpacingVar) {
            letterSpacingVar = figma.variables.createVariable(letterSpacingVarName, typographyCollection, 'FLOAT');
        }
        const letterSpacing = style.letterSpacing || 0;
        letterSpacingVar.setValueForMode(desktopModeId, letterSpacing);
        letterSpacingVar.setValueForMode(mobileModeId, letterSpacing);

        typographyVariables[key] = { size: sizeVar, letterSpacing: letterSpacingVar, lineHeight: style.lineHeight || 1.5 };
    }

    // Find best matching font
    const availableFonts = await figma.listAvailableFontsAsync();

    function findBestFont(fontFamily, weight) {
        let matchingFonts = availableFonts.filter(f => f.fontName.family === fontFamily);
        if (matchingFonts.length === 0) {
            matchingFonts = availableFonts.filter(f => f.fontName.family.toLowerCase() === fontFamily.toLowerCase());
        }
        if (matchingFonts.length === 0) {
            // Try fallback fonts in order
            const fallbackFamilies = [fallbackFont.family, 'Inter', 'Roboto', 'Arial'];
            for (const fallbackFamily of fallbackFamilies) {
                matchingFonts = availableFonts.filter(f => f.fontName.family === fallbackFamily);
                if (matchingFonts.length > 0) break;
            }
        }

        const weightMap = { 100: 'Thin', 200: 'Extra Light', 300: 'Light', 400: 'Regular', 500: 'Medium', 600: 'Semi Bold', 700: 'Bold', 800: 'Extra Bold', 900: 'Black' };
        const styleName = weightMap[weight] || 'Regular';
        let font = matchingFonts.find(f => f.fontName.style === styleName);

        if (!font) {
            const altNames = { 'Semi Bold': ['Semibold', 'SemiBold', 'Semi-Bold'], 'Extra Light': ['ExtraLight', 'Extra-Light'], 'Extra Bold': ['ExtraBold', 'Extra-Bold'] };
            if (altNames[styleName]) {
                for (const altName of altNames[styleName]) {
                    font = matchingFonts.find(f => f.fontName.style === altName);
                    if (font) break;
                }
            }
        }

        if (!font && matchingFonts.length > 0) font = matchingFonts[0];
        return font ? font.fontName : fallbackFont;
    }

    let createdStylesCount = 0;
    const weights = [
        { name: 'Regular', value: 400 },
        { name: 'Medium', value: 500 },
        { name: 'Semibold', value: 600 },
        { name: 'Bold', value: 700 }
    ];

    // Create text styles for PRIMARY font
    for (const [key, style] of Object.entries(typography.styles)) {
        // Skip invalid styles
        if (!style || typeof style.size !== 'number') {
            continue;
        }

        for (const weight of weights) {
            try {
                const fontName = findBestFont(typography.primaryFont, weight.value);
                await figma.loadFontAsync(fontName);

                const styleName = `Primary/${key.toUpperCase()}/${weight.name}`;
                const existingStyles = await figma.getLocalTextStylesAsync();
                let textStyle = existingStyles.find(s => s.name === styleName);

                if (!textStyle) {
                    textStyle = figma.createTextStyle();
                    textStyle.name = styleName;
                }

                textStyle.fontName = fontName;
                textStyle.fontSize = style.size;
                textStyle.lineHeight = { value: (style.lineHeight || 1.5) * 100, unit: 'PERCENT' };
                textStyle.letterSpacing = { value: style.letterSpacing || 0, unit: 'PIXELS' };

                if (typographyVariables[key]) {
                    try {
                        textStyle.setBoundVariable('fontSize', typographyVariables[key].size);
                        textStyle.setBoundVariable('letterSpacing', typographyVariables[key].letterSpacing);
                    } catch (e) { 
                        console.warn(`Could not bind variables for ${styleName}:`, e);
                    }
                }

                createdStylesCount++;
            } catch (styleError) {
                console.error(`Error creating style ${key} with weight ${weight.name}:`, styleError);
            }
        }
    }

    // Create text styles for SECONDARY font
    if (typography.secondaryEnabled && typography.secondaryFont) {
        for (const [key, style] of Object.entries(typography.styles)) {
            // Skip invalid styles
            if (!style || typeof style.size !== 'number') {
                continue;
            }

            for (const weight of weights) {
                try {
                    const fontName = findBestFont(typography.secondaryFont, weight.value);
                    await figma.loadFontAsync(fontName);

                    const styleName = `Secondary/${key.toUpperCase()}/${weight.name}`;
                    const existingStyles = await figma.getLocalTextStylesAsync();
                    let textStyle = existingStyles.find(s => s.name === styleName);

                    if (!textStyle) {
                        textStyle = figma.createTextStyle();
                        textStyle.name = styleName;
                    }

                    textStyle.fontName = fontName;
                    textStyle.fontSize = style.size;
                    textStyle.lineHeight = { value: (style.lineHeight || 1.5) * 100, unit: 'PERCENT' };
                    textStyle.letterSpacing = { value: style.letterSpacing || 0, unit: 'PIXELS' };

                    if (typographyVariables[key]) {
                        try {
                            textStyle.setBoundVariable('fontSize', typographyVariables[key].size);
                            textStyle.setBoundVariable('letterSpacing', typographyVariables[key].letterSpacing);
                        } catch (e) { 
                            console.warn(`Could not bind variables for ${styleName}:`, e);
                        }
                    }

                    createdStylesCount++;
                } catch (styleError) {
                    console.error(`Error creating secondary style ${key} with weight ${weight.name}:`, styleError);
                }
            }
        }
    }

    // Create typography documentation
    try {
        await createTypographyDocumentation(typography, findBestFont);
    } catch (docError) {
        console.error('Error creating typography documentation:', docError);
        // Don't throw - documentation is optional
    }

    figma.notify(`✅ Created ${createdStylesCount} text styles!`);
}

async function createTypographyDocumentation(typography, findBestFont) {
    // Get a safe fallback font for documentation
    let docFont = { family: "Inter", style: "Regular" };
    try {
        await figma.loadFontAsync({ family: "Inter", style: "Bold" });
        await figma.loadFontAsync({ family: "Inter", style: "Regular" });
        await figma.loadFontAsync({ family: "Inter", style: "Semi Bold" });
        docFont = { family: "Inter", style: "Regular" };
    } catch (e) {
        try {
            await figma.loadFontAsync({ family: "Roboto", style: "Bold" });
            await figma.loadFontAsync({ family: "Roboto", style: "Regular" });
            docFont = { family: "Roboto", style: "Regular" };
        } catch (e2) {
            await figma.loadFontAsync({ family: "Arial", style: "Bold" });
            await figma.loadFontAsync({ family: "Arial", style: "Regular" });
            docFont = { family: "Arial", style: "Regular" };
        }
    }

    const container = figma.createFrame();
    container.name = "Typography System";
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

    // Header
    const header = figma.createFrame();
    header.name = "Header";
    header.fills = [];
    header.layoutMode = 'VERTICAL';
    header.primaryAxisSizingMode = 'AUTO';
    header.counterAxisSizingMode = 'AUTO';
    header.itemSpacing = 8;

    const titleText = figma.createText();
    titleText.fontName = { family: docFont.family, style: "Bold" };
    safeSetCharacters(titleText, "Typography System");
    titleText.fontSize = 32;
    titleText.fills = [{ type: 'SOLID', color: { r: 0.08, g: 0.08, b: 0.08 } }];
    header.appendChild(titleText);

    const categories = Object.keys(typography.styles);
    const subtitleText = figma.createText();
    subtitleText.fontName = docFont;
    safeSetCharacters(subtitleText, `${typography.primaryFont} • ${categories.length} Styles • Responsive Design`);
    subtitleText.fontSize = 15;
    subtitleText.fills = [{ type: 'SOLID', color: { r: 0.45, g: 0.45, b: 0.45 } }];
    header.appendChild(subtitleText);

    container.appendChild(header);

    // Typography cards
    const grid = figma.createFrame();
    grid.name = "Typography Grid";
    grid.fills = [];
    grid.layoutMode = 'VERTICAL';
    grid.primaryAxisSizingMode = 'AUTO';
    grid.counterAxisSizingMode = 'AUTO';
    grid.itemSpacing = 16;

    for (const category of categories) {
        const styleData = typography.styles[category];
        let previewWeightValue = 400;
        if (styleData.weight === 'Bold') previewWeightValue = 700;
        else if (styleData.weight === 'Semibold') previewWeightValue = 600;
        else if (styleData.weight === 'Medium') previewWeightValue = 500;

        const previewFontName = findBestFont(typography.primaryFont, previewWeightValue);
        await figma.loadFontAsync(previewFontName);

        const card = figma.createFrame();
        card.name = `${category} Card`;
        card.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
        card.layoutMode = 'VERTICAL';
        card.primaryAxisSizingMode = 'AUTO';
        card.counterAxisSizingMode = 'AUTO';
        card.paddingLeft = 32;
        card.paddingRight = 32;
        card.paddingTop = 28;
        card.paddingBottom = 28;
        card.itemSpacing = 20;
        card.cornerRadius = 12;
        card.effects = [{ type: 'DROP_SHADOW', color: { r: 0, g: 0, b: 0, a: 0.04 }, offset: { x: 0, y: 2 }, radius: 8, visible: true, blendMode: 'NORMAL' }];

        // Category label
        const categoryLabel = figma.createText();
        categoryLabel.fontName = { family: docFont.family, style: "Bold" };
        safeSetCharacters(categoryLabel, category.toUpperCase());
        categoryLabel.fontSize = 13;
        categoryLabel.fills = [{ type: 'SOLID', color: { r: 0.5, g: 0.5, b: 0.5 } }];
        categoryLabel.letterSpacing = { value: 1, unit: 'PIXELS' };
        card.appendChild(categoryLabel);

        // Preview text
        const previewText = figma.createText();
        previewText.fontName = previewFontName;
        safeSetCharacters(previewText, "The quick brown fox jumps over the lazy dog");
        previewText.fontSize = styleData.size;
        previewText.fills = [{ type: 'SOLID', color: { r: 0.1, g: 0.1, b: 0.1 } }];
        previewText.lineHeight = { value: (styleData.lineHeight || 1.5) * 100, unit: 'PERCENT' };
        previewText.letterSpacing = { value: styleData.letterSpacing || 0, unit: 'PIXELS' };
        card.appendChild(previewText);

        // Specs
        const specsText = figma.createText();
        specsText.fontName = docFont;
        const mobileSize = Math.round(styleData.size * 0.85);
        safeSetCharacters(specsText, `Desktop: ${styleData.size}px • Mobile: ${mobileSize}px • Line Height: ${Math.round((styleData.lineHeight || 1.5) * 100)}%`);
        specsText.fontSize = 12;
        specsText.fills = [{ type: 'SOLID', color: { r: 0.55, g: 0.55, b: 0.55 } }];
        card.appendChild(specsText);

        grid.appendChild(card);
    }

    container.appendChild(grid);
    figma.currentPage.appendChild(container);
    figma.viewport.scrollAndZoomIntoView([container]);
}

// ============================================
// TYPOGRAPHY SYSTEM - END
// ============================================

// ============================================
// LAYOUT GRID STYLES - START
// ============================================

async function createLayoutGridStyles(grids) {
    let gridCount = 0;

    const gridConfigs = [
        { name: 'Grid/Desktop', data: grids.desktop, color: { r: 0.31, g: 0.27, b: 0.9, a: 0.1 } },
        { name: 'Grid/Tablet', data: grids.tablet, color: { r: 0.55, g: 0.36, b: 0.96, a: 0.1 } },
        { name: 'Grid/Mobile', data: grids.mobile, color: { r: 0.06, g: 0.73, b: 0.51, a: 0.1 } }
    ];

    for (const config of gridConfigs) {
        if (!config.data) continue;

        try {
            // Check if grid style already exists
            const existingStyles = await figma.getLocalGridStylesAsync();
            let gridStyle = existingStyles.find(s => s.name === config.name);

            if (!gridStyle) {
                gridStyle = figma.createGridStyle();
                gridStyle.name = config.name;
            }

            // Create column grid layout
            gridStyle.layoutGrids = [{
                pattern: 'COLUMNS',
                alignment: 'STRETCH',
                gutterSize: config.data.gutter,
                count: config.data.columns,
                offset: config.data.margin,
                color: config.color
            }];

            gridCount++;
            console.log(`Created grid style: ${config.name}`);
        } catch (error) {
            console.error(`Error creating grid style ${config.name}:`, error);
        }
    }

    return gridCount;
}

// ============================================
// LAYOUT GRID STYLES - END
// ============================================
