#!/usr/bin/env node

/**
 * Script to generate Icon.js with all Vuesax icons from the Icons folder
 * Run this script with: node generate-icon-data.js
 */

const fs = require('fs');
const path = require('path');

// Path to the Vuesax icons folder
const VUESAX_BOLD_PATH = path.join(__dirname, 'Icons', 'Vuesax Icon', 'bold');
const VUESAX_OUTLINE_PATH = path.join(__dirname, 'Icons', 'Vuesax Icon', 'outline');
const OUTPUT_FILE = path.join(__dirname, 'Icon.js');

console.log('🔍 Reading Vuesax icons...');

// Read all SVG files from a folder
function readIconsFromFolder(folderPath, categoryName) {
    const icons = [];
    
    try {
        if (!fs.existsSync(folderPath)) {
            console.warn(`⚠️  Folder not found: ${folderPath}`);
            return icons;
        }
        
        const files = fs.readdirSync(folderPath);
        
        for (const file of files) {
            if (file.endsWith('.svg')) {
                const filePath = path.join(folderPath, file);
                const content = fs.readFileSync(filePath, 'utf-8');
                
                icons.push({
                    name: file,
                    content: content
                });
            }
        }
        
        console.log(`✅ Found ${icons.length} ${categoryName} icons`);
        return icons;
    } catch (error) {
        console.error(`❌ Error reading ${categoryName} icons:`, error.message);
        return [];
    }
}

// Generate the Icon.js file
function generateIconData() {
    const boldIcons = readIconsFromFolder(VUESAX_BOLD_PATH, 'Bold');
    const outlineIcons = readIconsFromFolder(VUESAX_OUTLINE_PATH, 'Outline');
    
    if (boldIcons.length === 0 && outlineIcons.length === 0) {
        console.error('❌ No icons found. Make sure the Icons/Vuesax Icon/ folder exists with bold and outline subfolders.');
        process.exit(1);
    }
    
    // Create the data structure
    const categories = {};
    
    if (boldIcons.length > 0) {
        categories["Bold"] = boldIcons;
    }
    
    if (outlineIcons.length > 0) {
        categories["Outline"] = outlineIcons;
    }
    
    const iconData = {
        vuesax: {
            name: "Vuesax",
            categories: categories
        }
    };
    
    // Generate the JavaScript file content
    const fileContent = `// Auto-generated icon data - DO NOT EDIT MANUALLY
// Generated on ${new Date().toISOString()}

const ICON_DATA = ${JSON.stringify(iconData, null, 2)};

// Export for use in Figma plugin UI
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ICON_DATA;
}
`;
    
    // Write to Icon.js
    fs.writeFileSync(OUTPUT_FILE, fileContent, 'utf-8');
    
    const totalIcons = boldIcons.length + outlineIcons.length;
    console.log(`\n✅ Generated ${OUTPUT_FILE} with ${totalIcons} total icons`);
    console.log(`   - Bold: ${boldIcons.length} icons`);
    console.log(`   - Outline: ${outlineIcons.length} icons`);
    console.log('📦 Icon.js is ready to use in your Figma plugin!');
}

// Run the script
generateIconData();
