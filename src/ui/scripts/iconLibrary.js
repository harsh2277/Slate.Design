// Icon Library UI Script
// Handles UI interactions for icon library feature

// Icon library configuration (matches backend)
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
    name: 'Two-tone',
    baseUrl: 'https://raw.githubusercontent.com/harsh2277/Vuesax-Icon/1fc373df0cef028768f13d29571b0f6e163d7d68/twotone'
},
'line': {
    name: 'Line',
    baseUrl: 'https://raw.githubusercontent.com/harsh2277/Vuesax-Icon/1fc373df0cef028768f13d29571b0f6e163d7d68/line'
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

// State
let selectedLibrary = null;
let selectedCategory = null;
let iconCache = {};

/**
 * Initialize icon library UI
 */
function initIconLibrary() {
  renderLibrarySelection();
}

/**
 * Render library selection
 */
function renderLibrarySelection() {
  const container = document.getElementById('iconLibraryContent');
  if (!container) return;
  
  container.innerHTML = `
    <div style="max-width: 800px; margin: 0 auto;">
      <div style="margin-bottom: 32px;">
        <h2 style="font-size: 24px; font-weight: 600; margin-bottom: 8px; color: var(--text-primary);">
          Icon Library
        </h2>
        <p style="color: var(--text-secondary); font-size: 14px;">
          Select an icon library to browse and insert icons into your design
        </p>
      </div>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
        ${Object.entries(ICON_LIBRARIES).map(([id, library]) => `
          <div class="library-card" onclick="selectLibrary('${id}')" style="
            background: var(--bg-card);
            border: 2px solid var(--border);
            border-radius: var(--radius-lg);
            padding: 24px;
            cursor: pointer;
            transition: all 0.2s ease;
          ">
            <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 12px; color: var(--text-primary);">
              ${library.name}
            </h3>
            <p style="color: var(--text-secondary); font-size: 13px; margin-bottom: 16px;">
              ${Object.keys(library.categories).length} categories
            </p>
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
              ${Object.values(library.categories).map(cat => `
                <span class="badge badge-info">${cat.name}</span>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  
  // Add hover effects
  const style = document.createElement('style');
  style.textContent = `
    .library-card:hover {
      border-color: var(--primary) !important;
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg);
    }
  `;
  document.head.appendChild(style);
}

/**
 * Select library and show categories
 */
function selectLibrary(libraryId) {
  selectedLibrary = libraryId;
  renderCategorySelection();
}

/**
 * Render category selection
 */
function renderCategorySelection() {
  const container = document.getElementById('iconLibraryContent');
  if (!container || !selectedLibrary) return;
  
  const library = ICON_LIBRARIES[selectedLibrary];
  
  container.innerHTML = `
    <div style="max-width: 1000px; margin: 0 auto;">
      <div style="margin-bottom: 24px;">
        <button class="btn btn-secondary btn-sm" onclick="renderLibrarySelection()" style="margin-bottom: 16px;">
          ← Back to Libraries
        </button>
        <h2 style="font-size: 24px; font-weight: 600; margin-bottom: 8px; color: var(--text-primary);">
          ${library.name}
        </h2>
        <p style="color: var(--text-secondary); font-size: 14px;">
          Select a category to browse icons
        </p>
      </div>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
        ${Object.entries(library.categories).map(([id, category]) => `
          <div class="category-card" onclick="selectCategory('${id}')" style="
            background: var(--bg-card);
            border: 2px solid var(--border);
            border-radius: var(--radius-md);
            padding: 20px;
            cursor: pointer;
            transition: all 0.2s ease;
            text-align: center;
          ">
            <div style="
              width: 48px;
              height: 48px;
              background: var(--primary-light);
              border-radius: var(--radius-md);
              margin: 0 auto 12px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 24px;
            ">
              📦
            </div>
            <h3 style="font-size: 16px; font-weight: 600; color: var(--text-primary);">
              ${category.name}
            </h3>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  
  // Add hover effects
  const style = document.createElement('style');
  style.textContent = `
    .category-card:hover {
      border-color: var(--primary) !important;
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }
  `;
  document.head.appendChild(style);
}

/**
 * Select category and fetch icons
 */
async function selectCategory(categoryId) {
  selectedCategory = categoryId;
  await fetchAndRenderIcons();
}

/**
 * Fetch icon list from GitHub
 */
async function fetchIconList(baseUrl) {
  const cacheKey = baseUrl;
  if (iconCache[cacheKey]) {
    return iconCache[cacheKey];
  }
  
  try {
    // Convert raw URL to API URL
    const apiUrl = baseUrl
      .replace('raw.githubusercontent.com', 'api.github.com/repos')
      .replace('/blob/', '/contents/');
    
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }
    
    const files = await response.json();
    const svgFiles = files
      .filter(file => file.name.endsWith('.svg'))
      .map(file => file.name);
    
    iconCache[cacheKey] = svgFiles;
    return svgFiles;
  } catch (error) {
    console.error('Error fetching icon list:', error);
    return [];
  }
}

/**
 * Fetch and render icons
 */
async function fetchAndRenderIcons() {
  const container = document.getElementById('iconLibraryContent');
  if (!container || !selectedLibrary || !selectedCategory) return;
  
  const library = ICON_LIBRARIES[selectedLibrary];
  const category = library.categories[selectedCategory];
  
  // Show loading state
  container.innerHTML = `
    <div style="text-align: center; padding: 60px 20px;">
      <div style="
        width: 48px;
        height: 48px;
        border: 4px solid var(--border);
        border-top-color: var(--primary);
        border-radius: 50%;
        margin: 0 auto 16px;
        animation: spin 1s linear infinite;
      "></div>
      <p style="color: var(--text-secondary);">Loading icons...</p>
    </div>
  `;
  
  // Fetch icon list
  const iconList = await fetchIconList(category.baseUrl);
  
  if (iconList.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📭</div>
        <div class="empty-state-title">No icons found</div>
        <div class="empty-state-description">
          Unable to load icons from this category
        </div>
        <button class="btn btn-secondary" onclick="renderCategorySelection()" style="margin-top: 20px;">
          Back to Categories
        </button>
      </div>
    `;
    return;
  }
  
  renderIconGrid(iconList);
}

/**
 * Render icon grid
 */
function renderIconGrid(iconList) {
  const container = document.getElementById('iconLibraryContent');
  const library = ICON_LIBRARIES[selectedLibrary];
  const category = library.categories[selectedCategory];
  
  container.innerHTML = `
    <div style="max-width: 1200px; margin: 0 auto;">
      <div style="
        position: sticky;
        top: 0;
        background: var(--bg-app);
        padding: 16px 0;
        margin-bottom: 24px;
        border-bottom: 1px solid var(--border);
        z-index: 10;
      ">
        <button class="btn btn-secondary btn-sm" onclick="renderCategorySelection()" style="margin-bottom: 12px;">
          ← Back to Categories
        </button>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h2 style="font-size: 20px; font-weight: 600; margin-bottom: 4px; color: var(--text-primary);">
              ${library.name} / ${category.name}
            </h2>
            <p style="color: var(--text-secondary); font-size: 13px;">
              ${iconList.length} icons available
            </p>
          </div>
          <button class="btn btn-primary" onclick="generateAllIcons()">
            Generate All Icons
          </button>
        </div>
      </div>
      
      <div id="iconGrid" style="
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
        gap: 12px;
      ">
        ${iconList.map(iconName => `
          <div class="icon-item" onclick="insertSingleIcon('${iconName}')" style="
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: var(--radius-md);
            padding: 16px;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
          ">
            <div class="icon-preview" data-icon="${iconName}" style="
              width: 24px;
              height: 24px;
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <div style="
                width: 20px;
                height: 20px;
                background: var(--border);
                border-radius: 4px;
              "></div>
            </div>
            <span style="
              font-size: 10px;
              color: var(--text-tertiary);
              text-align: center;
              word-break: break-word;
              line-height: 1.2;
            ">${iconName.replace('.svg', '')}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  
  // Add hover effects
  const style = document.createElement('style');
  style.textContent = `
    .icon-item:hover {
      border-color: var(--primary) !important;
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
  
  // Lazy load icon previews
  loadIconPreviews(iconList.slice(0, 50)); // Load first 50
}

/**
 * Load icon previews
 */
async function loadIconPreviews(iconList) {
  const library = ICON_LIBRARIES[selectedLibrary];
  const category = library.categories[selectedCategory];
  
  for (const iconName of iconList) {
    const preview = document.querySelector(`.icon-preview[data-icon="${iconName}"]`);
    if (!preview) continue;
    
    try {
      const url = `${category.baseUrl}/${iconName}`;
      const response = await fetch(url);
      if (response.ok) {
        const svgText = await response.text();
        preview.innerHTML = svgText;
        
        // Style the SVG
        const svg = preview.querySelector('svg');
        if (svg) {
          svg.style.width = '24px';
          svg.style.height = '24px';
          svg.style.color = 'var(--text-primary)';
        }
      }
    } catch (error) {
      console.error(`Error loading preview for ${iconName}:`, error);
    }
  }
}

/**
 * Insert single icon
 */
function insertSingleIcon(iconName) {
  if (!selectedLibrary || !selectedCategory) return;
  
  parent.postMessage({
    pluginMessage: {
      type: 'insert-single-icon',
      libraryId: selectedLibrary,
      categoryId: selectedCategory,
      iconName: iconName
    }
  }, '*');
}

/**
 * Generate all icons
 */
function generateAllIcons() {
  if (!selectedLibrary || !selectedCategory) return;
  
  const library = ICON_LIBRARIES[selectedLibrary];
  const category = library.categories[selectedCategory];
  
  // Get all icon names from the grid
  const iconElements = document.querySelectorAll('.icon-preview');
  const iconList = Array.from(iconElements).map(el => el.dataset.icon);
  
  if (iconList.length === 0) {
    alert('No icons to generate');
    return;
  }
  
  if (!confirm(`Generate ${iconList.length} icons from ${library.name} / ${category.name}?`)) {
    return;
  }
  
  parent.postMessage({
    pluginMessage: {
      type: 'generate-icon-library',
      libraryId: selectedLibrary,
      categoryId: selectedCategory,
      iconList: iconList
    }
  }, '*');
}

// Make functions globally available
window.initIconLibrary = initIconLibrary;
window.selectLibrary = selectLibrary;
window.selectCategory = selectCategory;
window.renderLibrarySelection = renderLibrarySelection;
window.renderCategorySelection = renderCategorySelection;
window.insertSingleIcon = insertSingleIcon;
window.generateAllIcons = generateAllIcons;
