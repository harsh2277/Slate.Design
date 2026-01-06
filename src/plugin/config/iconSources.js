// Icon Library Configuration
// Single source of truth for all icon libraries

const ICON_LIBRARIES = {
  'box-icons': {
    name: 'Box Icons',
    categories: {
      'logos': {
        name: 'Logos',
        baseUrl: 'https://raw.githubusercontent.com/harsh2277/Box-Icon/192522ef45d183c510a068c65fbbb208ddca0813/svg/logos',
        icons: [] // Will be populated dynamically
      },
      'regular': {
        name: 'Regular',
        baseUrl: 'https://raw.githubusercontent.com/harsh2277/Box-Icon/192522ef45d183c510a068c65fbbb208ddca0813/svg/regular',
        icons: [] // Will be populated dynamically
      },
      'solid': {
        name: 'Solid',
        baseUrl: 'https://raw.githubusercontent.com/harsh2277/Box-Icon/192522ef45d183c510a068c65fbbb208ddca0813/svg/solid',
        icons: [] // Will be populated dynamically
      }
    }
  },
  'vuesax-icons': {
    name: 'Vuesax Icons',
    categories: {
      'outline': {
        name: 'Outline',
        baseUrl: 'https://raw.githubusercontent.com/harsh2277/Vuesax-Icon/1fc373df0cef028768f13d29571b0f6e163d7d68/outline',
        icons: [] // Will be populated dynamically
      },
      'bulk': {
        name: 'Bulk',
        baseUrl: 'https://raw.githubusercontent.com/harsh2277/Vuesax-Icon/1fc373df0cef028768f13d29571b0f6e163d7d68/bulk',
        icons: [] // Will be populated dynamically
      },
      'bold': {
        name: 'Bold',
        baseUrl: 'https://raw.githubusercontent.com/harsh2277/Vuesax-Icon/1fc373df0cef028768f13d29571b0f6e163d7d68/bold',
        icons: [] // Will be populated dynamically
      }
    }
  },
  'unicons': {
    name: 'Unicons',
    categories: {
      'line': {
        name: 'Line',
        baseUrl: 'https://raw.githubusercontent.com/harsh2277/unicons/41643545a256b97c0c4cd646817cf352da4ce866/line',
        icons: [] // Will be populated dynamically
      },
      'monochrome': {
        name: 'Monochrome',
        baseUrl: 'https://raw.githubusercontent.com/harsh2277/unicons/41643545a256b97c0c4cd646817cf352da4ce866/monochrome',
        icons: [] // Will be populated dynamically
      },
      'solid': {
        name: 'Solid',
        baseUrl: 'https://raw.githubusercontent.com/harsh2277/unicons/41643545a256b97c0c4cd646817cf352da4ce866/solid',
        icons: [] // Will be populated dynamically
      },
      'thinline': {
        name: 'Thinline',
        baseUrl: 'https://raw.githubusercontent.com/harsh2277/unicons/41643545a256b97c0c4cd646817cf352da4ce866/thinline',
        icons: [] // Will be populated dynamically
      }
    }
  }
};

// Export for use in plugin
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ICON_LIBRARIES };
}
