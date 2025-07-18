import React, { useState } from 'react';
import { BlockType, Section } from '../../lib/builderStore';

interface ComponentSidebarProps {
  onAddSection?: (type: 'default' | 'hero' | 'features' | 'testimonials' | 'contact') => void;
  onAddRow?: (sectionId: string, columnCount: number) => void;
  onAddColumn?: (sectionId: string, rowId: string, width: 'full' | 'half' | 'third' | 'quarter') => void;
  onAddBlock?: (sectionId: string, rowId: string, columnId: string, type: BlockType) => void;
  selectedElement?: {
    type: 'section' | 'row' | 'column' | 'block';
    id: string;
  } | null;
  sections?: Section[];
}

const ComponentSidebar: React.FC<ComponentSidebarProps> = ({ 
  onAddSection, 
  onAddRow,
  onAddColumn,
  onAddBlock, 
  selectedElement,
  sections
}) => {
  const [showRowSettings, setShowRowSettings] = useState(false);
  const [showColumnSettings, setShowColumnSettings] = useState(false);

  // Remove old layout category and add new Layout elements
  const layoutElements = [
    {
      type: 'navigation-bar',
      name: 'Navigation Bar',
      description: 'Top navigation with logo, menu, and responsive options',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16" /></svg>
      ),
    },
    {
      type: 'header',
      name: 'Header',
      description: 'Large headline, subtitle, background, CTA',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16" /></svg>
      ),
    },
    {
      type: 'logo',
      name: 'Logo',
      description: 'Image/logo with link and size controls',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth={2} fill="none" /></svg>
      ),
    },
    {
      type: 'menu',
      name: 'Menu',
      description: 'Navigation links, dropdowns, font/hover/active color',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" /></svg>
      ),
    },
    {
      type: 'breadcrumb',
      name: 'Breadcrumb',
      description: 'Dynamic steps, font/separator, hide on mobile',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
      ),
    },
    {
      type: 'footer',
      name: 'Footer',
      description: '1-4 columns, text, links, icons, background',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 20h16M4 16h16" /></svg>
      ),
    },
    {
      type: 'section',
      name: 'Section',
      description: 'Full-width or boxed, background, padding, z-index',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="4" y="6" width="16" height="12" rx="2" stroke="currentColor" strokeWidth={2} fill="none" /></svg>
      ),
    },
    {
      type: 'row',
      name: 'Row',
      description: 'Drag inside section, up to 4 columns, responsive',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="4" y="10" width="16" height="4" rx="1" stroke="currentColor" strokeWidth={2} fill="none" /></svg>
      ),
    },
    {
      type: 'column',
      name: 'Column',
      description: 'Drag inside row, supports custom width',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="8" y="4" width="8" height="16" rx="2" stroke="currentColor" strokeWidth={2} fill="none" /></svg>
      ),
    },
  ];

  const columnWidths = [
    {
      type: 'full' as const,
      name: 'Full Width',
      description: '100% width',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      ),
    },
    {
      type: 'half' as const,
      name: 'Half Width',
      description: '50% width',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h8M4 10h8M4 14h8M4 18h8" />
        </svg>
      ),
    },
    {
      type: 'third' as const,
      name: 'One Third',
      description: '33.33% width',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h6M4 10h6M4 14h6M4 18h6" />
        </svg>
      ),
    },
    {
      type: 'quarter' as const,
      name: 'One Quarter',
      description: '25% width',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h4M4 10h4M4 14h4M4 18h4" />
        </svg>
      ),
    },
  ];

  const basicElements = [
    {
      type: 'heading' as BlockType,
      name: 'Heading',
      description: 'Main title with inline editing',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      ),
    },
    {
      type: 'subheading' as BlockType,
      name: 'Subheading',
      description: 'Secondary title with styling',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h12M4 10h12M4 14h12M4 18h12" />
        </svg>
      ),
    },
    {
      type: 'text' as BlockType,
      name: 'Text',
      description: 'Paragraph with rich formatting',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      type: 'rich-text' as BlockType,
      name: 'Rich Text',
      description: 'Advanced text editor with toolbar',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
    },
    {
      type: 'button' as BlockType,
      name: 'Button',
      description: 'Call-to-action with styling',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
    },
    {
      type: 'link' as BlockType,
      name: 'Link',
      description: 'Text or button-style link',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      ),
    },
    {
      type: 'divider' as BlockType,
      name: 'Divider',
      description: 'Horizontal line separator',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      ),
    },
    {
      type: 'spacer' as BlockType,
      name: 'Spacer',
      description: 'Vertical space control',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
    },
    {
      type: 'bullet-list' as BlockType,
      name: 'Bullet List',
      description: 'Unordered list with icons',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      ),
    },
    {
      type: 'numbered-list' as BlockType,
      name: 'Numbered List',
      description: 'Ordered list with auto-numbering',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
      ),
    },
    {
      type: 'quote' as BlockType,
      name: 'Quote',
      description: 'Blockquote with author',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
    },
    {
      type: 'badge' as BlockType,
      name: 'Badge',
      description: 'Small label or tag',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
    },
    {
      type: 'icon' as BlockType,
      name: 'Icon',
      description: 'Single icon with styling',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
  ];

  // Media Elements category
  const mediaElements = [
    {
      type: 'image',
      name: 'Image',
      description: 'Upload or paste image URL, resize, fit, align, alt text, lightbox',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth={2} fill="none" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>
      ),
    },
    {
      type: 'image-gallery',
      name: 'Image Gallery',
      description: 'Grid or carousel, click-to-enlarge, responsive, hover effects',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth={2} fill="none" /><rect x="7" y="7" width="3" height="3" /><rect x="14" y="7" width="3" height="3" /><rect x="7" y="14" width="3" height="3" /><rect x="14" y="14" width="3" height="3" /></svg>
      ),
    },
    {
      type: 'video-embed',
      name: 'Video Embed',
      description: 'Embed YouTube, Vimeo, Facebook, responsive, controls',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth={2} fill="none" /><polygon points="10,8 16,12 10,16" fill="currentColor" /></svg>
      ),
    },
    {
      type: 'video-upload',
      name: 'Video Upload',
      description: 'Upload .mp4/.webm, custom thumbnail, self-hosted',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth={2} fill="none" /><polygon points="10,8 16,12 10,16" fill="currentColor" /><rect x="7" y="17" width="10" height="2" rx="1" /></svg>
      ),
    },
    {
      type: 'icon-box',
      name: 'Icon Box',
      description: 'Icon + title/desc, size/color/bg, layouts',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="4" stroke="currentColor" strokeWidth={2} fill="none" /><circle cx="12" cy="12" r="5" /></svg>
      ),
    },
    {
      type: 'logo-carousel',
      name: 'Logo Carousel',
      description: 'Auto-scroll logos, upload up to 12, hover effects',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="10" width="18" height="4" rx="2" stroke="currentColor" strokeWidth={2} fill="none" /><circle cx="7" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="17" cy="12" r="2" /></svg>
      ),
    },
    {
      type: 'audio-player',
      name: 'Audio Player',
      description: 'Upload/embed audio, simple player, responsive',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth={2} fill="none" /><polygon points="10,8 16,12 10,16" fill="currentColor" /><rect x="7" y="17" width="10" height="2" rx="1" /></svg>
      ),
    },
  ];

  const handleDragStart = (e: React.DragEvent, dragType: string, data: any) => {
    e.dataTransfer.setData('dragType', dragType);
    e.dataTransfer.setData('dragData', JSON.stringify(data));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleAddSection = (type: 'default' | 'hero' | 'features' | 'testimonials' | 'contact') => {
    if (onAddSection) {
      onAddSection(type);
    }
  };

  const handleAddRow = (columnCount: number) => {
    if (onAddRow && selectedElement?.type === 'section' && selectedElement?.id) {
      onAddRow(selectedElement.id, columnCount);
      setShowRowSettings(false);
    }
  };

  const handleAddColumn = (width: 'full' | 'half' | 'third' | 'quarter') => {
    if (onAddColumn && selectedElement?.type === 'row' && selectedElement?.id && sections) {
      // Find the parent section for the selected row
      for (const section of sections) {
        for (const row of section.rows) {
          if (row.id === selectedElement.id) {
            onAddColumn(section.id, row.id, width);
            setShowColumnSettings(false);
            return;
          }
        }
      }
    }
  };

  // Find parent section/row/column for the selected column
  const handleAddBlock = (type: BlockType) => {
    if (
      onAddBlock &&
      selectedElement?.type === 'column' &&
      selectedElement?.id &&
      sections
    ) {
      for (const section of sections) {
        for (const row of section.rows) {
          for (const column of row.columns) {
            if (column.id === selectedElement.id) {
              onAddBlock(section.id, row.id, column.id, type);
              return;
            }
          }
        }
      }
    }
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return {
          bg: 'bg-blue-100',
          hoverBg: 'group-hover:bg-blue-200',
          text: 'text-blue-600',
          border: 'hover:border-blue-300',
          hoverText: 'group-hover:text-blue-700'
        };
      case 'green':
        return {
          bg: 'bg-green-100',
          hoverBg: 'group-hover:bg-green-200',
          text: 'text-green-600',
          border: 'hover:border-green-300',
          hoverText: 'group-hover:text-green-700'
        };
      case 'yellow':
        return {
          bg: 'bg-yellow-100',
          hoverBg: 'group-hover:bg-yellow-200',
          text: 'text-yellow-600',
          border: 'hover:border-yellow-300',
          hoverText: 'group-hover:text-yellow-700'
        };
      default:
        return {
          bg: 'bg-gray-100',
          hoverBg: 'group-hover:bg-gray-200',
          text: 'text-gray-600',
          border: 'hover:border-gray-300',
          hoverText: 'group-hover:text-gray-700'
        };
    }
  };

  return (
    <div className="bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="p-6 border-b border-gray-200 flex-shrink-0">
        <h3 className="text-lg font-semibold text-gray-900">Elements</h3>
        <p className="text-sm text-gray-500 mt-1">Drag elements to build your page</p>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6">
          {/* Layout Elements */}
          <div className="mb-8">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Layout</h3>
            <div className="space-y-2">
              {layoutElements.map((el) => (
                <div
                  key={el.type}
                  className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-blue-50 transition group"
                  draggable
                  onDragStart={e => {
                    e.dataTransfer.setData('dragType', el.type);
                    e.dataTransfer.setData('dragData', JSON.stringify({ type: el.type }));
                  }}
                  onClick={() => selectedElement?.type === 'column' && handleAddBlock(el.type as BlockType)}
                >
                  <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-md">
                    {el.icon}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 text-sm">{el.name}</div>
                    <div className="text-xs text-gray-500">{el.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Basic Elements */}
          <div className="mb-8">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Basic Elements</h3>
            <div className="space-y-2">
              {basicElements.map((element) => (
                <div
                  key={element.type}
                  className="group relative"
                >
                  <div
                    className="flex items-center p-3 bg-gray-50 border border-gray-200 rounded-lg cursor-move hover:bg-purple-50 hover:border-purple-300 transition-all duration-200"
                    draggable
                    onDragStart={(e) => handleDragStart(e, 'block', { type: element.type })}
                    onClick={() => selectedElement?.type === 'column' && handleAddBlock(element.type)}
                  >
                    <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-md mr-3 group-hover:bg-purple-200 transition-colors">
                      <div className="text-purple-600">
                        {element.icon}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="font-medium text-gray-900 text-sm truncate group-hover:text-purple-700 transition-colors">
                        {element.name}
                      </h5>
                      <p className="text-xs text-gray-500 truncate">{element.description}</p>
                    </div>
                    <div className="text-gray-400 group-hover:text-purple-500 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {selectedElement?.type !== 'column' && (
              <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <div className="flex-shrink-0">
                    <svg className="w-4 h-4 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-blue-700">
                      Drag elements to any column, or click to add when a column is selected.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Media Elements */}
          <div className="mb-8">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Media Elements</h3>
            <div className="space-y-2">
              {mediaElements.map((el) => (
                <div
                  key={el.type}
                  className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-purple-50 transition group"
                  draggable
                  onDragStart={e => {
                    e.dataTransfer.setData('dragType', el.type);
                    e.dataTransfer.setData('dragData', JSON.stringify({ type: el.type }));
                  }}
                  onClick={() => {
                    if (selectedElement?.type === 'column' && onAddBlock && sections) {
                      let found = false;
                      for (const section of sections) {
                        for (const row of section.rows) {
                          for (const column of row.columns) {
                            if (column.id === selectedElement.id) {
                              onAddBlock(section.id, row.id, column.id, el.type as BlockType);
                              found = true;
                              break;
                            }
                          }
                          if (found) break;
                        }
                        if (found) break;
                      }
                    }
                  }}
                >
                  <div className="w-8 h-8 flex items-center justify-center bg-purple-100 rounded-md">
                    {el.icon}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 text-sm">{el.name}</div>
                    <div className="text-xs text-gray-500">{el.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Row Settings Modal */}
          {showRowSettings && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Row</h3>
                <p className="text-sm text-gray-600 mb-4">Choose how many columns you want in this row:</p>
                <div className="space-y-2">
                  {[1, 2, 3, 4].map((count) => (
                    <button
                      key={count}
                      onClick={() => handleAddRow(count)}
                      className="w-full flex items-center p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-all duration-200"
                    >
                      <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-md mr-3">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        </svg>
                      </div>
                      <div className="flex-1 text-left">
                        <h5 className="font-medium text-gray-900 text-sm">{count} Column{count > 1 ? 's' : ''}</h5>
                        <p className="text-xs text-gray-500">Equal width columns</p>
                      </div>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setShowRowSettings(false)}
                  className="mt-4 w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Column Settings Modal */}
          {showColumnSettings && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Column</h3>
                <p className="text-sm text-gray-600 mb-4">Choose the width for this column:</p>
                <div className="space-y-2">
                  {columnWidths.map((width) => (
                    <button
                      key={width.type}
                      onClick={() => handleAddColumn(width.type)}
                      className="w-full flex items-center p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-yellow-50 hover:border-yellow-300 transition-all duration-200"
                    >
                      <div className="flex items-center justify-center w-8 h-8 bg-yellow-100 rounded-md mr-3">
                        <div className="text-yellow-600">
                          {width.icon}
                        </div>
                      </div>
                      <div className="flex-1 text-left">
                        <h5 className="font-medium text-gray-900 text-sm">{width.name}</h5>
                        <p className="text-xs text-gray-500">{width.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setShowColumnSettings(false)}
                  className="mt-4 w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-1">Quick Tip</h4>
            <p className="text-xs text-gray-600">
              Drag layout elements to the canvas. Click on rows/columns to configure them before adding.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComponentSidebar; 