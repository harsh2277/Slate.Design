// Icon Library Handler
// Handles fetching and creating icon components in Figma

/**
 * Fetch SVG content from URL
 */
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

/**
 * Clean SVG content for Figma
 */
function cleanSVG(svgText) {
  // Remove width and height attributes to allow proper scaling
  let cleaned = svgText.replace(/\s*width="[^"]*"/gi, '');
  cleaned = cleaned.replace(/\s*height="[^"]*"/gi, '');
  return cleaned;
}

/**
 * Create icon component from SVG
 */
function createIconComponent(svgText, iconName, size = 24) {
  const cleaned = cleanSVG(svgText);
  const svgNode = figma.createNodeFromSvg(cleaned);
  
  // Create component
  const component = figma.createComponent();
  component.name = iconName;
  component.resize(size, size);
  component.fills = [];
  
  // Scale SVG to fit
  const scaleX = size / svgNode.width;
  const scaleY = size / svgNode.height;
  const scale = Math.min(scaleX, scaleY);
  svgNode.resize(svgNode.width * scale, svgNode.height * scale);
  
  // Center SVG
  svgNode.x = (size - svgNode.width) / 2;
  svgNode.y = (size - svgNode.height) / 2;
  
  // Move SVG children to component
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

/**
 * Create or get Icon Library page
 */
function getOrCreateIconLibraryPage() {
  let page = figma.root.children.find(p => p.name === 'Icon Library');
  if (!page) {
    page = figma.createPage();
    page.name = 'Icon Library';
  }
  return page;
}

/**
 * Create category frame with auto layout
 */
function createCategoryFrame(categoryName, x = 0, y = 0) {
  const frame = figma.createFrame();
  frame.name = categoryName;
  frame.x = x;
  frame.y = y;
  frame.fills = [];
  
  // Set auto layout
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

/**
 * Generate icon library
 */
async function generateIconLibrary(libraryId, categoryId, iconList) {
  const page = getOrCreateIconLibraryPage();
  const originalPage = figma.currentPage;
  figma.currentPage = page;
  
  try {
    // Get library config
    const library = ICON_LIBRARIES[libraryId];
    if (!library) {
      throw new Error(`Library ${libraryId} not found`);
    }
    
    const category = library.categories[categoryId];
    if (!category) {
      throw new Error(`Category ${categoryId} not found`);
    }
    
    // Create category frame
    const categoryFrame = createCategoryFrame(
      `${library.name} / ${category.name}`,
      0,
      0
    );
    page.appendChild(categoryFrame);
    
    // Array to store components for component set
    const components = [];
    let successCount = 0;
    let failCount = 0;
    
    // Fetch and create icons
    for (const iconName of iconList) {
      const url = `${category.baseUrl}/${iconName}`;
      const svgText = await fetchSVG(url);
      
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
    
    // Create component set if we have components
    if (components.length > 1) {
      const componentSet = figma.combineAsVariants(components, page);
      componentSet.name = `${library.name} / ${category.name}`;
      componentSet.layoutMode = 'NONE';
      componentSet.fills = [];
      
      // Remove the category frame since components are now in component set
      categoryFrame.remove();
      
      // Center in viewport
      figma.viewport.scrollAndZoomIntoView([componentSet]);
    } else if (components.length === 1) {
      // Single component, just center it
      figma.viewport.scrollAndZoomIntoView([components[0]]);
    }
    
    figma.currentPage = originalPage;
    
    return {
      success: true,
      successCount,
      failCount,
      total: iconList.length
    };
    
  } catch (error) {
    figma.currentPage = originalPage;
    throw error;
  }
}

// Icon sources configuration
const ICON_LIBRARIES = {
  'box-icons': {
    name: 'Box Icons',
    categories: {
      'logos': {
        name: 'Logos',
        baseUrl: 'https://raw.githubusercontent.com/harsh2277/Box-Icon/192522ef45d183c510a068c65fbbb208ddca0813/svg/logos',
        icons: []
      },
      'regular': {
        name: 'Regular',
        baseUrl: 'https://raw.githubusercontent.com/harsh2277/Box-Icon/192522ef45d183c510a068c65fbbb208ddca0813/svg/regular',
        icons: []
      },
      'solid': {
        name: 'Solid',
        baseUrl: 'https://raw.githubusercontent.com/harsh2277/Box-Icon/192522ef45d183c510a068c65fbbb208ddca0813/svg/solid',
        icons: []
      }
    }
  },
  'vuesax-icons': {
    name: 'Vuesax Icons',
    categories: {
      'twotone': {
        name: 'Twotone',
        baseUrl: 'https://raw.githubusercontent.com/harsh2277/Vuesax-Icon/1fc373df0cef028768f13d29571b0f6e163d7d68/twotone',
        icons: []
      },
      'outline': {
        name: 'Outline',
        baseUrl: 'https://raw.githubusercontent.com/harsh2277/Vuesax-Icon/1fc373df0cef028768f13d29571b0f6e163d7d68/outline',
        icons: []
      },
      'linear': {
        name: 'Linear',
        baseUrl: 'https://raw.githubusercontent.com/harsh2277/Vuesax-Icon/1fc373df0cef028768f13d29571b0f6e163d7d68/linear',
        icons: []
      },
      'bulk': {
        name: 'Bulk',
        baseUrl: 'https://raw.githubusercontent.com/harsh2277/Vuesax-Icon/1fc373df0cef028768f13d29571b0f6e163d7d68/bulk',
        icons: []
      },
      'broken': {
        name: 'Broken',
        baseUrl: 'https://raw.githubusercontent.com/harsh2277/Vuesax-Icon/1fc373df0cef028768f13d29571b0f6e163d7d68/broken',
        icons: []
      },
      'bold': {
        name: 'Bold',
        baseUrl: 'https://raw.githubusercontent.com/harsh2277/Vuesax-Icon/1fc373df0cef028768f13d29571b0f6e163d7d68/bold',
        icons: []
      }
    }
  }
};
