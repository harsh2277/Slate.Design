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
  
  const libraryIcons = {
    'box-icons': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="7" height="7" rx="1" fill="currentColor" opacity="0.3"/><rect x="13" y="3" width="8" height="7" rx="1" fill="currentColor"/><rect x="3" y="13" width="8" height="8" rx="1" fill="currentColor"/><rect x="13" y="13" width="8" height="8" rx="1" fill="currentColor" opacity="0.6"/></svg>`,
    'vuesax-icons': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" opacity="0.3"/><path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    'unicons': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><path d="M12 6V12L16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`
  };
  
  container.innerHTML = `
    <div style="max-width: 900px; margin: 0 auto; padding: 20px 0;">
      <div style="margin-bottom: 48px; text-align: center;">
        <div style="display: inline-flex; align-items: center; justify-content: center; width: 64px; height: 64px; background: linear-gradient(135deg, var(--primary) 0%, #8b5cf6 100%); border-radius: 16px; margin-bottom: 20px; box-shadow: 0 8px 24px rgba(37, 99, 235, 0.2);">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" opacity="0.9"/>
            <path d="M2 17L12 22L22 17M2 12L12 17L22 12" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h2 style="font-size: 28px; font-weight: 700; margin-bottom: 12px; color: var(--text-primary); letter-spacing: -0.5px;">
          Icon Library
        </h2>
        <p style="color: var(--text-secondary); font-size: 15px; max-width: 500px; margin: 0 auto; line-height: 1.6;">
          Choose from thousands of professionally designed icons across multiple libraries
        </p>
      </div>
      
      <div class="library-grid">
        ${Object.entries(ICON_LIBRARIES).map(([id, library], index) => `
          <div class="library-card-enhanced" onclick="selectLibrary('${id}')" style="animation-delay: ${index * 0.1}s;">
            <div class="library-card-icon">
              ${libraryIcons[id]}
            </div>
            <div class="library-card-content">
              <h3 class="library-card-title">${library.name}</h3>
              <p class="library-card-description">
                ${Object.keys(library.categories).length} categories • ${Object.keys(library.categories).length * 100}+ icons
              </p>
              <div class="library-card-categories">
                ${Object.values(library.categories).slice(0, 4).map(cat => `
                  <span class="category-badge">${cat.name}</span>
                `).join('')}
                ${Object.keys(library.categories).length > 4 ? `<span class="category-badge-more">+${Object.keys(library.categories).length - 4}</span>` : ''}
              </div>
            </div>
            <div class="library-card-arrow">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  
  // Add enhanced styles
  if (!document.getElementById('library-enhanced-styles')) {
    const style = document.createElement('style');
    style.id = 'library-enhanced-styles';
    style.textContent = `
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      .library-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
        gap: 20px;
      }
      
      .library-card-enhanced {
        background: var(--bg-card);
        border: 2px solid var(--border);
        border-radius: 12px;
        padding: 24px;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        overflow: hidden;
        display: flex;
        align-items: flex-start;
        gap: 16px;
        animation: fadeInUp 0.5s ease-out forwards;
        opacity: 0;
      }
      
      .library-card-enhanced::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(90deg, var(--primary), #8b5cf6);
        transform: scaleX(0);
        transform-origin: left;
        transition: transform 0.3s ease;
      }
      
      .library-card-enhanced:hover::before {
        transform: scaleX(1);
      }
      
      .library-card-enhanced:hover {
        border-color: var(--primary);
        transform: translateY(-4px);
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
      }
      
      .library-card-enhanced:hover .library-card-icon {
        transform: scale(1.1) rotate(5deg);
        background: linear-gradient(135deg, var(--primary), #8b5cf6);
      }
      
      .library-card-enhanced:hover .library-card-arrow {
        transform: translateX(4px);
        opacity: 1;
      }
      
      .library-card-icon {
        width: 56px;
        height: 56px;
        min-width: 56px;
        background: var(--bg-hover);
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--primary);
        transition: all 0.3s ease;
      }
      
      .library-card-icon svg {
        width: 28px;
        height: 28px;
      }
      
      .library-card-enhanced:hover .library-card-icon svg {
        color: white;
      }
      
      .library-card-content {
        flex: 1;
      }
      
      .library-card-title {
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 6px;
        color: var(--text-primary);
        letter-spacing: -0.3px;
      }
      
      .library-card-description {
        font-size: 13px;
        color: var(--text-secondary);
        margin-bottom: 12px;
        line-height: 1.4;
      }
      
      .library-card-categories {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      
      .category-badge {
        font-size: 11px;
        font-weight: 500;
        padding: 4px 10px;
        background: var(--bg-hover);
        color: var(--text-secondary);
        border-radius: 6px;
        border: 1px solid var(--border);
        transition: all 0.2s ease;
      }
      
      .library-card-enhanced:hover .category-badge {
        background: var(--primary);
        color: white;
        border-color: var(--primary);
      }
      
      .category-badge-more {
        font-size: 11px;
        font-weight: 600;
        padding: 4px 10px;
        background: transparent;
        color: var(--text-tertiary);
        border-radius: 6px;
      }
      
      .library-card-arrow {
        color: var(--text-tertiary);
        opacity: 0.5;
        transition: all 0.3s ease;
        margin-top: 4px;
      }
      
      .library-card-enhanced:hover .library-card-arrow {
        color: var(--primary);
      }
    `;
    document.head.appendChild(style);
  }
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
  
  const categoryIcons = {
    'logos': '🏢', 'regular': '⭐', 'solid': '⬛', 'twotone': '🎨',
    'line': '📏', 'outline': '⭕', 'linear': '📐', 'bulk': '📦',
    'broken': '✂️', 'bold': '💪', 'monochrome': '⚫', 'thinline': '📝'
  };
  
  container.innerHTML = `
    <div style="max-width: 1100px; margin: 0 auto; padding: 20px 0;">
      <div style="margin-bottom: 32px;">
        <button class="btn-back" onclick="renderLibrarySelection()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Back to Libraries
        </button>
        <div style="margin-top: 24px;">
          <h2 style="font-size: 26px; font-weight: 700; margin-bottom: 8px; color: var(--text-primary); letter-spacing: -0.4px;">
            ${library.name}
          </h2>
          <p style="color: var(--text-secondary); font-size: 14px;">
            Select a category to browse ${Object.keys(library.categories).length * 100}+ icons
          </p>
        </div>
      </div>
      
      <div class="category-grid">
        ${Object.entries(library.categories).map(([id, category], index) => `
          <div class="category-card-enhanced" onclick="selectCategory('${id}')" style="animation-delay: ${index * 0.05}s;">
            <div class="category-card-icon-wrapper">
              <div class="category-card-icon">
                ${categoryIcons[id] || '📦'}
              </div>
            </div>
            <div class="category-card-info">
              <h3 class="category-card-name">${category.name}</h3>
              <p class="category-card-count">100+ icons</p>
            </div>
            <div class="category-card-hover-arrow">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  
  // Add enhanced styles
  if (!document.getElementById('category-enhanced-styles')) {
    const style = document.createElement('style');
    style.id = 'category-enhanced-styles';
    style.textContent = `
      .btn-back {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 10px 18px;
        background: var(--bg-card);
        border: 1px solid var(--border);
        border-radius: 8px;
        font-size: 13px;
        font-weight: 500;
        color: var(--text-primary);
        cursor: pointer;
        transition: all 0.2s ease;
      }
      
      .btn-back:hover {
        background: var(--bg-hover);
        border-color: var(--border-dark);
        transform: translateX(-2px);
      }
      
      .category-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 16px;
      }
      
      .category-card-enhanced {
        background: var(--bg-card);
        border: 2px solid var(--border);
        border-radius: 12px;
        padding: 20px;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        overflow: hidden;
        animation: fadeInUp 0.4s ease-out forwards;
        opacity: 0;
      }
      
      .category-card-enhanced::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, var(--primary) 0%, #8b5cf6 100%);
        opacity: 0;
        transition: opacity 0.3s ease;
        z-index: 0;
      }
      
      .category-card-enhanced:hover::after {
        opacity: 0.05;
      }
      
      .category-card-enhanced:hover {
        border-color: var(--primary);
        transform: translateY(-4px) scale(1.02);
        box-shadow: 0 12px 28px rgba(0, 0, 0, 0.1);
      }
      
      .category-card-icon-wrapper {
        position: relative;
        z-index: 1;
        margin-bottom: 16px;
      }
      
      .category-card-icon {
        width: 56px;
        height: 56px;
        background: var(--bg-hover);
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28px;
        transition: all 0.3s ease;
        border: 1px solid var(--border);
      }
      
      .category-card-enhanced:hover .category-card-icon {
        background: linear-gradient(135deg, var(--primary), #8b5cf6);
        transform: scale(1.1) rotate(-5deg);
        border-color: transparent;
      }
      
      .category-card-info {
        position: relative;
        z-index: 1;
      }
      
      .category-card-name {
        font-size: 16px;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 4px;
        letter-spacing: -0.2px;
      }
      
      .category-card-count {
        font-size: 12px;
        color: var(--text-secondary);
        margin: 0;
      }
      
      .category-card-hover-arrow {
        position: absolute;
        top: 20px;
        right: 20px;
        color: var(--text-tertiary);
        opacity: 0;
        transform: translateX(-8px);
        transition: all 0.3s ease;
        z-index: 1;
      }
      
      .category-card-enhanced:hover .category-card-hover-arrow {
        opacity: 1;
        transform: translateX(0);
        color: var(--primary);
      }
    `;
    document.head.appendChild(style);
  }
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
  
  // Show enhanced loading state
  container.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; padding: 60px 20px;">
      <div style="position: relative; width: 80px; height: 80px; margin-bottom: 24px;">
        <div style="
          position: absolute;
          width: 80px;
          height: 80px;
          border: 4px solid var(--border);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        "></div>
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, var(--primary), #8b5cf6);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" opacity="0.9"/>
            <path d="M2 17L12 22L22 17M2 12L12 17L22 12" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>
      <h3 style="font-size: 18px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">
        Loading ${category.name} Icons
      </h3>
      <p style="color: var(--text-secondary); font-size: 14px;">
        Fetching icons from ${library.name}...
      </p>
    </div>
  `;
  
  // Add spin animation if not exists
  if (!document.getElementById('spin-animation')) {
    const style = document.createElement('style');
    style.id = 'spin-animation';
    style.textContent = `
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }
  
  // Fetch icon list
  const iconList = await fetchIconList(category.baseUrl);
  
  if (iconList.length === 0) {
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; padding: 60px 20px; text-align: center;">
        <div style="
          width: 80px;
          height: 80px;
          background: var(--bg-hover);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
          font-size: 40px;
        ">
          📭
        </div>
        <h3 style="font-size: 20px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">
          No Icons Found
        </h3>
        <p style="color: var(--text-secondary); font-size: 14px; margin-bottom: 24px; max-width: 400px;">
          Unable to load icons from this category. Please try another category or check your connection.
        </p>
        <button class="btn-back" onclick="renderCategorySelection()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
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
    <div style="max-width: 1400px; margin: 0 auto; padding: 20px 0;">
      <div class="icon-grid-header">
        <div class="icon-grid-header-top">
          <button class="btn-back" onclick="renderCategorySelection()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Back to Categories
          </button>
        </div>
        
        <div class="icon-grid-header-main">
          <div class="icon-grid-info">
            <div class="icon-grid-breadcrumb">
              <span style="color: var(--text-tertiary);">${library.name}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span style="color: var(--text-primary); font-weight: 600;">${category.name}</span>
            </div>
            <h2 class="icon-grid-title">${category.name} Icons</h2>
            <p class="icon-grid-count">
              <span class="icon-count-badge">${iconList.length}</span> icons available
            </p>
          </div>
          
          <div class="icon-grid-actions">
            <button class="btn-icon-size" id="iconSizeBtn" onclick="toggleIconSize()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
                <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
                <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
                <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
              </svg>
              <span>Grid Size</span>
            </button>
            <button class="btn-generate-all" onclick="generateAllIcons()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <polyline points="7 10 12 15 17 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Generate All
            </button>
          </div>
        </div>
      </div>
      
      <div id="iconGrid" class="icon-grid-container icon-grid-medium">
        ${iconList.map((iconName, index) => `
          <div class="icon-item-enhanced" onclick="insertSingleIcon('${iconName}')" style="animation-delay: ${Math.min(index * 0.01, 0.5)}s;">
            <div class="icon-item-preview" data-icon="${iconName}">
              <div class="icon-item-placeholder"></div>
            </div>
            <div class="icon-item-name">${iconName.replace('.svg', '').replace(/-/g, ' ')}</div>
            <div class="icon-item-overlay">
              <div class="icon-item-overlay-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  
  // Add enhanced styles
  if (!document.getElementById('icon-grid-enhanced-styles')) {
    const style = document.createElement('style');
    style.id = 'icon-grid-enhanced-styles';
    style.textContent = `
      .icon-grid-header {
        position: sticky;
        top: 0;
        background: var(--bg-app);
        padding-bottom: 24px;
        margin-bottom: 24px;
        border-bottom: 1px solid var(--border);
        z-index: 10;
      }
      
      .icon-grid-header-top {
        margin-bottom: 20px;
      }
      
      .icon-grid-header-main {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        gap: 24px;
      }
      
      .icon-grid-breadcrumb {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        margin-bottom: 8px;
        color: var(--text-secondary);
      }
      
      .icon-grid-title {
        font-size: 24px;
        font-weight: 700;
        margin-bottom: 8px;
        color: var(--text-primary);
        letter-spacing: -0.4px;
      }
      
      .icon-grid-count {
        font-size: 14px;
        color: var(--text-secondary);
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .icon-count-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 32px;
        height: 24px;
        padding: 0 8px;
        background: linear-gradient(135deg, var(--primary), #8b5cf6);
        color: white;
        border-radius: 6px;
        font-size: 13px;
        font-weight: 600;
      }
      
      .icon-grid-actions {
        display: flex;
        gap: 12px;
      }
      
      .btn-icon-size {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 10px 16px;
        background: var(--bg-card);
        border: 1px solid var(--border);
        border-radius: 8px;
        font-size: 13px;
        font-weight: 500;
        color: var(--text-primary);
        cursor: pointer;
        transition: all 0.2s ease;
      }
      
      .btn-icon-size:hover {
        background: var(--bg-hover);
        border-color: var(--border-dark);
      }
      
      .btn-generate-all {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 10px 20px;
        background: linear-gradient(135deg, var(--primary), #8b5cf6);
        border: none;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 600;
        color: white;
        cursor: pointer;
        transition: all 0.2s ease;
        box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
      }
      
      .btn-generate-all:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(37, 99, 235, 0.3);
      }
      
      .icon-grid-container {
        display: grid;
        gap: 12px;
      }
      
      .icon-grid-small {
        grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
      }
      
      .icon-grid-medium {
        grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
      }
      
      .icon-grid-large {
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      }
      
      .icon-item-enhanced {
        background: var(--bg-card);
        border: 2px solid var(--border);
        border-radius: 10px;
        padding: 16px;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        overflow: hidden;
        animation: fadeInScale 0.4s ease-out forwards;
        opacity: 0;
      }
      
      @keyframes fadeInScale {
        from {
          opacity: 0;
          transform: scale(0.9);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }
      
      .icon-item-enhanced:hover {
        border-color: var(--primary);
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
        z-index: 1;
      }
      
      .icon-item-preview {
        width: 100%;
        aspect-ratio: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 12px;
        position: relative;
      }
      
      .icon-item-placeholder {
        width: 32px;
        height: 32px;
        background: var(--bg-hover);
        border-radius: 6px;
        animation: pulse 2s ease-in-out infinite;
      }
      
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
      
      .icon-item-preview svg {
        width: 32px;
        height: 32px;
        color: var(--text-primary);
        transition: all 0.3s ease;
      }
      
      .icon-item-enhanced:hover .icon-item-preview svg {
        color: var(--primary);
        transform: scale(1.2);
      }
      
      .icon-item-name {
        font-size: 10px;
        color: var(--text-tertiary);
        text-align: center;
        word-break: break-word;
        line-height: 1.3;
        text-transform: capitalize;
        transition: color 0.2s ease;
      }
      
      .icon-item-enhanced:hover .icon-item-name {
        color: var(--text-primary);
        font-weight: 500;
      }
      
      .icon-item-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, var(--primary), #8b5cf6);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s ease;
        border-radius: 8px;
      }
      
      .icon-item-enhanced:hover .icon-item-overlay {
        opacity: 0.95;
      }
      
      .icon-item-overlay-btn {
        width: 40px;
        height: 40px;
        background: rgba(255, 255, 255, 0.2);
        border: 2px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        transform: scale(0.8);
        transition: transform 0.3s ease;
      }
      
      .icon-item-enhanced:hover .icon-item-overlay-btn {
        transform: scale(1);
      }
    `;
    document.head.appendChild(style);
  }
  
  // Lazy load icon previews
  loadIconPreviews(iconList.slice(0, 100)); // Load first 100
}

// Toggle icon grid size
let currentGridSize = 'medium';
function toggleIconSize() {
  const grid = document.getElementById('iconGrid');
  if (!grid) return;
  
  const sizes = ['small', 'medium', 'large'];
  const currentIndex = sizes.indexOf(currentGridSize);
  const nextIndex = (currentIndex + 1) % sizes.length;
  currentGridSize = sizes[nextIndex];
  
  grid.className = `icon-grid-container icon-grid-${currentGridSize}`;
}

/**
 * Load icon previews
 */
async function loadIconPreviews(iconList) {
  const library = ICON_LIBRARIES[selectedLibrary];
  const category = library.categories[selectedCategory];
  
  for (const iconName of iconList) {
    const preview = document.querySelector(`.icon-item-preview[data-icon="${iconName}"]`);
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
          svg.style.width = '32px';
          svg.style.height = '32px';
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
window.toggleIconSize = toggleIconSize;
