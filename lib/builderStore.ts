import { create } from 'zustand';

export type BlockType =
  | 'text'
  | 'heading'
  | 'subheading'
  | 'rich-text'
  | 'button'
  | 'link'
  | 'divider'
  | 'spacer'
  | 'bullet-list'
  | 'numbered-list'
  | 'quote'
  | 'badge'
  | 'icon'
  | 'navigation-bar'
  | 'header'
  | 'logo'
  | 'menu'
  | 'breadcrumb'
  | 'footer'
  // Media Elements
  | 'image'
  | 'image-gallery'
  | 'video-embed'
  | 'video-upload'
  | 'background-video'
  | 'icon-box'
  | 'image-text'
  | 'logo-carousel'
  | 'audio-player';

export interface Block {
  id: string;
  type: BlockType;
  props: any;
}

export interface Column {
  id: string;
  width: string; // e.g., "1/2", "1/3", "full"
  blocks: Block[];
  props?: any; // <-- Add this line
}

export interface Row {
  id: string;
  columns: Column[];
  props?: any; // <-- Add this line
}

export interface Section {
  id: string;
  type: 'default' | 'hero' | 'features' | 'testimonials' | 'contact';
  props: {
    backgroundColor?: string;
    padding?: string;
    maxWidth?: string;
  };
  rows: Row[];
}

interface BuilderState {
  sections: Section[];
  history: Section[][];
  historyIndex: number;
  isSaving: boolean;
  isPublished: boolean;
  selectedElement: {
    type: 'section' | 'row' | 'column' | 'block';
    id: string;
  } | null;
  
  // Helper functions
  saveToHistory: (newSections: Section[]) => void;
  getColumnWidth: (columnType: 'full' | 'half' | 'third' | 'quarter') => string;
  getColumnCount: (rowType: 'single' | 'two-column' | 'three-column') => number;
  
  // Section Actions
  addSection: (type?: Section['type']) => void;
  updateSection: (sectionId: string, props: any) => void;
  removeSection: (sectionId: string) => void;
  moveSection: (sectionId: string, direction: 'up' | 'down') => void;
  
  // Row Actions
  addRow: (sectionId: string, rowType?: 'single' | 'two-column' | 'three-column') => string;
  updateRow: (sectionId: string, rowId: string, props: any) => void;
  removeRow: (sectionId: string, rowId: string) => void;
  moveRow: (sectionId: string, rowId: string, direction: 'up' | 'down') => void;
  
  // Column Actions
  addColumn: (sectionId: string, rowId: string, columnType?: 'full' | 'half' | 'third' | 'quarter') => string;
  updateColumn: (sectionId: string, rowId: string, columnId: string, props: any) => void;
  removeColumn: (sectionId: string, rowId: string, columnId: string) => void;
  
  // Block Actions
  addBlock: (sectionId: string, rowId: string, columnId: string, type: BlockType) => void;
  updateBlock: (sectionId: string, rowId: string, columnId: string, blockId: string, props: any) => void;
  removeBlock: (sectionId: string, rowId: string, columnId: string, blockId: string) => void;
  moveBlock: (sectionId: string, rowId: string, columnId: string, blockId: string, direction: 'up' | 'down') => void;
  
  // General Actions
  selectElement: (type: 'section' | 'row' | 'column' | 'block', id: string) => void;
  clearSelection: () => void;
  undo: () => void;
  redo: () => void;
  setSaving: (saving: boolean) => void;
  setPublished: (published: boolean) => void;
  loadLayout: (sections: Section[]) => void;
}

export const useBuilderStore = create<BuilderState>((set, get) => ({
  sections: [],
  history: [],
  historyIndex: -1,
  isSaving: false,
  isPublished: false,
  selectedElement: null,

  // Helper function to save current state to history
  saveToHistory: (newSections: Section[]) => {
    const { history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(newSections)));
    
    set({
      sections: newSections,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  // Helper function to get column width based on type
  getColumnWidth: (columnType: 'full' | 'half' | 'third' | 'quarter'): string => {
    switch (columnType) {
      case 'full': return 'full';
      case 'half': return '1/2';
      case 'third': return '1/3';
      case 'quarter': return '1/4';
      default: return 'full';
    }
  },

  // Helper function to get column count based on row type
  getColumnCount: (rowType: 'single' | 'two-column' | 'three-column'): number => {
    switch (rowType) {
      case 'single': return 1;
      case 'two-column': return 2;
      case 'three-column': return 3;
      default: return 1;
    }
  },

  // Section Actions
  addSection: (type: Section['type'] = 'default') => {
    const { sections } = get();
    const newSection: Section = {
      id: Math.random().toString(36).slice(2),
      type,
      props: {
        backgroundColor: '#ffffff',
        padding: 'py-16',
        maxWidth: 'max-w-7xl'
      },
      rows: []
    };
    
    get().saveToHistory([...sections, newSection]);
  },

  updateSection: (sectionId: string, props: any) => {
    const { sections } = get();
    const newSections = sections.map((section) =>
      section.id === sectionId 
        ? { ...section, props: { ...section.props, ...props } }
        : section
    );
    
    get().saveToHistory(newSections);
  },

  removeSection: (sectionId: string) => {
    const { sections } = get();
    const newSections = sections.filter((section) => section.id !== sectionId);
    get().saveToHistory(newSections);
  },

  moveSection: (sectionId: string, direction: 'up' | 'down') => {
    const { sections } = get();
    const currentIndex = sections.findIndex((s) => s.id === sectionId);
    if (currentIndex === -1) return;

    const newSections = [...sections];
    if (direction === 'up' && currentIndex > 0) {
      [newSections[currentIndex], newSections[currentIndex - 1]] = 
      [newSections[currentIndex - 1], newSections[currentIndex]];
    } else if (direction === 'down' && currentIndex < sections.length - 1) {
      [newSections[currentIndex], newSections[currentIndex + 1]] = 
      [newSections[currentIndex + 1], newSections[currentIndex]];
    }
    
    get().saveToHistory(newSections);
  },

  // Row Actions
  addRow: (sectionId: string, rowType: 'single' | 'two-column' | 'three-column' = 'single') => {
    const { sections } = get();
    const columnCount = get().getColumnCount(rowType);
    let newRowId = '';
    const newSections = sections.map((section) => {
      if (section.id === sectionId) {
        const newRow: Row = {
          id: Math.random().toString(36).slice(2),
          columns: Array.from({ length: columnCount }, () => ({
            id: Math.random().toString(36).slice(2),
            width: columnCount === 1 ? 'full' : `${1 / columnCount}`,
            blocks: [],
            props: {} // <-- Initialize props
          })),
          props: {} // <-- Initialize props
        };
        newRowId = newRow.id;
        return { ...section, rows: [...section.rows, newRow] };
      }
      return section;
    });
    get().saveToHistory(newSections);
    return newRowId;
  },

  updateRow: (sectionId: string, rowId: string, props: any) => {
    const { sections } = get();
    const newSections = sections.map((section) => {
      if (section.id === sectionId) {
        return {
          ...section,
          rows: section.rows.map((row) =>
            row.id === rowId ? { ...row, ...props } : row
          )
        };
      }
      return section;
    });
    
    get().saveToHistory(newSections);
  },

  removeRow: (sectionId: string, rowId: string) => {
    const { sections } = get();
    const newSections = sections.map((section) => {
      if (section.id === sectionId) {
        return {
          ...section,
          rows: section.rows.filter((row) => row.id !== rowId)
        };
      }
      return section;
    });
    
    get().saveToHistory(newSections);
  },

  moveRow: (sectionId: string, rowId: string, direction: 'up' | 'down') => {
    const { sections } = get();
    const newSections = sections.map((section) => {
      if (section.id === sectionId) {
        const currentIndex = section.rows.findIndex((r) => r.id === rowId);
        if (currentIndex === -1) return section;

        const newRows = [...section.rows];
        if (direction === 'up' && currentIndex > 0) {
          [newRows[currentIndex], newRows[currentIndex - 1]] = 
          [newRows[currentIndex - 1], newRows[currentIndex]];
        } else if (direction === 'down' && currentIndex < section.rows.length - 1) {
          [newRows[currentIndex], newRows[currentIndex + 1]] = 
          [newRows[currentIndex + 1], newRows[currentIndex]];
        }
        
        return { ...section, rows: newRows };
      }
      return section;
    });
    
    get().saveToHistory(newSections);
  },

  // Column Actions
  addColumn: (sectionId: string, rowId: string, columnType: 'full' | 'half' | 'third' | 'quarter' = 'full') => {
    const { sections } = get();
    const width = get().getColumnWidth(columnType);
    let newColumnId = '';
    const newSections = sections.map((section) => {
      if (section.id === sectionId) {
        return {
          ...section,
          rows: section.rows.map((row) => {
            if (row.id === rowId) {
              const newColumn: Column = {
                id: Math.random().toString(36).slice(2),
                width,
                blocks: [],
                props: {} // <-- Initialize props
              };
              newColumnId = newColumn.id;
              return { ...row, columns: [...row.columns, newColumn] };
            }
            return row;
          })
        };
      }
      return section;
    });
    get().saveToHistory(newSections);
    return newColumnId;
  },

  updateColumn: (sectionId: string, rowId: string, columnId: string, props: any) => {
    const { sections } = get();
    const newSections = sections.map((section) => {
      if (section.id === sectionId) {
        return {
          ...section,
          rows: section.rows.map((row) => {
            if (row.id === rowId) {
              return {
                ...row,
                columns: row.columns.map((column) =>
                  column.id === columnId ? { ...column, ...props } : column
                )
              };
            }
            return row;
          })
        };
      }
      return section;
    });
    
    get().saveToHistory(newSections);
  },

  removeColumn: (sectionId: string, rowId: string, columnId: string) => {
    const { sections } = get();
    const newSections = sections.map((section) => {
      if (section.id === sectionId) {
        return {
          ...section,
          rows: section.rows.map((row) => {
            if (row.id === rowId) {
              return {
                ...row,
                columns: row.columns.filter((column) => column.id !== columnId)
              };
            }
            return row;
          })
        };
      }
      return section;
    });
    
    get().saveToHistory(newSections);
  },

  // Block Actions
  addBlock: (sectionId: string, rowId: string, columnId: string, type: BlockType) => {
    const { sections } = get();
    const newBlock: Block = {
      id: Math.random().toString(36).slice(2),
      type,
      props: getDefaultBlockProps(type)
    };
    
    const newSections = sections.map((section) => {
      if (section.id === sectionId) {
        return {
          ...section,
          rows: section.rows.map((row) => {
            if (row.id === rowId) {
              return {
                ...row,
                columns: row.columns.map((column) => {
                  if (column.id === columnId) {
                    return { ...column, blocks: [...column.blocks, newBlock] };
                  }
                  return column;
                })
              };
            }
            return row;
          })
        };
      }
      return section;
    });
    
    get().saveToHistory(newSections);
  },

  updateBlock: (sectionId: string, rowId: string, columnId: string, blockId: string, props: any) => {
    const { sections } = get();
    const newSections = sections.map((section) => {
      if (section.id === sectionId) {
        return {
          ...section,
          rows: section.rows.map((row) => {
            if (row.id === rowId) {
              return {
                ...row,
                columns: row.columns.map((column) => {
                  if (column.id === columnId) {
                    return {
                      ...column,
                      blocks: column.blocks.map((block) =>
                        block.id === blockId 
                          ? { ...block, props: { ...block.props, ...props } }
                          : block
                      )
                    };
                  }
                  return column;
                })
              };
            }
            return row;
          })
        };
      }
      return section;
    });
    
    get().saveToHistory(newSections);
  },

  removeBlock: (sectionId: string, rowId: string, columnId: string, blockId: string) => {
    const { sections } = get();
    const newSections = sections.map((section) => {
      if (section.id === sectionId) {
        return {
          ...section,
          rows: section.rows.map((row) => {
            if (row.id === rowId) {
              return {
                ...row,
                columns: row.columns.map((column) => {
                  if (column.id === columnId) {
                    return {
                      ...column,
                      blocks: column.blocks.filter((block) => block.id !== blockId)
                    };
                  }
                  return column;
                })
              };
            }
            return row;
          })
        };
      }
      return section;
    });
    
    get().saveToHistory(newSections);
  },

  moveBlock: (sectionId: string, rowId: string, columnId: string, blockId: string, direction: 'up' | 'down') => {
    const { sections } = get();
    const newSections = sections.map((section) => {
      if (section.id === sectionId) {
        return {
          ...section,
          rows: section.rows.map((row) => {
            if (row.id === rowId) {
              return {
                ...row,
                columns: row.columns.map((column) => {
                  if (column.id === columnId) {
                    const currentIndex = column.blocks.findIndex((b) => b.id === blockId);
                    if (currentIndex === -1) return column;

                    const newBlocks = [...column.blocks];
                    if (direction === 'up' && currentIndex > 0) {
                      [newBlocks[currentIndex], newBlocks[currentIndex - 1]] = 
                      [newBlocks[currentIndex - 1], newBlocks[currentIndex]];
                    } else if (direction === 'down' && currentIndex < column.blocks.length - 1) {
                      [newBlocks[currentIndex], newBlocks[currentIndex + 1]] = 
                      [newBlocks[currentIndex + 1], newBlocks[currentIndex]];
                    }
                    
                    return { ...column, blocks: newBlocks };
                  }
                  return column;
                })
              };
            }
            return row;
          })
        };
      }
      return section;
    });
    
    get().saveToHistory(newSections);
  },

  // General Actions
  selectElement: (type: 'section' | 'row' | 'column' | 'block', id: string) => {
    set({ selectedElement: { type, id } });
  },

  clearSelection: () => {
    set({ selectedElement: null });
  },

  undo: () => {
    const { historyIndex } = get();
    if (historyIndex > 0) {
      set({
        sections: JSON.parse(JSON.stringify(get().history[historyIndex - 1])),
        historyIndex: historyIndex - 1,
      });
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      set({
        sections: JSON.parse(JSON.stringify(history[historyIndex + 1])),
        historyIndex: historyIndex + 1,
      });
    }
  },

  setSaving: (saving: boolean) => {
    set({ isSaving: saving });
  },

  setPublished: (published: boolean) => {
    set({ isPublished: published });
  },

  loadLayout: (sections: Section[]) => {
    // Ensure all sections have required properties
    const validatedSections = sections.map((section) => ({
      ...section,
      props: section.props || {
        backgroundColor: '#ffffff',
        padding: 'py-16',
        maxWidth: 'max-w-7xl'
      },
      rows: section.rows || []
    }));
    
    set({
      sections: validatedSections,
      history: [validatedSections],
      historyIndex: 0,
    });
  },
}));

// Helper function to get default block properties
function getDefaultBlockProps(type: BlockType) {
  switch (type) {
    case 'text':
      return { 
        text: 'Enter your text here',
        fontSize: '16px',
        fontFamily: 'Inter',
        fontWeight: '400',
        color: '#374151',
        textAlign: 'left',
        lineHeight: '1.6',
        maxWidth: '100%'
      };
    case 'heading':
      return { 
        text: 'Enter your heading',
        level: 'h2',
        fontSize: '32px',
        fontFamily: 'Inter',
        fontWeight: '700',
        color: '#111827',
        textAlign: 'left',
        marginBottom: '16px'
      };
    case 'subheading':
      return { 
        text: 'Enter your subheading',
        fontSize: '24px',
        fontFamily: 'Inter',
        fontWeight: '600',
        color: '#374151',
        textAlign: 'left',
        marginBottom: '12px',
        shadow: false
      };
    case 'rich-text':
      return { 
        content: '<p>Enter your rich text content here</p>',
        fontSize: '16px',
        fontFamily: 'Inter',
        fontWeight: '400',
        color: '#374151',
        lineHeight: '1.6'
      };
    case 'button':
      return { 
        text: 'Click me',
        backgroundColor: '#3B82F6',
        textColor: '#FFFFFF',
        fontSize: '16px',
        fontWeight: '600',
        padding: '12px 24px',
        borderRadius: '8px',
        border: 'none',
        shadow: true,
        hoverBackground: '#2563EB',
        linkType: 'url',
        linkUrl: '#',
        openInNewTab: false
      };
    case 'link':
      return { 
        text: 'Click here',
        url: '#',
        openInNewTab: false,
        style: 'text',
        fontSize: '16px',
        fontWeight: '400',
        color: '#3B82F6',
        underline: true,
        hoverColor: '#2563EB'
      };
    case 'divider':
      return { 
        type: 'solid',
        thickness: '1px',
        color: '#E5E7EB',
        width: '100%',
        marginTop: '24px',
        marginBottom: '24px',
        alignment: 'center'
      };
    case 'spacer':
      return { 
        height: '40px',
        unit: 'px',
        visibleOnMobile: true
      };
    case 'bullet-list':
      return { 
        items: [
          { text: 'First item', icon: '•', color: '#6B7280' },
          { text: 'Second item', icon: '•', color: '#6B7280' },
          { text: 'Third item', icon: '•', color: '#6B7280' }
        ],
        columns: 1,
        fontSize: '16px',
        fontFamily: 'Inter',
        fontWeight: '400',
        color: '#374151',
        spacing: '8px'
      };
    case 'numbered-list':
      return { 
        items: [
          { text: 'First item' },
          { text: 'Second item' },
          { text: 'Third item' }
        ],
        fontSize: '16px',
        fontFamily: 'Inter',
        fontWeight: '400',
        color: '#374151',
        spacing: '8px',
        animation: false
      };
    case 'quote':
      return { 
        text: 'This is an amazing quote that will inspire your audience.',
        author: 'Author Name',
        fontSize: '18px',
        fontFamily: 'Inter',
        fontWeight: '400',
        color: '#374151',
        backgroundColor: '#F9FAFB',
        padding: '24px',
        borderRadius: '8px',
        showQuotes: true,
        alignment: 'left'
      };
    case 'badge':
      return { 
        text: 'New',
        backgroundColor: '#EF4444',
        textColor: '#FFFFFF',
        fontSize: '12px',
        fontWeight: '600',
        padding: '4px 8px',
        borderRadius: '12px',
        border: 'none'
      };
    case 'icon':
      return { 
        icon: 'star',
        size: '24px',
        color: '#6B7280',
        alignment: 'left',
        marginTop: '0px',
        marginBottom: '0px',
        marginLeft: '0px',
        marginRight: '0px',
        animation: false
      };
    case 'navigation-bar':
      return {
        backgroundColor: '#ffffff',
        color: '#111827',
        fontFamily: 'Inter',
        fontWeight: '600',
        fontSize: '18px',
        padding: '16px',
        logoUrl: '',
        logoLink: '',
        menuItems: [
          { text: 'Home', url: '#' },
          { text: 'About', url: '#' },
          { text: 'Contact', url: '#' },
        ],
        fixed: false,
        menuAlign: 'justify-end',
      };
    case 'header':
      return {
        headline: 'Header Headline',
        subtitle: 'Header subtitle or description',
        ctaText: 'Get Started',
        ctaUrl: '#',
        backgroundColor: '#f9fafb',
        backgroundImage: '',
        backgroundVideo: '',
        color: '#111827',
        fontFamily: 'Inter',
        fontWeight: '700',
        fontSize: '32px',
        padding: '32px',
        textAlign: 'center',
      };
    case 'logo':
      return {
        imageUrl: '',
        link: '',
        width: 64,
        height: 64,
        padding: '',
        margin: '',
      };
    case 'menu':
      return {
        menuItems: [
          { text: 'Menu 1', url: '#' },
          { text: 'Menu 2', url: '#' },
          { text: 'Menu 3', url: '#' },
        ],
        fontWeight: 500,
      };
    case 'breadcrumb':
      return {
        items: [
          { text: 'Home', url: '#' },
          { text: 'Page', url: '#' },
        ],
        separator: '>',
        color: '#6b7280',
      };
    case 'footer':
      return {
        text: 'Footer content here',
        links: [
          { text: 'Link 1', url: '#' },
          { text: 'Link 2', url: '#' },
        ],
        backgroundColor: '#f9fafb',
        color: '#111827',
        fontFamily: 'Inter',
        fontWeight: '400',
        fontSize: '16px',
        padding: '24px',
      };
    case 'image':
      return {
        imageUrl: '',
        alt: '',
        width: 400,
        height: 300,
        objectFit: 'cover',
        alignment: 'center',
        borderRadius: '',
        border: '',
        boxShadow: '',
        backgroundOverlayOpacity: 0.4,
        link: '',
        margin: '',
        padding: '',
      };
    case 'image-gallery':
      return {
        images: [],
        columns: 3,
        gap: 8,
        backgroundOverlayOpacity: 0.4,
      };
    case 'video-embed':
      return {
        url: '',
        controls: true,
        autoplay: false,
        mute: false,
        loop: false,
        lazy: true,
        backgroundOverlayOpacity: 0.4,
        width: 640,
        height: 360,
      };
    case 'video-upload':
      return {
        fileUrl: '',
        controls: true,
        autoplay: false,
        mute: false,
        loop: false,
        lazy: true,
        backgroundOverlayOpacity: 0.4,
        width: 640,
        height: 360,
      };
    case 'background-video':
      return {
        fileUrl: '',
        controls: false,
        autoplay: true,
        mute: true,
        loop: true,
        lazy: true,
        backgroundOverlayOpacity: 0.4,
        width: '100%',
        height: 360,
      };
    case 'icon-box':
      return {
        icon: 'star',
        iconSize: 40,
        iconColor: '#6366f1',
        iconBg: '#f3f4f6',
        layout: 'icon-top',
        title: '',
        description: '',
        backgroundOverlayOpacity: 0.4,
      };
    case 'image-text':
      return {
        imageUrl: '',
        text: '',
        imagePosition: 'left',
        backgroundOverlayOpacity: 0.4,
      };
    case 'logo-carousel':
      return {
        logos: [],
        autoplay: true,
        speed: 2000,
        backgroundOverlayOpacity: 0.4,
      };
    case 'audio-player':
      return {
        fileUrl: '',
        controls: true,
        autoplay: false,
        loop: false,
        backgroundOverlayOpacity: 0.4,
      };
  }
} 