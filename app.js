// Design System JSON Maker - Main Application Logic

// State Management
const state = {
  colors: {
    primary: { value: '#6366f1', description: 'Primary brand color', enabled: true },
    secondary: { value: '#8b5cf6', description: 'Secondary brand color', enabled: true },
    success: { value: '#10b981', description: 'Success state color', enabled: true },
    error: { value: '#ef4444', description: 'Error state color', enabled: true },
    warning: { value: '#f59e0b', description: 'Warning/Process color', enabled: true },
    'neutral-1000': { value: '#000000', description: 'Black', enabled: true },
    'neutral-900': { value: '#111827', description: 'Darkest gray', enabled: true },
    'neutral-800': { value: '#1f2937', description: '', enabled: true },
    'neutral-700': { value: '#374151', description: '', enabled: true },
    'neutral-600': { value: '#4b5563', description: '', enabled: true },
    'neutral-500': { value: '#6b7280', description: 'Mid gray', enabled: true },
    'neutral-400': { value: '#9ca3af', description: '', enabled: true },
    'neutral-300': { value: '#d1d5db', description: '', enabled: true },
    'neutral-200': { value: '#e5e7eb', description: '', enabled: true },
    'neutral-100': { value: '#f3f4f6', description: '', enabled: true },
    'neutral-50': { value: '#f9fafb', description: 'Lightest gray', enabled: true },
    'neutral-0': { value: '#ffffff', description: 'White', enabled: true }
  },
  spacing: {
    'spacing-0': { value: 0, description: 'No spacing' },
    'spacing-1': { value: 4, description: 'Extra small' },
    'spacing-2': { value: 8, description: 'Small' },
    'spacing-3': { value: 12, description: '' },
    'spacing-4': { value: 16, description: 'Medium' },
    'spacing-5': { value: 20, description: '' },
    'spacing-6': { value: 24, description: 'Large' },
    'spacing-7': { value: 32, description: '' },
    'spacing-8': { value: 40, description: 'Extra large' },
    'spacing-9': { value: 48, description: '' },
    'spacing-10': { value: 64, description: 'XXL' }
  },
  radius: {
    none: { value: 0, description: 'No radius' },
    sm: { value: 4, description: 'Small radius' },
    md: { value: 6, description: 'Medium radius' },
    lg: { value: 8, description: 'Large radius' },
    xl: { value: 12, description: 'Extra large radius' },
    full: { value: 9999, description: 'Fully rounded' }
  },
  typography: {
    display: { family: 'Inter', size: 48, weight: 700, lineHeight: 1.2, letterSpacing: -0.5, transform: 'normal', description: 'Large display text' },
    h1: { family: 'Inter', size: 36, weight: 700, lineHeight: 1.3, letterSpacing: -0.5, transform: 'normal', description: 'Heading 1' },
    h2: { family: 'Inter', size: 30, weight: 600, lineHeight: 1.3, letterSpacing: -0.3, transform: 'normal', description: 'Heading 2' },
    h3: { family: 'Inter', size: 24, weight: 600, lineHeight: 1.4, letterSpacing: 0, transform: 'normal', description: 'Heading 3' },
    h4: { family: 'Inter', size: 20, weight: 600, lineHeight: 1.4, letterSpacing: 0, transform: 'normal', description: 'Heading 4' },
    subtitle: { family: 'Inter', size: 16, weight: 500, lineHeight: 1.5, letterSpacing: 0, transform: 'normal', description: 'Subtitle text' },
    body: { family: 'Inter', size: 14, weight: 400, lineHeight: 1.5, letterSpacing: 0, transform: 'normal', description: 'Body text' },
    caption: { family: 'Inter', size: 12, weight: 400, lineHeight: 1.4, letterSpacing: 0, transform: 'normal', description: 'Caption text' },
    overline: { family: 'Inter', size: 11, weight: 600, lineHeight: 1.5, letterSpacing: 1, transform: 'uppercase', description: 'Overline text' }
  },
  shadows: {
    'shadow-xs': { x: 0, y: 1, blur: 2, spread: 0, color: 'rgba(0,0,0,0.05)', description: 'Extra small shadow' },
    'shadow-sm': { x: 0, y: 1, blur: 3, spread: 0, color: 'rgba(0,0,0,0.1)', description: 'Small shadow' },
    'shadow-md': { x: 0, y: 4, blur: 6, spread: -1, color: 'rgba(0,0,0,0.1)', description: 'Medium shadow' },
    'shadow-lg': { x: 0, y: 10, blur: 15, spread: -3, color: 'rgba(0,0,0,0.1)', description: 'Large shadow' },
    'shadow-xl': { x: 0, y: 20, blur: 25, spread: -5, color: 'rgba(0,0,0,0.1)', description: 'Extra large shadow' }
  },
  borders: {
    widths: {
      thin: { value: 1, description: 'Thin border' },
      medium: { value: 2, description: 'Medium border' },
      thick: { value: 4, description: 'Thick border' }
    },
    styles: ['solid', 'dashed', 'dotted']
  },
  components: {
    button: {
      variants: {
        primary: { sizes: { small: {}, medium: {}, large: {} } },
        secondary: { sizes: { small: {}, medium: {}, large: {} } },
        tertiary: { sizes: { small: {}, medium: {}, large: {} } },
        ghost: { sizes: { small: {}, medium: {}, large: {} } },
        destructive: { sizes: { small: {}, medium: {}, large: {} } }
      }
    },
    input: { types: { text: {}, password: {}, textarea: {}, select: {} } }
  },
  themes: { default: { colors: {}, components: {} } },
  currentTheme: 'default',
  exportFormat: 'pretty',
  namingConvention: 'camelCase'
};

// Initialize default button configs
Object.keys(state.components.button.variants).forEach(variant => {
  Object.keys(state.components.button.variants[variant].sizes).forEach(size => {
    state.components.button.variants[variant].sizes[size] = {
      default: { bg: 'primary', text: 'neutral-0', border: 'primary', shadow: 'shadow-sm', paddingX: 'spacing-4', paddingY: 'spacing-2', radius: 'md', font: 'body' },
      hover: { bg: 'primary', text: 'neutral-0' },
      pressed: { bg: 'primary', text: 'neutral-0' },
      disabled: { bg: 'neutral-200', text: 'neutral-400' }
    };
  });
});

// Tab Navigation
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(tab.dataset.tab).classList.add('active');
  });
});

// Render Functions
function renderFoundations() {
  const container = document.getElementById('foundations-content');
  container.innerHTML =
    renderColorsSection() +
    renderSpacingSection() +
    renderRadiusSection() +
    renderTypographySection() +
    renderShadowsSection();
}

function renderColorsSection() {
  let html = '<div class="section"><div class="section-header" onclick="toggleSection(this)">';
  html += '<div class="section-title">🎨 Colors System</div>';
  html += '<div class="section-toggle">▼</div></div>';
  html += '<div class="section-content"><table class="token-table"><thead><tr>';
  html += '<th>Token Name</th><th>Color</th><th>HEX Value</th><th>Description</th>';
  html += '<th>Enabled</th><th>Actions</th></tr></thead><tbody>';

  Object.entries(state.colors).forEach(([key, data]) => {
    const isSecondary = key === 'secondary';
    html += '<tr><td><input class="form-input" value="' + key + '" data-color-key="' + key + '" onchange="updateColorKey(this)"/></td>';
    html += '<td><div class="color-picker"><input type="color" value="' + data.value + '" data-color="' + key + '" onchange="updateColor(this)"/></div></td>';
    html += '<td><input class="form-input" value="' + data.value + '" data-color-hex="' + key + '" onchange="updateColorHex(this)"/></td>';
    html += '<td><input class="form-input" placeholder="Description" value="' + (data.description || '') + '" data-color-desc="' + key + '" onchange="updateColorDesc(this)"/></td>';
    html += '<td>';
    if (isSecondary) {
      html += '<label class="toggle-switch"><input type="checkbox" ' + (data.enabled ? 'checked' : '') + ' data-color-toggle="' + key + '" onchange="toggleColor(this)"/><span class="toggle-slider"></span></label>';
    } else {
      html += '<span class="text-muted">—</span>';
    }
    html += '</td>';
    html += '<td><button class="btn btn-sm btn-danger" onclick="deleteColor(\'' + key + '\')">Delete</button></td></tr>';
  });

  html += '</tbody></table>';
  html += '<button class="btn btn-secondary mt-16" onclick="addColor()">+ Add Color</button>';
  html += '</div></div>';
  return html;
}

function renderSpacingSection() {
  let html = '<div class="section"><div class="section-header" onclick="toggleSection(this)">';
  html += '<div class="section-title">📏 Spacing System</div>';
  html += '<div class="section-toggle">▼</div></div>';
  html += '<div class="section-content"><table class="token-table"><thead><tr>';
  html += '<th>Token Name</th><th>Value (px)</th><th>Description</th><th>Actions</th>';
  html += '</tr></thead><tbody>';

  Object.entries(state.spacing).forEach(([key, data]) => {
    html += '<tr><td><input class="form-input" value="' + key + '" data-spacing-key="' + key + '" onchange="updateSpacingKey(this)"/></td>';
    html += '<td><input type="number" class="form-input" value="' + data.value + '" data-spacing="' + key + '" onchange="updateSpacing(this)"/></td>';
    html += '<td><input class="form-input" placeholder="Description" value="' + (data.description || '') + '" data-spacing-desc="' + key + '" onchange="updateSpacingDesc(this)"/></td>';
    html += '<td><button class="btn btn-sm btn-danger" onclick="deleteSpacing(\'' + key + '\')">Delete</button></td></tr>';
  });

  html += '</tbody></table>';
  html += '<button class="btn btn-secondary mt-16" onclick="addSpacing()">+ Add Spacing</button>';
  html += '</div></div>';
  return html;
}

function renderRadiusSection() {
  let html = '<div class="section"><div class="section-header" onclick="toggleSection(this)">';
  html += '<div class="section-title">⭕ Radius System</div>';
  html += '<div class="section-toggle">▼</div></div>';
  html += '<div class="section-content"><table class="token-table"><thead><tr>';
  html += '<th>Token Name</th><th>Value (px)</th><th>Description</th></tr></thead><tbody>';

  Object.entries(state.radius).forEach(([key, data]) => {
    html += '<tr><td>' + key + '</td>';
    html += '<td><input type="number" class="form-input" value="' + data.value + '" data-radius="' + key + '" onchange="updateRadius(this)"/></td>';
    html += '<td><input class="form-input" placeholder="Description" value="' + (data.description || '') + '" data-radius-desc="' + key + '" onchange="updateRadiusDesc(this)"/></td></tr>';
  });

  html += '</tbody></table></div></div>';
  return html;
}

function renderTypographySection() {
  let html = '<div class="section"><div class="section-header" onclick="toggleSection(this)">';
  html += '<div class="section-title">🔤 Typography System</div>';
  html += '<div class="section-toggle">▼</div></div>';
  html += '<div class="section-content">';

  Object.entries(state.typography).forEach(([key, typo]) => {
    html += '<div class="form-group" style="border-bottom: 1px solid var(--border); padding-bottom: 16px; margin-bottom: 16px;">';
    html += '<div class="flex-between mb-16"><label class="form-label" style="margin: 0; font-size: 14px; font-weight: 600;">' + key + '</label>';
    html += '<div class="flex flex-gap-8">';
    html += '<button class="btn btn-sm btn-secondary" onclick="duplicateTypo(\'' + key + '\')">Duplicate</button>';
    html += '<button class="btn btn-sm btn-danger" onclick="deleteTypo(\'' + key + '\')">Delete</button>';
    html += '</div></div>';
    html += '<div class="form-row">';
    html += '<div><label class="form-label">Font Family</label><input class="form-input" value="' + typo.family + '" data-typo-family="' + key + '" onchange="updateTypo(this)"/></div>';
    html += '<div><label class="form-label">Size (px)</label><input type="number" class="form-input" value="' + typo.size + '" data-typo-size="' + key + '" onchange="updateTypo(this)"/></div>';
    html += '<div><label class="form-label">Weight</label><input type="number" class="form-input" value="' + typo.weight + '" data-typo-weight="' + key + '" onchange="updateTypo(this)"/></div>';
    html += '<div><label class="form-label">Line Height</label><input type="number" step="0.1" class="form-input" value="' + typo.lineHeight + '" data-typo-lineheight="' + key + '" onchange="updateTypo(this)"/></div>';
    html += '</div><div class="form-row" style="margin-top: 12px;">';
    html += '<div><label class="form-label">Letter Spacing</label><input type="number" step="0.1" class="form-input" value="' + typo.letterSpacing + '" data-typo-letterspacing="' + key + '" onchange="updateTypo(this)"/></div>';
    html += '<div><label class="form-label">Transform</label><select class="form-select" data-typo-transform="' + key + '" onchange="updateTypo(this)"><option value="normal" ' + (typo.transform === 'normal' ? 'selected' : '') + '>Normal</option><option value="uppercase" ' + (typo.transform === 'uppercase' ? 'selected' : '') + '>Uppercase</option></select></div>';
    html += '<div><label class="form-label">Description</label><input class="form-input" placeholder="Description" value="' + (typo.description || '') + '" data-typo-desc="' + key + '" onchange="updateTypo(this)"/></div>';
    html += '</div></div>';
  });

  html += '<button class="btn btn-primary mt-16" onclick="addTypo()">+ Add Typography Style</button>';
  html += '</div></div>';
  return html;
}

function renderShadowsSection() {
  let html = '<div class="section"><div class="section-header" onclick="toggleSection(this)">';
  html += '<div class="section-title">💫 Shadows & Borders</div>';
  html += '<div class="section-toggle">▼</div></div>';
  html += '<div class="section-content">';
  html += '<h4 class="form-label mb-16" style="font-size: 13px; font-weight: 600;">Shadows</h4>';

  Object.entries(state.shadows).forEach(([key, shadow]) => {
    html += '<div class="form-group"><label class="form-label">' + key + '</label><div class="form-row">';
    html += '<div><label class="form-label text-sm">X</label><input type="number" class="form-input" value="' + shadow.x + '" data-shadow-x="' + key + '" onchange="updateShadow(this)"/></div>';
    html += '<div><label class="form-label text-sm">Y</label><input type="number" class="form-input" value="' + shadow.y + '" data-shadow-y="' + key + '" onchange="updateShadow(this)"/></div>';
    html += '<div><label class="form-label text-sm">Blur</label><input type="number" class="form-input" value="' + shadow.blur + '" data-shadow-blur="' + key + '" onchange="updateShadow(this)"/></div>';
    html += '<div><label class="form-label text-sm">Spread</label><input type="number" class="form-input" value="' + shadow.spread + '" data-shadow-spread="' + key + '" onchange="updateShadow(this)"/></div>';
    html += '<div><label class="form-label text-sm">Color (RGBA)</label><input class="form-input" value="' + shadow.color + '" data-shadow-color="' + key + '" onchange="updateShadow(this)"/></div>';
    html += '<div><label class="form-label text-sm">Description</label><input class="form-input" placeholder="Description" value="' + (shadow.description || '') + '" data-shadow-desc="' + key + '" onchange="updateShadow(this)"/></div>';
    html += '</div></div>';
  });

  html += '<h4 class="form-label mb-16 mt-16" style="font-size: 13px; font-weight: 600;">Border Widths</h4>';
  Object.entries(state.borders.widths).forEach(([key, data]) => {
    html += '<div class="form-group"><div class="form-row">';
    html += '<div><label class="form-label">' + key + '</label><input type="number" class="form-input" value="' + data.value + '" data-border-width="' + key + '" onchange="updateBorderWidth(this)"/></div>';
    html += '<div><label class="form-label">Description</label><input class="form-input" placeholder="Description" value="' + (data.description || '') + '" data-border-width-desc="' + key + '" onchange="updateBorderWidthDesc(this)"/></div>';
    html += '</div></div>';
  });

  html += '<h4 class="form-label mb-16 mt-16" style="font-size: 13px; font-weight: 600;">Border Styles</h4>';
  html += '<p class="text-muted text-sm">' + state.borders.styles.join(', ') + '</p>';
  html += '</div></div>';
  return html;
}

function renderComponents() {
  document.getElementById('components-content').innerHTML = '<div class="component-builder"><div><h3 class="mb-16">Button Component</h3><div class="variant-selector">' + Object.keys(state.components.button.variants).map(v => '<button class="variant-btn ' + (v === 'primary' ? 'active' : '') + '" onclick="selectVariant(\'' + v + '\')">' + v + '</button>').join('') + '</div><div id="button-config"></div></div><div class="component-preview"><div class="preview-title">Live Preview</div><div id="button-preview"></div></div></div>';
}

function renderThemes() {
  let html = '<div class="section"><div class="section-header"><div class="section-title">🎨 Theme Management</div></div>';
  html += '<div class="section-content"><div class="theme-list">';
  Object.keys(state.themes).forEach(theme => {
    html += '<div class="theme-item ' + (theme === state.currentTheme ? 'active' : '') + '"><span>' + theme + '</span>';
    html += '<div class="theme-actions">';
    html += '<button class="btn btn-sm btn-secondary" onclick="duplicateTheme(\'' + theme + '\')">Duplicate</button>';
    if (theme !== 'default') {
      html += '<button class="btn btn-sm btn-danger" onclick="deleteTheme(\'' + theme + '\')">Delete</button>';
    }
    html += '</div></div>';
  });
  html += '</div><button class="btn btn-primary mt-16" onclick="addTheme()">+ Add Theme</button></div></div>';
  document.getElementById('themes-content').innerHTML = html;
}

function renderExport() {
  const json = generateJSON();
  let html = '<div class="export-options">';
  html += '<div class="option-card"><div class="option-card-title">Format</div>';
  html += '<select class="form-select" onchange="state.exportFormat = this.value; renderExport()">';
  html += '<option value="pretty" ' + (state.exportFormat === 'pretty' ? 'selected' : '') + '>Pretty JSON</option>';
  html += '<option value="minified" ' + (state.exportFormat === 'minified' ? 'selected' : '') + '>Minified JSON</option>';
  html += '</select></div>';
  html += '<div class="option-card"><div class="option-card-title">Naming Convention</div>';
  html += '<select class="form-select" onchange="state.namingConvention = this.value; renderExport()">';
  html += '<option value="camelCase" ' + (state.namingConvention === 'camelCase' ? 'selected' : '') + '>camelCase</option>';
  html += '<option value="kebab-case" ' + (state.namingConvention === 'kebab-case' ? 'selected' : '') + '>kebab-case</option>';
  html += '<option value="snake_case" ' + (state.namingConvention === 'snake_case' ? 'selected' : '') + '>snake_case</option>';
  html += '</select></div></div>';
  html += '<div class="json-preview">' + (state.exportFormat === 'pretty' ? JSON.stringify(json, null, 2) : JSON.stringify(json)) + '</div>';
  html += '<div class="flex flex-gap-12 mt-16">';
  html += '<button class="btn btn-primary" onclick="copyJSON()">📋 Copy JSON</button>';
  html += '<button class="btn btn-secondary" onclick="downloadJSON()">⬇️ Download JSON</button>';
  html += '</div>';
  document.getElementById('export-content').innerHTML = html;
}

// Helper Functions
function toggleSection(header) {
  header.parentElement.classList.toggle('collapsed');
}

function updateColor(input) {
  const key = input.dataset.color;
  state.colors[key].value = input.value;
}

function updateColorHex(input) {
  const key = input.dataset.colorHex;
  state.colors[key].value = input.value;
  renderFoundations();
}

function updateColorKey(input) {
  const oldKey = input.dataset.colorKey;
  const newKey = input.value;
  if (oldKey !== newKey && newKey) {
    state.colors[newKey] = state.colors[oldKey];
    delete state.colors[oldKey];
    renderFoundations();
  }
}

function updateColorDesc(input) {
  const key = input.dataset.colorDesc;
  state.colors[key].description = input.value;
}

function toggleColor(input) {
  const key = input.dataset.colorToggle;
  state.colors[key].enabled = input.checked;
}

function addColor() {
  const key = prompt('Enter color token name:') || 'color-' + (Object.keys(state.colors).length + 1);
  state.colors[key] = { value: '#000000', description: '', enabled: true };
  renderFoundations();
}

function deleteColor(key) {
  if (confirm('Delete color "' + key + '"?')) {
    delete state.colors[key];
    renderFoundations();
  }
}

function updateSpacing(input) {
  const key = input.dataset.spacing;
  state.spacing[key].value = parseInt(input.value);
}

function updateSpacingKey(input) {
  const oldKey = input.dataset.spacingKey;
  const newKey = input.value;
  if (oldKey !== newKey && newKey) {
    state.spacing[newKey] = state.spacing[oldKey];
    delete state.spacing[oldKey];
    renderFoundations();
  }
}

function updateSpacingDesc(input) {
  const key = input.dataset.spacingDesc;
  state.spacing[key].description = input.value;
}

function addSpacing() {
  const key = 'spacing-' + Object.keys(state.spacing).length;
  state.spacing[key] = { value: 0, description: '' };
  renderFoundations();
}

function deleteSpacing(key) {
  if (confirm('Delete spacing "' + key + '"?')) {
    delete state.spacing[key];
    renderFoundations();
  }
}

function updateRadius(input) {
  const key = input.dataset.radius;
  state.radius[key].value = parseInt(input.value);
}

function updateRadiusDesc(input) {
  const key = input.dataset.radiusDesc;
  state.radius[key].description = input.value;
}

function updateTypo(input) {
  const key = input.dataset.typoFamily || input.dataset.typoSize || input.dataset.typoWeight || input.dataset.typoLineheight || input.dataset.typoLetterspacing || input.dataset.typoTransform || input.dataset.typoDesc;
  if (input.dataset.typoFamily) state.typography[key].family = input.value;
  if (input.dataset.typoSize) state.typography[key].size = parseInt(input.value);
  if (input.dataset.typoWeight) state.typography[key].weight = parseInt(input.value);
  if (input.dataset.typoLineheight) state.typography[key].lineHeight = parseFloat(input.value);
  if (input.dataset.typoLetterspacing) state.typography[key].letterSpacing = parseFloat(input.value);
  if (input.dataset.typoTransform) state.typography[key].transform = input.value;
  if (input.dataset.typoDesc) state.typography[key].description = input.value;
}

function addTypo() {
  const key = prompt('Enter typography style name:');
  if (key && !state.typography[key]) {
    state.typography[key] = { family: 'Inter', size: 14, weight: 400, lineHeight: 1.5, letterSpacing: 0, transform: 'normal', description: '' };
    renderFoundations();
  }
}

function duplicateTypo(key) {
  const newKey = prompt('Enter new typography style name:', key + '-copy');
  if (newKey && !state.typography[newKey]) {
    state.typography[newKey] = JSON.parse(JSON.stringify(state.typography[key]));
    renderFoundations();
  }
}

function deleteTypo(key) {
  if (confirm('Delete typography style "' + key + '"?')) {
    delete state.typography[key];
    renderFoundations();
  }
}

function updateShadow(input) {
  const key = input.dataset.shadowX || input.dataset.shadowY || input.dataset.shadowBlur || input.dataset.shadowSpread || input.dataset.shadowColor || input.dataset.shadowDesc;
  if (input.dataset.shadowX) state.shadows[key].x = parseInt(input.value);
  if (input.dataset.shadowY) state.shadows[key].y = parseInt(input.value);
  if (input.dataset.shadowBlur) state.shadows[key].blur = parseInt(input.value);
  if (input.dataset.shadowSpread) state.shadows[key].spread = parseInt(input.value);
  if (input.dataset.shadowColor) state.shadows[key].color = input.value;
  if (input.dataset.shadowDesc) state.shadows[key].description = input.value;
}

function updateBorderWidth(input) {
  const key = input.dataset.borderWidth;
  state.borders.widths[key].value = parseInt(input.value);
}

function updateBorderWidthDesc(input) {
  const key = input.dataset.borderWidthDesc;
  state.borders.widths[key].description = input.value;
}

function selectVariant(variant) {
  document.querySelectorAll('.variant-btn').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');
}

function addTheme() {
  const name = prompt('Enter theme name:');
  if (name && !state.themes[name]) {
    state.themes[name] = { colors: {}, components: {} };
    renderThemes();
  }
}

function duplicateTheme(theme) {
  const name = prompt('Enter new theme name:');
  if (name && !state.themes[name]) {
    state.themes[name] = JSON.parse(JSON.stringify(state.themes[theme]));
    renderThemes();
  }
}

function deleteTheme(theme) {
  if (confirm('Delete theme "' + theme + '"?')) {
    delete state.themes[theme];
    renderThemes();
  }
}

function generateJSON() {
  const colors = {};
  Object.entries(state.colors).forEach(([key, data]) => {
    if (data.enabled) {
      colors[key] = data.value;
    }
  });

  const spacing = {};
  Object.entries(state.spacing).forEach(([key, data]) => {
    spacing[key] = data.value;
  });

  const radius = {};
  Object.entries(state.radius).forEach(([key, data]) => {
    radius[key] = data.value;
  });

  const typography = {};
  Object.entries(state.typography).forEach(([key, typo]) => {
    typography[key] = {
      fontFamily: typo.family,
      fontSize: typo.size,
      fontWeight: typo.weight,
      lineHeight: typo.lineHeight,
      letterSpacing: typo.letterSpacing,
      textTransform: typo.transform
    };
  });

  const shadows = {};
  Object.entries(state.shadows).forEach(([key, shadow]) => {
    shadows[key] = shadow.x + 'px ' + shadow.y + 'px ' + shadow.blur + 'px ' + shadow.spread + 'px ' + shadow.color;
  });

  const borders = {
    widths: {},
    styles: state.borders.styles
  };
  Object.entries(state.borders.widths).forEach(([key, data]) => {
    borders.widths[key] = data.value;
  });

  return {
    meta: {
      version: '1.0.0',
      generatedAt: new Date().toISOString(),
      generatedBy: 'Design System JSON Maker'
    },
    colors: colors,
    spacing: spacing,
    radius: radius,
    typography: typography,
    shadows: shadows,
    borders: borders,
    components: state.components,
    themes: state.themes
  };
}

function copyJSON() {
  const json = JSON.stringify(generateJSON(), null, state.exportFormat === 'pretty' ? 2 : 0);
  navigator.clipboard.writeText(json).then(() => {
    parent.postMessage({ pluginMessage: { type: 'notify', message: 'JSON copied to clipboard!' } }, '*');
  });
}

function downloadJSON() {
  const json = JSON.stringify(generateJSON(), null, state.exportFormat === 'pretty' ? 2 : 0);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'design-system.json';
  a.click();
  URL.revokeObjectURL(url);
}

// Event Listeners
document.getElementById('reset-btn').addEventListener('click', () => {
  if (confirm('Reset all settings to defaults?')) {
    location.reload();
  }
});

document.getElementById('generate-json-btn').addEventListener('click', () => {
  document.querySelector('[data-tab="export"]').click();
  renderExport();
});

// Initialize
renderFoundations();
renderComponents();
renderThemes();
renderExport();
