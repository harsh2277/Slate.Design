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
    figma.notify('👋 Bye Bye! Thanks for using Slate.Design', { timeout: 3000 });
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
    await figma.loadFontAsync({ family: "Inter", style: "Medium" });
    await figma.loadFontAsync({ family: "Inter", style: "Bold" });
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });

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
                text.fontName = { family: "Inter", style: "Medium" };
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
    titleText.fontName = { family: "Inter", style: "Bold" };
    titleText.fontSize = 28;
    titleText.characters = "Button Component";
    titleText.fills = [{ type: 'SOLID', color: { r: 0.1, g: 0.1, b: 0.1 } }];
    titleFrame.appendChild(titleText);

    const subtitleText = figma.createText();
    subtitleText.fontName = { family: "Inter", style: "Regular" };
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
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
    await figma.loadFontAsync({ family: "Inter", style: "Medium" });
    await figma.loadFontAsync({ family: "Inter", style: "Bold" });

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
            label.fontName = { family: "Inter", style: "Medium" };
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
                    digitText.fontName = { family: "Inter", style: "Medium" };
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
                text.fontName = { family: "Inter", style: "Regular" };
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
                errorMsg.fontName = { family: "Inter", style: "Regular" };
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
    titleText.fontName = { family: "Inter", style: "Bold" };
    titleText.fontSize = 28;
    titleText.characters = "Input Component";
    titleText.fills = [{ type: 'SOLID', color: { r: 0.1, g: 0.1, b: 0.1 } }];
    titleFrame.appendChild(titleText);

    const subtitleText = figma.createText();
    subtitleText.fontName = { family: "Inter", style: "Regular" };
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
            await figma.loadFontAsync({ family: "Inter", style: "Bold" });
            await figma.loadFontAsync({ family: "Inter", style: "Regular" });

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
            heading.fontName = { family: "Inter", style: "Bold" };
            heading.fontSize = 24;
            heading.characters = `${library.name} / ${category.name}`;
            heading.fills = [{ type: 'SOLID', color: { r: 0.1, g: 0.1, b: 0.1 } }];

            const subheading = figma.createText();
            subheading.fontName = { family: "Inter", style: "Regular" };
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

        await figma.loadFontAsync({ family: "Inter", style: "Bold" });
        await figma.loadFontAsync({ family: "Inter", style: "Regular" });

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
                heading.fontName = { family: "Inter", style: "Bold" };
                heading.fontSize = 24;
                heading.characters = `${library.name} / ${categoryName}`;
                heading.fills = [{ type: 'SOLID', color: { r: 0.1, g: 0.1, b: 0.1 } }];

                const subheading = figma.createText();
                subheading.fontName = { family: "Inter", style: "Regular" };
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
            if (!msg.colors) throw new Error('No color data received');

            // Get or create variable collection
            const collections = await figma.variables.getLocalVariableCollectionsAsync();
            let collection = collections.find(c => c.name === 'Design System Tokens');

            if (collection) {
                if (!collection.modes.some(mode => mode.name === 'Dark')) {
                    collection.addMode('Dark');
                }
            } else {
                collection = figma.variables.createVariableCollection('Colors');
                collection.renameMode(collection.modes[0].modeId, 'Light');
                collection.addMode('Dark');
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
                return;
            }

            // Create documentation frame
            await createTokenDocumentation(colors, msg, createdCount, spacingCount, paddingCount, radiusCount, strokeCount, shadowCount, gridCount);

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
    await figma.loadFontAsync({ family: "Inter", style: "Bold" });
    await figma.loadFontAsync({ family: "Inter", style: "Semi Bold" });
    await figma.loadFontAsync({ family: "Inter", style: "Medium" });
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });

    const frame = figma.createFrame();
    frame.name = "Design System Tokens";
    frame.fills = [{ type: 'SOLID', color: { r: 0.96, g: 0.96, b: 0.97 } }];
    frame.layoutMode = 'VERTICAL';
    frame.primaryAxisSizingMode = 'AUTO';
    frame.counterAxisSizingMode = 'AUTO';
    frame.itemSpacing = 48;
    frame.paddingLeft = 80;
    frame.paddingRight = 80;
    frame.paddingTop = 72;
    frame.paddingBottom = 72;

    // Header
    const headerFrame = figma.createFrame();
    headerFrame.name = "Header";
    headerFrame.fills = [];
    headerFrame.layoutMode = 'VERTICAL';
    headerFrame.primaryAxisSizingMode = 'AUTO';
    headerFrame.counterAxisSizingMode = 'AUTO';
    headerFrame.itemSpacing = 20;

    const titleContainer = figma.createFrame();
    titleContainer.name = "Title Container";
    titleContainer.fills = [];
    titleContainer.layoutMode = 'VERTICAL';
    titleContainer.primaryAxisSizingMode = 'AUTO';
    titleContainer.counterAxisSizingMode = 'AUTO';
    titleContainer.itemSpacing = 8;

    const title = figma.createText();
    title.fontName = { family: "Inter", style: "Bold" };
    title.fontSize = 40;
    title.characters = "Design System Tokens";
    title.fills = [{ type: 'SOLID', color: { r: 0.08, g: 0.08, b: 0.08 } }];
    title.letterSpacing = { value: -1.2, unit: "PIXELS" };
    titleContainer.appendChild(title);

    const subtitle = figma.createText();
    subtitle.fontName = { family: "Inter", style: "Regular" };
    subtitle.fontSize = 14;
    const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    subtitle.characters = `Generated on ${date} • Complete token documentation`;
    subtitle.fills = [{ type: 'SOLID', color: { r: 0.45, g: 0.45, b: 0.47 } }];
    titleContainer.appendChild(subtitle);

    headerFrame.appendChild(titleContainer);

    // Stats row
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
        { label: 'Shadows', value: shadowCount },
        { label: 'Grids', value: gridCount }
    ];

    for (const stat of stats) {
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
        valueText.fontName = { family: "Inter", style: "Bold" };
        valueText.fontSize = 24;
        safeSetCharacters(valueText, `${stat.value}`);
        valueText.fills = [{ type: 'SOLID', color: { r: 0.08, g: 0.08, b: 0.08 } }];
        statItem.appendChild(valueText);

        const labelText = figma.createText();
        labelText.fontName = { family: "Inter", style: "Medium" };
        labelText.fontSize = 11;
        labelText.characters = stat.label.toUpperCase();
        labelText.fills = [{ type: 'SOLID', color: { r: 0.55, g: 0.55, b: 0.57 } }];
        labelText.letterSpacing = { value: 0.5, unit: "PIXELS" };
        statItem.appendChild(labelText);

        statsRow.appendChild(statItem);
    }

    headerFrame.appendChild(statsRow);
    frame.appendChild(headerFrame);

    // Color sections
    const colorCategories = ['primary', 'secondary', 'success', 'error', 'warning', 'info', 'neutral'];
    for (const cat of colorCategories) {
        let colorData = null;
        if (cat === 'primary' || cat === 'secondary' || cat === 'neutral') {
            if (colors[cat] && colors[cat].light) colorData = colors[cat].light;
        } else {
            if (colors[cat]) colorData = colors[cat];
        }

        if (colorData && Object.keys(colorData).length > 0) {
            createColorSection(cat.charAt(0).toUpperCase() + cat.slice(1), colorData, frame);
        }
    }

    // Spacing/Padding/Radius sections
    if (msg.spacing && Object.keys(msg.spacing).length > 0) {
        createTokenSection("Spacing", msg.spacing, frame);
    }
    if (msg.padding && Object.keys(msg.padding).length > 0) {
        createTokenSection("Padding", msg.padding, frame);
    }
    if (msg.radius && Object.keys(msg.radius).length > 0) {
        createTokenSection("Radius", msg.radius, frame);
    }

    figma.currentPage.appendChild(frame);
    figma.viewport.scrollAndZoomIntoView([frame]);
}

function createColorSection(name, colorData, parent) {
    const section = figma.createFrame();
    section.name = name;
    section.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
    section.cornerRadius = 12;
    section.strokes = [{ type: 'SOLID', color: { r: 0.88, g: 0.88, b: 0.89 } }];
    section.strokeWeight = 1.5;
    section.layoutMode = 'VERTICAL';
    section.primaryAxisSizingMode = 'AUTO';
    section.counterAxisSizingMode = 'AUTO';
    section.itemSpacing = 20;
    section.paddingLeft = 28;
    section.paddingRight = 28;
    section.paddingTop = 24;
    section.paddingBottom = 24;

    const sectionTitle = figma.createText();
    sectionTitle.fontName = { family: "Inter", style: "Semi Bold" };
    sectionTitle.fontSize = 16;
    sectionTitle.characters = name;
    sectionTitle.fills = [{ type: 'SOLID', color: { r: 0.15, g: 0.15, b: 0.15 } }];
    section.appendChild(sectionTitle);

    const colorGrid = figma.createFrame();
    colorGrid.name = "Grid";
    colorGrid.fills = [];
    colorGrid.layoutMode = 'HORIZONTAL';
    colorGrid.primaryAxisSizingMode = 'AUTO';
    colorGrid.counterAxisSizingMode = 'AUTO';
    colorGrid.itemSpacing = 12;
    colorGrid.layoutWrap = 'WRAP';

    for (const [shadeName, hexColor] of Object.entries(colorData)) {
        const colorCard = figma.createFrame();
        colorCard.name = shadeName;
        colorCard.fills = [];
        colorCard.layoutMode = 'VERTICAL';
        colorCard.primaryAxisSizingMode = 'AUTO';
        colorCard.counterAxisSizingMode = 'FIXED';
        colorCard.itemSpacing = 10;
        colorCard.resize(110, 140);

        const swatch = figma.createFrame();
        swatch.name = "Swatch";
        swatch.resize(110, 88);
        swatch.fills = [{ type: 'SOLID', color: hexToRgb(hexColor) }];
        swatch.cornerRadius = 8;
        swatch.strokes = [{ type: 'SOLID', color: { r: 0.88, g: 0.88, b: 0.89 } }];
        swatch.strokeWeight = 1;
        colorCard.appendChild(swatch);

        const infoContainer = figma.createFrame();
        infoContainer.name = "Info";
        infoContainer.fills = [];
        infoContainer.layoutMode = 'VERTICAL';
        infoContainer.primaryAxisSizingMode = 'AUTO';
        infoContainer.counterAxisSizingMode = 'FIXED';
        infoContainer.itemSpacing = 2;
        infoContainer.resize(110, 40);

        const nameText = figma.createText();
        nameText.fontName = { family: "Inter", style: "Semi Bold" };
        nameText.fontSize = 12;
        nameText.characters = shadeName.split('-')[1] || shadeName;
        nameText.fills = [{ type: 'SOLID', color: { r: 0.15, g: 0.15, b: 0.15 } }];
        infoContainer.appendChild(nameText);

        const hexText = figma.createText();
        hexText.fontName = { family: "Inter", style: "Regular" };
        hexText.fontSize = 11;
        hexText.characters = hexColor.toUpperCase();
        hexText.fills = [{ type: 'SOLID', color: { r: 0.55, g: 0.55, b: 0.57 } }];
        infoContainer.appendChild(hexText);

        colorCard.appendChild(infoContainer);
        colorGrid.appendChild(colorCard);
    }

    section.appendChild(colorGrid);
    parent.appendChild(section);
}

function createTokenSection(name, tokenData, parent) {
    const section = figma.createFrame();
    section.name = `${name} Tokens`;
    section.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
    section.strokes = [{ type: 'SOLID', color: { r: 0.88, g: 0.88, b: 0.89 } }];
    section.strokeWeight = 1.5;
    section.cornerRadius = 12;
    section.layoutMode = 'HORIZONTAL';
    section.primaryAxisSizingMode = 'AUTO';
    section.counterAxisSizingMode = 'AUTO';
    section.itemSpacing = 16;
    section.paddingLeft = 28;
    section.paddingRight = 28;
    section.paddingTop = 28;
    section.paddingBottom = 28;
    section.layoutWrap = 'WRAP';

    for (const [tokenName, valueData] of Object.entries(tokenData)) {
        if (!tokenName || tokenName.trim() === '') continue;

        const displayValue = typeof valueData === 'object' ? valueData.desktop : valueData;
        if (displayValue === undefined || displayValue === null) continue;

        const tokenCard = figma.createFrame();
        tokenCard.name = tokenName;
        tokenCard.resize(100, 110);
        tokenCard.fills = [{ type: 'SOLID', color: { r: 0.98, g: 0.98, b: 0.99 } }];
        tokenCard.cornerRadius = name === 'Radius' ? Math.min(displayValue, 24) : 8;
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
        nameText.fontName = { family: "Inter", style: "Medium" };
        nameText.fontSize = 10;
        safeSetCharacters(nameText, tokenName.toUpperCase());
        nameText.fills = [{ type: 'SOLID', color: { r: 0.55, g: 0.55, b: 0.57 } }];
        nameText.letterSpacing = { value: 0.4, unit: "PIXELS" };
        tokenCard.appendChild(nameText);

        const valueText = figma.createText();
        valueText.fontName = { family: "Inter", style: "Bold" };
        valueText.fontSize = 28;
        safeSetCharacters(valueText, `${displayValue}`);
        valueText.fills = [{ type: 'SOLID', color: { r: 0.08, g: 0.08, b: 0.08 } }];
        valueText.letterSpacing = { value: -0.5, unit: "PIXELS" };
        tokenCard.appendChild(valueText);

        const unitText = figma.createText();
        unitText.fontName = { family: "Inter", style: "Regular" };
        unitText.fontSize = 10;
        safeSetCharacters(unitText, "px");
        unitText.fills = [{ type: 'SOLID', color: { r: 0.63, g: 0.63, b: 0.63 } }];
        tokenCard.appendChild(unitText);

        section.appendChild(tokenCard);
    }

    parent.appendChild(section);
}

// ============================================
// TOKEN DOCUMENTATION - END
// ============================================


// ============================================
// TYPOGRAPHY SYSTEM - START
// ============================================

async function createTypographySystem(typography) {
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
    await figma.loadFontAsync({ family: "Inter", style: "Medium" });
    await figma.loadFontAsync({ family: "Inter", style: "Semi Bold" });
    await figma.loadFontAsync({ family: "Inter", style: "Bold" });

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

    for (const [key, style] of Object.entries(typography.styles)) {
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
        letterSpacingVar.setValueForMode(desktopModeId, style.letterSpacing);
        letterSpacingVar.setValueForMode(mobileModeId, style.letterSpacing);

        typographyVariables[key] = { size: sizeVar, letterSpacing: letterSpacingVar, lineHeight: style.lineHeight };
    }

    // Find best matching font
    const availableFonts = await figma.listAvailableFontsAsync();

    function findBestFont(fontFamily, weight) {
        let matchingFonts = availableFonts.filter(f => f.fontName.family === fontFamily);
        if (matchingFonts.length === 0) {
            matchingFonts = availableFonts.filter(f => f.fontName.family.toLowerCase() === fontFamily.toLowerCase());
        }
        if (matchingFonts.length === 0) {
            matchingFonts = availableFonts.filter(f => f.fontName.family === 'Inter');
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
        return font ? font.fontName : { family: 'Inter', style: 'Regular' };
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
        for (const weight of weights) {
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
            textStyle.lineHeight = { value: style.lineHeight * 100, unit: 'PERCENT' };
            textStyle.letterSpacing = { value: style.letterSpacing, unit: 'PIXELS' };

            if (typographyVariables[key]) {
                try {
                    textStyle.setBoundVariable('fontSize', typographyVariables[key].size);
                    textStyle.setBoundVariable('letterSpacing', typographyVariables[key].letterSpacing);
                } catch (e) { }
            }

            createdStylesCount++;
        }
    }

    // Create text styles for SECONDARY font
    if (typography.secondaryEnabled && typography.secondaryFont) {
        for (const [key, style] of Object.entries(typography.styles)) {
            for (const weight of weights) {
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
                textStyle.lineHeight = { value: style.lineHeight * 100, unit: 'PERCENT' };
                textStyle.letterSpacing = { value: style.letterSpacing, unit: 'PIXELS' };

                if (typographyVariables[key]) {
                    try {
                        textStyle.setBoundVariable('fontSize', typographyVariables[key].size);
                        textStyle.setBoundVariable('letterSpacing', typographyVariables[key].letterSpacing);
                    } catch (e) { }
                }

                createdStylesCount++;
            }
        }
    }

    // Create typography documentation
    await createTypographyDocumentation(typography, findBestFont);

    figma.notify(`✅ Created ${createdStylesCount} text styles!`);
}

async function createTypographyDocumentation(typography, findBestFont) {
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
    titleText.fontName = { family: "Inter", style: "Bold" };
    safeSetCharacters(titleText, "Typography System");
    titleText.fontSize = 32;
    titleText.fills = [{ type: 'SOLID', color: { r: 0.08, g: 0.08, b: 0.08 } }];
    header.appendChild(titleText);

    const categories = Object.keys(typography.styles);
    const subtitleText = figma.createText();
    subtitleText.fontName = { family: "Inter", style: "Regular" };
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
        categoryLabel.fontName = { family: "Inter", style: "Semi Bold" };
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
        previewText.lineHeight = { value: styleData.lineHeight * 100, unit: 'PERCENT' };
        previewText.letterSpacing = { value: styleData.letterSpacing, unit: 'PIXELS' };
        card.appendChild(previewText);

        // Specs
        const specsText = figma.createText();
        specsText.fontName = { family: "Inter", style: "Regular" };
        const mobileSize = Math.round(styleData.size * 0.85);
        safeSetCharacters(specsText, `Desktop: ${styleData.size}px • Mobile: ${mobileSize}px • Line Height: ${Math.round(styleData.lineHeight * 100)}%`);
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
