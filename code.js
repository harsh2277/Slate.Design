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
            let collection = collections.find(c => c.name === 'Colors');

            if (!collection) {
                collection = figma.variables.createVariableCollection('Colors');
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
    frame.name = "Colors System";
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

    //     // 1. CENTERED LOGO SECTION
    //     const logoSection = figma.createFrame();
    //     logoSection.layoutMode = 'HORIZONTAL';
    //     logoSection.counterAxisAlignItems = 'CENTER';
    //     logoSection.primaryAxisAlignItems = 'CENTER';
    //     logoSection.layoutAlign = 'STRETCH';
    //     logoSection.itemSpacing = 16;
    //     logoSection.fills = [];

    //     // Slate.Design Logo SVG
    //     const logoSvg = `<svg width="48" height="48" viewBox="0 0 146 146" fill="none" xmlns="http://www.w3.org/2000/svg">
    // <path d="M72.7272 130C72.7272 133.515 69.871 136.397 66.374 136.046C56.0327 135.008 46.0681 131.449 37.3728 125.639C26.9078 118.646 18.7514 108.708 13.9349 97.0798C9.11845 85.4518 7.85825 72.6567 10.3137 60.3124C12.7691 47.9682 18.8299 36.6292 27.7296 27.7296C36.6292 18.8299 47.9682 12.7691 60.3124 10.3137C72.6567 7.85825 85.4518 9.11845 97.0798 13.9349C108.708 18.7514 118.646 26.9078 125.639 37.3728C131.449 46.0681 135.008 56.0327 136.046 66.374C136.397 69.871 133.515 72.7272 130 72.7272C126.486 72.7272 123.677 69.8672 123.239 66.38C122.257 58.5603 119.467 51.0449 115.057 44.4438C109.463 36.0717 101.512 29.5465 92.2093 25.6934C82.9068 21.8403 72.6708 20.8321 62.7954 22.7963C52.92 24.7608 43.8488 29.6093 36.7291 36.7291C29.6093 43.8488 24.7608 52.92 22.7963 62.7954C20.8321 72.6708 21.8403 82.9068 25.6934 92.2093C29.5465 101.512 36.0717 109.463 44.4438 115.057C51.0449 119.467 58.5603 122.257 66.38 123.239C69.8672 123.677 72.7272 126.486 72.7272 130Z" fill="#0A5DF5"/>
    // <path fill-rule="evenodd" clip-rule="evenodd" d="M112.065 78.8519C110.221 70.649 98.6814 70.7003 96.9078 78.9191L96.8403 79.2326L96.7086 79.841C94.7743 88.6256 87.8086 95.3666 79.0586 96.9105C70.6167 98.4002 70.6169 110.691 79.0586 112.18C87.8392 113.729 94.8229 120.512 96.7286 129.342L96.9078 130.172C98.6814 138.391 110.221 138.442 112.065 130.239L112.283 129.272C114.261 120.474 121.255 113.741 130.021 112.194C138.478 110.702 138.478 98.3891 130.021 96.8969C121.302 95.3584 114.335 88.6881 112.315 79.9586C112.258 79.7146 112.206 79.4814 112.149 79.2275L112.065 78.8519Z" fill="url(#paint0_linear_574_2423)"/>
    // <defs>
    // <linearGradient id="paint0_linear_574_2423" x1="104.545" y1="65.4187" x2="104.545" y2="143.672" gradientUnits="userSpaceOnUse">
    // <stop stop-color="#D54BF6"/>
    // <stop offset="1" stop-color="#4B10D1"/>
    // </linearGradient>
    // </defs>
    // </svg>`;

    //     const logoIcon = figma.createNodeFromSvg(logoSvg);
    //     logoIcon.name = "Slate.Design Logo";
    //     logoIcon.resize(56, 56);
    //     logoSection.appendChild(logoIcon);

    //     // "Created by" text
    //     const createdByText = figma.createText();
    //     createdByText.fontName = { family: "Roboto", style: "Regular" };
    //     createdByText.fontSize = 14;
    //     createdByText.characters = "Created by";
    //     createdByText.fills = [{ type: 'SOLID', color: { r: 0.7, g: 0.75, b: 0.85 }, opacity: 0.7 }];
    //     logoSection.appendChild(createdByText);

    //     // CODETHEOREM Logo SVG
    //     const codetheoremSvg = `<svg width="40" height="40" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    // <rect width="200" height="200" rx="40" fill="url(#paint0_linear_codetheorem)"/>
    // <path d="M60 100L80 80M60 100L80 120M140 100L120 80M140 100L120 120" stroke="white" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
    // <circle cx="100" cy="100" r="8" fill="white"/>
    // <defs>
    // <linearGradient id="paint0_linear_codetheorem" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
    // <stop stop-color="#6366F1"/>
    // <stop offset="1" stop-color="#8B5CF6"/>
    // </linearGradient>
    // </defs>
    // </svg>`;

    //     const codetheoremIcon = figma.createNodeFromSvg(codetheoremSvg);
    //     codetheoremIcon.name = "CODETHEOREM Icon";
    //     codetheoremIcon.resize(32, 32);
    //     logoSection.appendChild(codetheoremIcon);

    //     header.appendChild(logoSection);

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
    title.characters = "Color System";
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

    //     // Left side - Slate.Design Logo
    //     const tokensLeftBrand = figma.createFrame();
    //     tokensLeftBrand.layoutMode = 'HORIZONTAL';
    //     tokensLeftBrand.counterAxisAlignItems = 'CENTER';
    //     tokensLeftBrand.itemSpacing = 16;
    //     tokensLeftBrand.fills = [];

    //     // Logo SVG
    //     const tokensLogoSvg = `<svg width="224" height="41" viewBox="0 0 224 41" fill="none" xmlns="http://www.w3.org/2000/svg">
    // <path d="M20.3636 36.6678C20.3636 37.6519 19.5638 38.4588 18.5847 38.3606C15.6891 38.0701 12.899 37.0735 10.4643 35.4467C7.53415 33.4888 5.25036 30.706 3.90175 27.4501C2.55313 24.1943 2.20027 20.6117 2.88779 17.1553C3.57531 13.6989 5.27232 10.524 7.76426 8.03208C10.2561 5.54014 13.4311 3.84313 16.8874 3.15561C20.3438 2.46809 23.9265 2.82095 27.1823 4.16957C30.4382 5.51819 33.221 7.80197 35.1789 10.7322C36.8057 13.1669 37.8023 15.9569 38.0928 18.8525C38.191 19.8317 37.3841 20.6314 36.4 20.6314C35.4159 20.6314 34.6296 19.8306 34.5069 18.8542C34.2318 16.6647 33.4508 14.5604 32.2158 12.712C30.6495 10.3679 28.4233 8.54081 25.8186 7.46194C23.2139 6.38307 20.3478 6.10076 17.5827 6.65076C14.8176 7.2008 12.2776 8.55839 10.2841 10.5519C8.29057 12.5455 6.93298 15.0854 6.38294 17.8505C5.83294 20.6156 6.11524 23.4817 7.19412 26.0864C8.27299 28.6911 10.1001 30.9174 12.4442 32.4836C14.2925 33.7186 16.3968 34.4996 18.5864 34.7748C19.5628 34.8974 20.3636 35.6837 20.3636 36.6678Z" fill="#1350FF"/>
    // <path fill-rule="evenodd" clip-rule="evenodd" d="M31.3782 22.0784C30.8619 19.7816 27.6308 19.796 27.1342 22.0972L27.1153 22.185L27.0784 22.3554C26.5368 24.8151 24.5864 26.7026 22.1364 27.1348C19.7727 27.5519 19.7727 30.9933 22.1364 31.4104C24.595 31.8442 26.5504 33.7434 27.084 36.2157L27.1342 36.448C27.6308 38.7493 30.8619 38.7636 31.3782 36.4668L31.4392 36.1961C31.993 33.7326 33.9515 31.8473 36.406 31.4142C38.7737 30.9964 38.7737 27.5488 36.406 27.131C33.9645 26.7003 32.0139 24.8326 31.4481 22.3883C31.4323 22.32 31.4176 22.2547 31.4018 22.1836L31.3782 22.0784Z" fill="url(#paint0_linear_278_1424)"/>
    // <path d="M212.443 28.9857V16.3765H216.051V18.6735H216.198C216.344 18.3151 216.523 17.9811 216.734 17.6716C216.945 17.3621 217.197 17.0933 217.49 16.8652C217.799 16.6209 218.148 16.4335 218.538 16.3032C218.945 16.1566 219.4 16.0833 219.904 16.0833C220.505 16.0833 221.058 16.1891 221.562 16.4009C222.066 16.5964 222.497 16.8978 222.854 17.3051C223.211 17.7123 223.488 18.2092 223.683 18.7957C223.894 19.3822 224 20.0582 224 20.8239V28.9857H220.392V21.3126C220.392 19.6835 219.684 18.869 218.27 18.869C217.994 18.869 217.717 18.9097 217.441 18.9912C217.181 19.0563 216.945 19.1704 216.734 19.3333C216.523 19.4799 216.352 19.6673 216.222 19.8953C216.108 20.1234 216.051 20.3922 216.051 20.7017V28.9857H212.443Z" fill="white"/>
    // <path d="M210.453 30.2561C210.453 31.5919 209.892 32.5775 208.771 33.2129C207.649 33.8482 205.886 34.1659 203.48 34.1659C202.277 34.1659 201.285 34.0926 200.505 33.946C199.725 33.8156 199.099 33.6202 198.628 33.3595C198.173 33.0988 197.847 32.7893 197.652 32.4309C197.474 32.0725 197.384 31.6815 197.384 31.258C197.384 30.5412 197.595 29.9954 198.018 29.6207C198.441 29.2623 199.034 28.9854 199.798 28.7899V28.6433C199.262 28.4804 198.831 28.2523 198.505 27.9591C198.197 27.6495 198.042 27.2178 198.042 26.6639C198.042 26.0449 198.246 25.5887 198.652 25.2955C199.075 25.0023 199.627 24.7742 200.31 24.6113V24.4647C199.562 24.1063 198.977 23.6012 198.555 22.9496C198.148 22.298 197.945 21.5079 197.945 20.5793C197.945 19.8462 198.075 19.2027 198.335 18.6488C198.595 18.0786 198.961 17.6062 199.432 17.2315C199.92 16.8568 200.497 16.5717 201.163 16.3762C201.83 16.1807 202.577 16.083 203.406 16.083C204.203 16.083 204.943 16.1726 205.625 16.3518V15.6676C205.625 15.1789 205.796 14.7716 206.137 14.4458C206.479 14.1199 206.95 13.957 207.551 13.957H209.77V16.5962H206.747V16.8161C207.43 17.1745 207.958 17.6714 208.332 18.3067C208.722 18.9258 208.917 19.6833 208.917 20.5793C208.917 21.3124 208.787 21.9559 208.527 22.5098C208.267 23.0636 207.893 23.5361 207.405 23.9271C206.917 24.3018 206.332 24.5869 205.65 24.7823C204.983 24.9778 204.236 25.0756 203.406 25.0756C203.033 25.0756 202.675 25.0593 202.334 25.0267C201.993 24.9778 201.667 24.9127 201.359 24.8312C201.18 24.929 201.025 25.0511 200.895 25.1978C200.781 25.3444 200.725 25.5317 200.725 25.7598C200.725 25.9553 200.773 26.11 200.871 26.2241C200.968 26.3381 201.098 26.4277 201.261 26.4929C201.44 26.5418 201.643 26.5743 201.87 26.5906C202.098 26.6069 202.334 26.6151 202.577 26.6151H205.455C206.349 26.6151 207.113 26.7047 207.747 26.8839C208.381 27.0631 208.901 27.3156 209.307 27.6414C209.713 27.9672 210.006 28.35 210.185 28.7899C210.364 29.2298 210.453 29.7185 210.453 30.2561ZM207.04 30.5249C207.04 30.1991 206.909 29.9384 206.649 29.7429C206.389 29.5637 205.893 29.4741 205.162 29.4741H200.846C200.521 29.7511 200.359 30.0932 200.359 30.5005C200.359 30.8914 200.521 31.2091 200.846 31.4535C201.188 31.7141 201.757 31.8444 202.553 31.8444H204.674C205.503 31.8444 206.105 31.7304 206.479 31.5023C206.852 31.2743 207.04 30.9485 207.04 30.5249ZM203.406 22.7786C204.138 22.7786 204.666 22.5994 204.991 22.241C205.333 21.8826 205.503 21.4264 205.503 20.8725V20.286C205.503 19.7322 205.333 19.276 204.991 18.9176C204.666 18.5592 204.138 18.38 203.406 18.38C202.691 18.38 202.171 18.5592 201.846 18.9176C201.521 19.276 201.359 19.7322 201.359 20.286V20.8725C201.359 21.4264 201.521 21.8826 201.846 22.241C202.171 22.5994 202.691 22.7786 203.406 22.7786Z" fill="white"/>
    // <path d="M189.714 14.7638C188.901 14.7638 188.332 14.6009 188.007 14.2751C187.698 13.9329 187.543 13.5257 187.543 13.0532V12.3446C187.543 11.8559 187.698 11.4486 188.007 11.1228C188.332 10.7969 188.901 10.634 189.714 10.634C190.526 10.634 191.087 10.7969 191.396 11.1228C191.721 11.4486 191.884 11.8559 191.884 12.3446V13.0532C191.884 13.5257 191.721 13.9329 191.396 14.2751C191.087 14.6009 190.526 14.7638 189.714 14.7638ZM183.911 26.1756H187.909V19.1868H183.911V16.3766H191.518V26.1756H195.224V28.9857H183.911V26.1756Z" fill="white"/>
    // <path d="M174.167 29.2789C172.769 29.2789 171.55 29.0671 170.509 28.6435C169.486 28.22 168.714 27.6417 168.193 26.9086L170.217 25.027C170.705 25.5646 171.274 25.9881 171.924 26.2977C172.59 26.5909 173.346 26.7375 174.191 26.7375C174.907 26.7375 175.467 26.6316 175.874 26.4198C176.28 26.1918 176.483 25.8497 176.483 25.3935C176.483 25.0351 176.345 24.7907 176.069 24.6604C175.793 24.5138 175.41 24.3998 174.923 24.3183L172.899 24.0006C172.33 23.9192 171.802 23.797 171.314 23.6341C170.826 23.4549 170.404 23.2187 170.046 22.9254C169.689 22.6322 169.405 22.2738 169.193 21.8502C168.982 21.4267 168.876 20.9135 168.876 20.3107C168.876 18.9912 169.38 17.9567 170.388 17.2073C171.396 16.4579 172.81 16.0833 174.63 16.0833C175.866 16.0833 176.914 16.2543 177.776 16.5964C178.653 16.9222 179.352 17.3947 179.872 18.0137L178.068 20.0664C177.694 19.6591 177.215 19.317 176.63 19.0401C176.044 18.7631 175.337 18.6246 174.508 18.6246C173.11 18.6246 172.411 19.0482 172.411 19.8953C172.411 20.27 172.55 20.5307 172.826 20.6773C173.102 20.8076 173.484 20.9135 173.972 20.995L175.971 21.3126C176.54 21.3941 177.068 21.5244 177.556 21.7036C178.044 21.8665 178.466 22.0946 178.824 22.3878C179.198 22.6811 179.49 23.0395 179.702 23.463C179.913 23.8866 180.019 24.3998 180.019 25.0025C180.019 26.3221 179.507 27.3647 178.483 28.1304C177.475 28.8961 176.036 29.2789 174.167 29.2789Z" fill="white"/>
    // <path d="M160.035 29.2789C157.922 29.2789 156.321 28.6924 155.232 27.5195C154.143 26.3465 153.598 24.75 153.598 22.7299C153.598 21.7036 153.736 20.7832 154.013 19.9686C154.305 19.1378 154.712 18.4373 155.232 17.8671C155.768 17.2806 156.41 16.8408 157.158 16.5475C157.922 16.238 158.775 16.0833 159.718 16.0833C160.661 16.0833 161.506 16.238 162.254 16.5475C163.002 16.8408 163.636 17.2643 164.156 17.8182C164.676 18.3721 165.074 19.0482 165.35 19.8465C165.643 20.6284 165.789 21.5081 165.789 22.4856V23.5608H157.182V23.7807C157.182 24.5953 157.435 25.255 157.938 25.7601C158.442 26.2488 159.182 26.4931 160.157 26.4931C160.905 26.4931 161.547 26.3547 162.083 26.0777C162.62 25.7845 163.083 25.4017 163.473 24.9292L165.424 27.0552C164.936 27.6579 164.253 28.1793 163.375 28.6191C162.498 29.059 161.384 29.2789 160.035 29.2789ZM159.743 18.6735C158.962 18.6735 158.336 18.9179 157.865 19.4066C157.41 19.879 157.182 20.5225 157.182 21.3371V21.5326H162.254V21.3371C162.254 20.5062 162.027 19.8546 161.571 19.3822C161.132 18.9097 160.523 18.6735 159.743 18.6735Z" fill="white"/>
    // <path d="M139.32 11.929H144.806C147.098 11.929 148.796 12.662 149.902 14.1282C151.007 15.5944 151.56 17.7041 151.56 20.4572C151.56 23.2104 151.007 25.3201 149.902 26.7863C148.796 28.2524 147.098 28.9855 144.806 28.9855H139.32V11.929ZM144.562 26.102C145.651 26.102 146.447 25.7518 146.951 25.0513C147.455 24.3508 147.707 23.3326 147.707 21.9967V18.8933C147.707 17.5738 147.455 16.5637 146.951 15.8632C146.447 15.1627 145.651 14.8124 144.562 14.8124H142.928V26.102H144.562Z" fill="white"/>
    // <path d="M130.454 29.2789C129.544 29.2789 128.885 29.0834 128.479 28.6924C128.089 28.2852 127.894 27.8046 127.894 27.2507V26.3954C127.894 25.8415 128.089 25.3691 128.479 24.9781C128.885 24.5708 129.544 24.3672 130.454 24.3672C131.364 24.3672 132.014 24.5708 132.404 24.9781C132.811 25.3691 133.014 25.8415 133.014 26.3954V27.2507C133.014 27.8046 132.811 28.2852 132.404 28.6924C132.014 29.0834 131.364 29.2789 130.454 29.2789Z" fill="white"/>
    // <path d="M116.176 29.2789C114.063 29.2789 112.461 28.6924 111.372 27.5195C110.283 26.3465 109.739 24.75 109.739 22.7299C109.739 21.7036 109.877 20.7832 110.153 19.9686C110.446 19.1378 110.852 18.4373 111.372 17.8671C111.909 17.2806 112.551 16.8408 113.299 16.5475C114.063 16.238 114.916 16.0833 115.859 16.0833C116.802 16.0833 117.647 16.238 118.394 16.5475C119.142 16.8408 119.776 17.2643 120.296 17.8182C120.816 18.3721 121.215 19.0482 121.491 19.8465C121.784 20.6284 121.93 21.5081 121.93 22.4856V23.5608H113.323V23.7807C113.323 24.5953 113.575 25.255 114.079 25.7601C114.583 26.2488 115.323 26.4931 116.298 26.4931C117.045 26.4931 117.687 26.3547 118.224 26.0777C118.76 25.7845 119.223 25.4017 119.613 24.9292L121.564 27.0552C121.077 27.6579 120.394 28.1793 119.516 28.6191C118.638 29.059 117.525 29.2789 116.176 29.2789ZM115.883 18.6735C115.103 18.6735 114.477 18.9179 114.006 19.4066C113.55 19.879 113.323 20.5225 113.323 21.3371V21.5326H118.394V21.3371C118.394 20.5062 118.167 19.8546 117.712 19.3822C117.273 18.9097 116.663 18.6735 115.883 18.6735Z" fill="white"/>
    // <path d="M102.19 28.9855C100.889 28.9855 99.9222 28.6434 99.2883 27.9592C98.6544 27.275 98.3374 26.4034 98.3374 25.3445V19.1866H94.9238V16.3764H97.1426C97.6791 16.3764 98.0612 16.2705 98.2887 16.0587C98.5162 15.8469 98.63 15.4559 98.63 14.8858V11.929H101.946V16.3764H106.847V19.1866H101.946V26.1754H106.847V28.9855H102.19Z" fill="white"/>
    // <path d="M91.1545 28.9857C90.4068 28.9857 89.8051 28.7983 89.3501 28.4236C88.895 28.0326 88.6267 27.4787 88.5453 26.7619H88.4235C88.196 27.5928 87.7409 28.22 87.0583 28.6435C86.3916 29.0671 85.5708 29.2789 84.5956 29.2789C83.3764 29.2789 82.3928 28.9531 81.6451 28.3014C80.9138 27.6335 80.5481 26.7049 80.5481 25.5157C80.5481 24.1961 81.0275 23.2187 81.9864 22.5833C82.9457 21.948 84.3517 21.6303 86.2048 21.6303H88.2283V20.995C88.2283 20.2456 88.0494 19.6835 87.6922 19.3089C87.3509 18.9179 86.7656 18.7224 85.9365 18.7224C85.1724 18.7224 84.5549 18.869 84.0834 19.1622C83.6119 19.4555 83.2056 19.8383 82.8642 20.3107L80.8894 18.5513C81.3122 17.8345 81.9705 17.2481 82.8642 16.7919C83.7749 16.3195 84.9369 16.0833 86.3508 16.0833C88.0742 16.0833 89.4151 16.4824 90.374 17.2806C91.3492 18.0626 91.8371 19.2518 91.8371 20.8483V26.371H93.2267V28.9857H91.1545ZM85.9608 26.9086C86.5948 26.9086 87.1313 26.7538 87.57 26.4443C88.0092 26.1347 88.2283 25.6867 88.2283 25.1003V23.5852H86.3022C84.8231 23.5852 84.0834 24.0821 84.0834 25.0758V25.5646C84.0834 26.0044 84.2543 26.3384 84.5956 26.5665C84.9369 26.7945 85.392 26.9086 85.9608 26.9086Z" fill="white"/>
    // <path d="M66.3181 26.1753H70.1704V13.7128H66.3181V10.9026H73.7792V26.1753H77.6314V28.9855H66.3181V26.1753Z" fill="white"/>
    // <path d="M57.0869 29.2786C55.6565 29.2786 54.413 29.0423 53.3563 28.5699C52.3001 28.0975 51.4466 27.454 50.7963 26.6394L52.9176 24.2935C53.5352 24.9778 54.2098 25.4828 54.9411 25.8086C55.6888 26.1344 56.445 26.2973 57.209 26.2973C58.0864 26.2973 58.7531 26.1018 59.2082 25.7108C59.6633 25.3199 59.8908 24.7578 59.8908 24.0247C59.8908 23.422 59.712 22.9658 59.3543 22.6563C59.013 22.3468 58.4282 22.1268 57.599 21.9965L55.819 21.7033C54.2913 21.4426 53.1859 20.8806 52.5033 20.0172C51.8202 19.1375 51.4789 18.0704 51.4789 16.816C51.4789 15.1706 52.0154 13.8999 53.0885 13.0039C54.1611 12.0916 55.6645 11.6355 57.599 11.6355C58.9156 11.6355 60.0617 11.8391 61.037 12.2464C62.0122 12.6537 62.8006 13.2076 63.4018 13.9081L61.3296 16.2295C60.8745 15.7245 60.338 15.3335 59.7204 15.0566C59.1024 14.7634 58.4034 14.6167 57.6234 14.6167C55.9815 14.6167 55.1607 15.2928 55.1607 16.645C55.1607 17.2314 55.3396 17.6713 55.6973 17.9645C56.0709 18.2578 56.6725 18.4777 57.5017 18.6243L59.2813 18.942C60.6629 19.1863 61.7276 19.7076 62.4753 20.5059C63.2229 21.3042 63.597 22.3794 63.597 23.7315C63.597 24.5298 63.4589 25.271 63.1827 25.9552C62.906 26.6231 62.4916 27.2096 61.9392 27.7146C61.3862 28.2034 60.7036 28.5862 59.8908 28.8631C59.0944 29.1401 58.1599 29.2786 57.0869 29.2786Z" fill="white"/>
    // <defs>
    // <linearGradient id="paint0_linear_278_1424" x1="29.2727" y1="18.3171" x2="29.2727" y2="40.2281" gradientUnits="userSpaceOnUse">
    // <stop stop-color="#D54BF6"/>
    // <stop offset="1" stop-color="#4B10D1"/>
    // </linearGradient>
    // </defs>
    // </svg>
    // `;

    //     const tokensLogoIcon = figma.createNodeFromSvg(tokensLogoSvg);
    //     tokensLogoIcon.name = "Logo Icon";
    //     tokensLogoIcon.resize(224, 38);
    //     tokensLeftBrand.appendChild(tokensLogoIcon);

    //     // const tokensLogoText = figma.createText();
    //     // tokensLogoText.fontName = { family: "Roboto", style: "Bold" };
    //     // tokensLogoText.fontSize = 28;
    //     // tokensLogoText.characters = "Slate.Design";
    //     // tokensLogoText.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
    //     // tokensLeftBrand.appendChild(tokensLogoText);

    //     tokensTopBar.appendChild(tokensLeftBrand);

    //     // Right side - CODETHEOREM Logo
    //     const tokensRightBrand = figma.createFrame();
    //     tokensRightBrand.layoutMode = 'HORIZONTAL';
    //     tokensRightBrand.counterAxisAlignItems = 'CENTER';
    //     tokensRightBrand.itemSpacing = 12;
    //     tokensRightBrand.fills = [];

    //     // "Created by" text
    //     const tokensCreatedByText = figma.createText();
    //     tokensCreatedByText.fontName = { family: "Roboto", style: "Regular" };
    //     tokensCreatedByText.fontSize = 13;
    //     tokensCreatedByText.characters = "Created by";
    //     tokensCreatedByText.fills = [{ type: 'SOLID', color: { r: 0.7, g: 0.75, b: 0.85 }, opacity: 0.8 }];
    //     tokensRightBrand.appendChild(tokensCreatedByText);

    //     // CODETHEOREM Logo SVG
    //     const tokensCodetheoremSvg = `<svg width="224" height="32" viewBox="0 0 224 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    // <g clip-path="url(#clip0_278_1439)">
    // <path d="M48.0094 22.9611C46.7649 22.2683 45.7825 21.3116 45.062 20.124C44.3416 18.9034 43.9813 17.5508 43.9813 16.0333C43.9813 14.5158 44.3416 13.1632 45.062 11.9426C45.7825 10.7219 46.7649 9.79823 48.0094 9.10544C49.2538 8.41266 50.662 8.08276 52.234 8.08276C53.4784 8.08276 54.6573 8.31369 55.6725 8.74256C56.7205 9.17142 57.6047 9.83122 58.3252 10.656L56.4913 12.4044C55.3778 11.1838 54.0024 10.59 52.3649 10.59C51.317 10.59 50.3673 10.8209 49.5158 11.2828C48.6644 11.7446 48.0421 12.4044 47.5509 13.2292C47.0924 14.0539 46.8632 14.9776 46.8632 16.0333C46.8632 17.0889 47.0924 18.0127 47.5509 18.8374C48.0094 19.6621 48.6644 20.3219 49.5158 20.7838C50.3673 21.2456 51.2842 21.4766 52.3649 21.4766C54.0024 21.4766 55.3778 20.8498 56.4913 19.6292L58.3252 21.4106C57.6047 22.2683 56.7205 22.8951 55.6725 23.324C54.6246 23.7529 53.4784 23.9838 52.2012 23.9838C50.662 23.9838 49.2538 23.6209 48.0094 22.9611Z" fill="white"/>
    // <path d="M63.6959 22.9609C62.4515 22.2681 61.4363 21.3114 60.7158 20.0908C59.9954 18.8702 59.6351 17.5176 59.6351 16.0001C59.6351 14.4826 59.9954 13.13 60.7158 11.9094C61.4363 10.6888 62.4188 9.73207 63.6959 9.03928C64.9404 8.3465 66.3813 8.0166 67.9533 8.0166C69.5252 8.0166 70.9334 8.3465 72.2106 9.03928C73.455 9.73207 74.4702 10.6888 75.1907 11.8764C75.9112 13.097 76.2714 14.4496 76.2714 15.9671C76.2714 17.4846 75.9112 18.8372 75.1907 20.0578C74.4702 21.2785 73.4878 22.2022 72.2106 22.895C70.9661 23.5877 69.5252 23.9176 67.9533 23.9176C66.3813 23.9836 64.9404 23.6207 63.6959 22.9609ZM70.7041 20.7506C71.5228 20.2888 72.1778 19.629 72.6363 18.8042C73.0948 17.9795 73.324 17.0228 73.324 16.0001C73.324 14.9774 73.0948 14.0207 72.6363 13.196C72.1778 12.3712 71.5228 11.7114 70.7041 11.2496C69.8854 10.7877 68.9685 10.5568 67.9205 10.5568C66.9053 10.5568 65.9556 10.7877 65.1369 11.2496C64.3182 11.7114 63.6632 12.3712 63.2047 13.196C62.7462 14.0207 62.517 14.9774 62.517 16.0001C62.517 17.0228 62.7462 17.9795 63.2047 18.8042C63.6632 19.629 64.3182 20.2888 65.1369 20.7506C65.9556 21.2125 66.8726 21.4434 67.9205 21.4434C68.9685 21.4434 69.8854 21.2125 70.7041 20.7506Z" fill="white"/>
    // <path d="M79.2515 8.24756H85.9649C87.6023 8.24756 89.076 8.57746 90.3532 9.20426C91.6304 9.83106 92.6129 10.7548 93.3333 11.9424C94.0211 13.13 94.3813 14.4826 94.3813 16.0001C94.3813 17.5507 94.0211 18.9032 93.3333 20.0579C92.6456 21.2455 91.6304 22.1362 90.3532 22.796C89.076 23.4228 87.6351 23.7527 85.9977 23.7527H79.2515V8.24756ZM85.8339 21.3115C86.9474 21.3115 87.9626 21.0805 88.814 20.6517C89.6655 20.2228 90.3205 19.596 90.779 18.8043C91.2374 18.0125 91.4667 17.0558 91.4667 16.0001C91.4667 14.9445 91.2374 13.9878 90.779 13.196C90.3205 12.4043 89.6655 11.7775 88.814 11.3486C87.9626 10.9197 86.9474 10.6888 85.8339 10.6888H82.1006V21.3115H85.8339Z" fill="white"/>
    // <path d="M108.954 21.3445V23.7527H97.4269V8.24756H108.66V10.6558H100.276V14.6805H107.71V17.0558H100.276V21.3445H108.954Z" fill="white"/>
    // <path d="M115.275 10.6888H110.166V8.24756H123.233V10.6888H118.124V23.7527H115.275V10.6888Z" fill="white"/>
    // <path d="M139.05 8.24756V23.7527H136.201V17.1218H128.243V23.7527H125.394V8.24756H128.243V14.6476H136.201V8.24756H139.05Z" fill="white"/>
    // <path d="M154.704 21.3445V23.7527H143.177V8.24756H154.41V10.6558H146.026V14.6805H153.46V17.0558H146.026V21.3445H154.704Z" fill="white"/>
    // <path d="M160.795 22.9609C159.551 22.2681 158.536 21.3114 157.815 20.0908C157.095 18.8702 156.735 17.5176 156.735 16.0001C156.735 14.4826 157.095 13.13 157.815 11.9094C158.536 10.6888 159.518 9.73207 160.795 9.03928C162.073 8.3465 163.481 8.0166 165.053 8.0166C166.625 8.0166 168.033 8.3465 169.31 9.03928C170.554 9.73207 171.57 10.6888 172.29 11.8764C173.011 13.097 173.371 14.4496 173.371 15.9671C173.371 17.4846 173.011 18.8372 172.29 20.0578C171.57 21.2785 170.587 22.2022 169.31 22.895C168.066 23.5877 166.625 23.9176 165.053 23.9176C163.448 23.9836 162.04 23.6207 160.795 22.9609ZM167.804 20.7506C168.622 20.2888 169.277 19.629 169.736 18.8042C170.194 17.9795 170.423 17.0228 170.423 16.0001C170.423 14.9774 170.194 14.0207 169.736 13.196C169.277 12.3712 168.622 11.7114 167.804 11.2496C166.985 10.7877 166.068 10.5568 165.02 10.5568C164.005 10.5568 163.055 10.7877 162.236 11.2496C161.418 11.7114 160.763 12.3712 160.304 13.196C159.846 14.0207 159.616 14.9774 159.616 16.0001C159.616 17.0228 159.846 17.9795 160.304 18.8042C160.763 19.629 161.418 20.2888 162.236 20.7506C163.055 21.2125 163.972 21.4434 165.02 21.4434C166.068 21.4434 166.985 21.2125 167.804 20.7506Z" fill="white"/>
    // <path d="M186.405 23.7527L183.261 19.2001C183.13 19.2001 182.933 19.2331 182.671 19.2331H179.2V23.7527H176.351V8.24756H182.671C184.014 8.24756 185.16 8.47849 186.143 8.90735C187.125 9.33622 187.878 9.99601 188.402 10.8208C188.926 11.6455 189.188 12.6352 189.188 13.7568C189.188 14.9115 188.894 15.9342 188.337 16.7589C187.78 17.6166 186.961 18.2434 185.913 18.6393L189.483 23.7527H186.405ZM185.389 11.4805C184.734 10.9527 183.785 10.6888 182.54 10.6888H179.2V16.8579H182.54C183.785 16.8579 184.734 16.594 185.389 16.0331C186.044 15.5053 186.372 14.7465 186.372 13.7568C186.339 12.7671 186.044 12.0084 185.389 11.4805Z" fill="white"/>
    // <path d="M203.958 21.3445V23.7527H192.43V8.24756H203.663V10.6558H195.279V14.6805H202.713V17.0558H195.279V21.3445H203.958Z" fill="white"/>
    // <path d="M221.282 23.7527L221.249 13.4929L216.206 22.0043H214.929L209.885 13.6249V23.7527H207.167V8.24756H209.525L215.649 18.5074L221.609 8.24756H223.967L224 23.7527H221.282Z" fill="white"/>
    // <path d="M34.1895 24.7424H1.83395C0.327519 24.7424 -0.523943 23.0269 0.393016 21.8063L16.0141 1.02282C17.062 -0.362749 19.1252 -0.362749 20.1404 1.02282L35.6632 21.7733C36.5474 22.994 35.6959 24.7424 34.1895 24.7424Z" fill="url(#paint0_linear_278_1439)"/>
    // <path d="M4.15898 28.7672L16.7672 12.0415C17.5859 10.9528 19.1906 10.9858 19.9765 12.0415L32.4865 28.7672C33.4689 30.1198 32.552 32.0002 30.8818 32.0002H5.76366C4.09348 32.0002 3.14378 30.0868 4.15898 28.7672Z" fill="url(#paint1_linear_278_1439)"/>
    // <path d="M29.4408 24.7426L19.9765 12.0416C19.1578 10.9529 17.5859 10.9529 16.7672 12.0416L7.20459 24.7426H29.4408Z" fill="#6699FF"/>
    // </g>
    // <defs>
    // <linearGradient id="paint0_linear_278_1439" x1="0.0141602" y1="12.363" x2="36.0214" y2="12.363" gradientUnits="userSpaceOnUse">
    // <stop stop-color="#3F71FF"/>
    // <stop offset="1" stop-color="#6A73FF"/>
    // </linearGradient>
    // <linearGradient id="paint1_linear_278_1439" x1="3.74097" y1="21.6188" x2="32.8902" y2="21.6188" gradientUnits="userSpaceOnUse">
    // <stop stop-color="#3F71FF"/>
    // <stop offset="1" stop-color="#6A73FF"/>
    // </linearGradient>
    // <clipPath id="clip0_278_1439">
    // <rect width="224" height="32" fill="white"/>
    // </clipPath>
    // </defs>
    // </svg>
    // `;

    //     const tokensCodetheoremIcon = figma.createNodeFromSvg(tokensCodetheoremSvg);
    //     tokensCodetheoremIcon.name = "CODETHEOREM Icon";
    //     tokensCodetheoremIcon.resize(224, 38);
    //     tokensRightBrand.appendChild(tokensCodetheoremIcon);

    //     // // CODETHEOREM Text
    //     // const tokensCodetheoremText = figma.createText();
    //     // tokensCodetheoremText.fontName = { family: "Roboto", style: "Bold" };
    //     // tokensCodetheoremText.fontSize = 18;
    //     // tokensCodetheoremText.characters = "CODETHEOREM";
    //     // tokensCodetheoremText.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
    //     // tokensCodetheoremText.letterSpacing = { value: 1, unit: 'PIXELS' };
    //     // tokensRightBrand.appendChild(tokensCodetheoremText);

    //     tokensTopBar.appendChild(tokensRightBrand);

    //     tokensHeader.appendChild(tokensTopBar);

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
