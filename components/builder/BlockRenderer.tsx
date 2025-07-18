import React, { useState } from 'react';
import { Block, BlockType } from '../../lib/builderStore';

export interface BlockRendererProps {
  block: Block;
  isSelected: boolean;
  isPreviewMode: boolean;
  onUpdate: (props: any) => void;
  onRemove: () => void;
  onSelect: () => void;
}

const BlockRenderer: React.FC<BlockRendererProps> = ({
  block,
  isSelected,
  isPreviewMode,
  onUpdate,
  onRemove,
  onSelect,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isPreviewMode) {
      setIsEditing(true);
      setEditValue((block.props || {}).text || (block.props || {}).content || '');
    }
  };

  const handleEditSave = () => {
    if (block.type === 'rich-text') {
      onUpdate({ content: editValue });
    } else {
      onUpdate({ text: editValue });
    }
    setIsEditing(false);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditValue((block.props || {}).text || (block.props || {}).content || '');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEditSave();
    } else if (e.key === 'Escape') {
      handleEditCancel();
    }
  };

  const getFontFamily = (fontFamily: string) => {
    switch (fontFamily) {
      case 'Inter': return 'font-inter';
      case 'Roboto': return 'font-roboto';
      case 'Open Sans': return 'font-open-sans';
      case 'Montserrat': return 'font-montserrat';
      case 'Lato': return 'font-lato';
      default: return 'font-sans';
    }
  };

  const getFontWeight = (weight: string) => {
    switch (weight) {
      case '100': return 'font-thin';
      case '200': return 'font-extralight';
      case '300': return 'font-light';
      case '400': return 'font-normal';
      case '500': return 'font-medium';
      case '600': return 'font-semibold';
      case '700': return 'font-bold';
      case '800': return 'font-extrabold';
      case '900': return 'font-black';
      default: return 'font-normal';
    }
  };

  const getTextAlign = (align: string): 'left' | 'center' | 'right' | 'justify' => {
    switch (align) {
      case 'left': return 'left';
      case 'center': return 'center';
      case 'right': return 'right';
      case 'justify': return 'justify';
      default: return 'left';
    }
  };

  // Utility to get universal styles from block props
  const getUniversalBlockStyles = (props: any) => {
    const style: React.CSSProperties = {};
    // Typography
    if ((props || {}).fontFamily) style.fontFamily = (props || {}).fontFamily;
    if ((props || {}).fontSize) style.fontSize = (props || {}).fontSize;
    if ((props || {}).fontWeight) style.fontWeight = (props || {}).fontWeight;
    if ((props || {}).color) style.color = (props || {}).color;
    if ((props || {}).textAlign) style.textAlign = (props || {}).textAlign;
    if ((props || {}).lineHeight) style.lineHeight = (props || {}).lineHeight;
    if ((props || {}).letterSpacing) style.letterSpacing = (props || {}).letterSpacing;
    // Background
    if ((props || {}).backgroundColor) style.backgroundColor = (props || {}).backgroundColor;
    if ((props || {}).backgroundImage) style.backgroundImage = `url('${(props || {}).backgroundImage}')`;
    if ((props || {}).backgroundImage) style.backgroundSize = 'cover';
    if ((props || {}).backgroundImage) style.backgroundPosition = 'center';
    // Spacing
    if ((props || {}).padding) style.padding = (props || {}).padding;
    if ((props || {}).margin) style.margin = (props || {}).margin;
    // Border
    if ((props || {}).borderColor) style.borderColor = (props || {}).borderColor;
    if ((props || {}).borderWidth) style.borderWidth = (props || {}).borderWidth;
    if ((props || {}).borderStyle) style.borderStyle = (props || {}).borderStyle;
    if ((props || {}).borderRadius) style.borderRadius = (props || {}).borderRadius;
    // Shadow
    if ((props || {}).boxShadow) style.boxShadow = (props || {}).boxShadow;
    // Size & Layout
    if ((props || {}).width) style.width = (props || {}).width;
    if ((props || {}).maxWidth) style.maxWidth = (props || {}).maxWidth;
    if ((props || {}).height) style.height = (props || {}).height;
    if ((props || {}).display) style.display = (props || {}).display;
    if ((props || {}).zIndex) style.zIndex = (props || {}).zIndex;
    // Advanced
    if ((props || {}).customStyle) {
      try {
        // Accepts CSS string like 'background: red; color: white;'
        (props || {}).customStyle.split(';').forEach((rule: string) => {
          const [key, value] = rule.split(':');
          if (key && value) style[key.trim() as any] = value.trim();
        });
      } catch {}
    }
    return style;
  };

  // Universal className support
  const universalClass = (block.props || {}).customClass || '';
  // Universal style support
  const universalStyle = getUniversalBlockStyles(block.props || {});
  // Visibility
  if (((block.props || {}).showOnDesktop === false && typeof window !== 'undefined' && window.innerWidth >= 768)) return null;
  if (((block.props || {}).showOnMobile === false && typeof window !== 'undefined' && window.innerWidth < 768)) return null;

  // --- Inline editing and formatting for Heading, Subheading, Text, Rich Text blocks ---
  // Helper: Inline toolbar for formatting
  const InlineToolbar = ({ onFormat }: { onFormat: (cmd: string, value?: string) => void }) => (
    <div style={{ display: 'flex', gap: 4, background: '#fff', border: '1px solid #ddd', borderRadius: 4, padding: 4, position: 'absolute', zIndex: 10 }}>
      <button type="button" onMouseDown={e => { e.preventDefault(); onFormat('bold'); }}><b>B</b></button>
      <button type="button" onMouseDown={e => { e.preventDefault(); onFormat('italic'); }}><i>I</i></button>
      <button type="button" onMouseDown={e => { e.preventDefault(); onFormat('underline'); }}><u>U</u></button>
      <input type="color" onChange={e => onFormat('foreColor', e.target.value)} style={{ width: 24, height: 24, border: 'none', background: 'none' }} />
    </div>
  );

  const renderBlock = () => {
    switch (block.type) {
      case 'heading': {
        const HeadingTag = (block.props || {}).level || 'h2';
        return (
          <div className={`p-4 border border-gray-200 rounded-lg shadow-sm cursor-pointer hover:border-blue-300 transition-colors ${universalClass}`}
            style={universalStyle}
            onClick={handleClick}
          >
            <HeadingTag 
              contentEditable={!isPreviewMode}
              suppressContentEditableWarning
              style={universalStyle}
              onInput={e => onUpdate({ text: (e.target as HTMLElement).innerText })}
              onBlur={e => onUpdate({ text: (e.target as HTMLElement).innerText })}
              onFocus={e => setIsEditing(true)}
              onKeyDown={e => {
                if (e.key === 'Enter') e.preventDefault();
              }}
            >
              {(block.props || {}).text || 'Enter your heading'}
            </HeadingTag>
            {isEditing && !isPreviewMode && <InlineToolbar onFormat={cmd => document.execCommand(cmd)} />}
            </div>
          );
        }
      case 'subheading': {
        return (
          <div className={`p-4 border border-gray-200 rounded-lg shadow-sm cursor-pointer hover:border-blue-300 transition-colors ${universalClass}`}
            style={universalStyle}
            onClick={handleClick}
          >
            <h3 
              contentEditable={!isPreviewMode}
              suppressContentEditableWarning
              style={universalStyle}
              onInput={e => onUpdate({ text: (e.target as HTMLElement).innerText })}
              onBlur={e => onUpdate({ text: (e.target as HTMLElement).innerText })}
              onFocus={e => setIsEditing(true)}
              onKeyDown={e => {
                if (e.key === 'Enter') e.preventDefault();
              }}
            >
              {(block.props || {}).text || 'Enter your subheading'}
            </h3>
            {isEditing && !isPreviewMode && <InlineToolbar onFormat={cmd => document.execCommand(cmd)} />}
          </div>
        );
      }
      case 'text': {
          return (
          <div className={`p-4 border border-gray-200 rounded-lg shadow-sm cursor-pointer hover:border-blue-300 transition-colors ${universalClass}`}
            style={universalStyle}
            onClick={handleClick}
          >
            <div
              contentEditable={!isPreviewMode}
              suppressContentEditableWarning
              style={universalStyle}
              onInput={e => onUpdate({ text: (e.target as HTMLElement).innerHTML })}
              onBlur={e => onUpdate({ text: (e.target as HTMLElement).innerHTML })}
              onFocus={e => setIsEditing(true)}
            >
              {(block.props || {}).text || '<p>Enter your text here</p>'}
            </div>
            {isEditing && !isPreviewMode && <InlineToolbar onFormat={cmd => document.execCommand(cmd)} />}
            </div>
          );
        }
      case 'rich-text': {
        return (
          <div className={`p-4 border border-gray-200 rounded-lg shadow-sm cursor-pointer hover:border-blue-300 transition-colors ${universalClass}`}
            style={universalStyle}
            onClick={handleClick}
          >
            <div 
              contentEditable={!isPreviewMode}
              suppressContentEditableWarning
              style={universalStyle}
              onInput={e => onUpdate({ content: (e.target as HTMLElement).innerHTML })}
              onBlur={e => onUpdate({ content: (e.target as HTMLElement).innerHTML })}
              onFocus={e => setIsEditing(true)}
            >
              {(block.props || {}).content || '<p>Enter your rich text content here</p>'}
            </div>
            {isEditing && !isPreviewMode && <InlineToolbar onFormat={cmd => document.execCommand(cmd)} />}
          </div>
        );
      }

      case 'button':
        // Only apply container background if customContainerBackground is set, otherwise transparent
        const containerStyle = { ...universalStyle };
        if (!((block.props || {}).customContainerBackground && containerStyle.backgroundColor)) {
          containerStyle.backgroundColor = 'transparent';
        }
        if ((block.props || {}).customContainerBackground) {
          containerStyle.backgroundColor = (block.props || {}).customContainerBackground;
        }
        return (
          <div className={`p-4 border border-gray-200 rounded-lg shadow-sm ${universalClass}`} style={containerStyle}>
            <button
              className="transition-all duration-200 hover:scale-105"
              style={{
                backgroundColor: (block.props || {}).backgroundColor || '#3B82F6',
                color: (block.props || {}).textColor || '#FFFFFF',
                fontSize: (block.props || {}).fontSize || '16px',
                fontWeight: getFontWeight((block.props || {}).fontWeight || '600'),
                padding: (block.props || {}).padding || '12px 24px',
                borderRadius: (block.props || {}).borderRadius || '8px',
                border: (block.props || {}).border || 'none',
                boxShadow: (block.props || {}).shadow ? '0 4px 6px rgba(0, 0, 0, 0.1)' : 'none',
                fontFamily: getFontFamily((block.props || {}).fontFamily || 'Inter'),
              }}
              onMouseEnter={(e) => {
                if ((block.props || {}).hoverBackground) {
                  e.currentTarget.style.backgroundColor = (block.props || {}).hoverBackground;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = (block.props || {}).backgroundColor || '#3B82F6';
              }}
            >
              {(block.props || {}).text || 'Click me'}
            </button>
          </div>
        );

      case 'link':
        const linkStyle = (block.props || {}).style === 'button' ? {
          backgroundColor: (block.props || {}).backgroundColor || '#3B82F6',
          color: (block.props || {}).textColor || '#FFFFFF',
          padding: '8px 16px',
          borderRadius: '6px',
          textDecoration: 'none',
          display: 'inline-block',
        } : {
          color: (block.props || {}).color || '#3B82F6',
          textDecoration: ((block.props || {}).underline ? 'underline' : 'none'),
        };

        return (
          <div className={`p-4 border border-gray-200 rounded-lg shadow-sm ${universalClass}`} style={universalStyle}>
            <a
              href={(block.props || {}).url || '#'}
              target={(block.props || {}).openInNewTab ? '_blank' : '_self'}
              rel={(block.props || {}).openInNewTab ? 'noopener noreferrer' : ''}
              className="transition-colors duration-200"
              style={{
                ...linkStyle,
                fontSize: (block.props || {}).fontSize || '16px',
                fontWeight: getFontWeight((block.props || {}).fontWeight || '400'),
                fontFamily: getFontFamily((block.props || {}).fontFamily || 'Inter'),
              }}
              onMouseEnter={(e) => {
                if ((block.props || {}).hoverColor) {
                  e.currentTarget.style.color = (block.props || {}).hoverColor;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = (block.props || {}).color || '#3B82F6';
              }}
            >
              {(block.props || {}).text || 'Click here'}
            </a>
          </div>
        );

      case 'divider':
        const dividerStyle = {
          borderTop: `${(block.props || {}).thickness || '1px'} ${(block.props || {}).type || 'solid'} ${(block.props || {}).color || '#E5E7EB'}`,
          width: (block.props || {}).width || '100%',
          marginTop: (block.props || {}).marginTop || '24px',
          marginBottom: (block.props || {}).marginBottom || '24px',
          textAlign: getTextAlign((block.props || {}).alignment || 'center'),
        };

        return (
          <div className={`p-4 border border-gray-200 rounded-lg shadow-sm ${universalClass}`} style={universalStyle}>
            <div style={dividerStyle} />
          </div>
        );

      case 'spacer':
        const spacerHeight = ((block.props || {}).unit === 'rem' 
          ? `${parseInt((block.props || {}).height || '40') * 16}px`
          : (block.props || {}).height || '40px');

        return (
          <div 
            className={`bg-white border border-gray-200 rounded-lg shadow-sm ${!((block.props || {}).visibleOnMobile ? false : true) && typeof window !== 'undefined' && window.innerWidth >= 768 ? 'hidden md:block' : ''} ${universalClass}`}
            style={{ height: spacerHeight, ...universalStyle }}
          />
        );

      case 'bullet-list':
        return (
          <div className={`p-4 border border-gray-200 rounded-lg shadow-sm ${universalClass}`} style={universalStyle}>
            <div 
              className={`grid gap-4 ${(block.props || {}).columns === 2 ? 'md:grid-cols-2' : (block.props || {}).columns === 3 ? 'md:grid-cols-3' : ''}`}
            >
              {((block.props || {}).items || []).map((item: any, index: number) => (
                <div key={index} className="flex items-center space-x-2">
                  <span 
                    className="flex-shrink-0"
                    style={{ color: item.color || '#6B7280', fontSize: (block.props || {}).fontSize || '1rem', lineHeight: 1 }}
                  >
                    {item.icon || (block.props || {}).icon || '•'}
                  </span>
                  <span style={{ lineHeight: (block.props || {}).spacing || '1.6', fontSize: (block.props || {}).fontSize || '1rem' }}>
                    {item.text || `Item ${index + 1}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      case 'numbered-list':
        return (
          <div className={`p-4 border border-gray-200 rounded-lg shadow-sm ${universalClass}`} style={universalStyle}>
            <div style={universalStyle}>
              {((block.props || {}).items || []).map((item: any, index: number) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <span className="flex-shrink-0 font-medium" style={{ fontSize: (block.props || {}).fontSize || '1rem', lineHeight: 1 }}>
                    {index + 1}.
                  </span>
                  <span style={{ lineHeight: (block.props || {}).spacing || '1.6', fontSize: (block.props || {}).fontSize || '1rem' }}>
                    {item.text || `Item ${index + 1}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'quote':
        return (
          <div className={`p-4 border border-gray-200 rounded-lg shadow-sm ${universalClass}`} style={universalStyle}>
            <blockquote 
              className="relative"
              style={{
                ...universalStyle,
                backgroundColor: (block.props || {}).backgroundColor || '#F9FAFB',
                padding: (block.props || {}).padding || '24px',
                borderRadius: (block.props || {}).borderRadius || '8px',
                textAlign: getTextAlign((block.props || {}).alignment || 'left'),
              }}
            >
              {((block.props || {}).showQuotes && (
                <span className="absolute top-2 left-4 text-4xl text-gray-300">"</span>
              ))}
              <p className="mb-4" style={{ paddingLeft: ((block.props || {}).showQuotes ? '20px' : '0') }}>
                {(block.props || {}).text || 'This is an amazing quote that will inspire your audience.'}
              </p>
              <footer className="text-sm font-medium text-gray-600">
                — {(block.props || {}).author || 'Author Name'}
              </footer>
            </blockquote>
          </div>
        );

      case 'badge':
        return (
          <div className={`p-4 border border-gray-200 rounded-lg shadow-sm ${universalClass}`} style={universalStyle}>
            <span
              className="inline-block"
              style={{
                backgroundColor: (block.props || {}).backgroundColor || '#EF4444',
                color: (block.props || {}).textColor || '#FFFFFF',
                fontSize: (block.props || {}).fontSize || '12px',
                fontWeight: getFontWeight((block.props || {}).fontWeight || '600'),
                padding: (block.props || {}).padding || '4px 8px',
                borderRadius: (block.props || {}).borderRadius || '12px',
                border: (block.props || {}).border || 'none',
                fontFamily: getFontFamily((block.props || {}).fontFamily || 'Inter'),
              }}
            >
              {(block.props || {}).text || 'New'}
            </span>
          </div>
        );

      case 'icon':
        const iconSize = (block.props || {}).size || '24px';
        return (
          <div 
            className={`p-4 border border-gray-200 rounded-lg shadow-sm ${universalClass}`}
            style={{ textAlign: getTextAlign((block.props || {}).alignment || 'left'), ...universalStyle }}
          >
            <div
              className="inline-block transition-transform duration-200"
              style={{
                color: (block.props || {}).color || '#6B7280',
                fontSize: iconSize,
                marginTop: (block.props || {}).marginTop || '0px',
                marginBottom: (block.props || {}).marginBottom || '0px',
                marginLeft: (block.props || {}).marginLeft || '0px',
                marginRight: (block.props || {}).marginRight || '0px',
              }}
              onMouseEnter={(e) => {
                if ((block.props || {}).animation) {
                  e.currentTarget.style.transform = 'scale(1.1) rotate(5deg)';
                }
              }}
              onMouseLeave={(e) => {
                if ((block.props || {}).animation) {
                  e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
                }
              }}
            >
              {/* Icon mapping - you can expand this with more icons */}
              {(block.props || {}).icon === 'star' && '⭐'}
              {(block.props || {}).icon === 'heart' && '❤️'}
              {(block.props || {}).icon === 'check' && '✅'}
              {(block.props || {}).icon === 'arrow' && '→'}
              {(block.props || {}).icon === 'phone' && '📞'}
              {(block.props || {}).icon === 'email' && '��'}
              {(block.props || {}).icon === 'location' && '📍'}
              {!['star', 'heart', 'check', 'arrow', 'phone', 'email', 'location'].includes((block.props || {}).icon) && '⭐'}
            </div>
          </div>
        );

      case 'navigation-bar': {
        // Basic Navigation Bar block
        const menuItems = (block.props || {}).menuItems || [
          { text: 'Home', url: '#' },
          { text: 'About', url: '#' },
        ];
        return (
          <nav
            className={`flex items-center justify-between p-4 border border-gray-200 rounded-lg shadow-sm bg-white ${universalClass}`}
            style={{
              ...universalStyle,
              position: (block.props || {}).fixed ? 'fixed' : 'relative',
              top: (block.props || {}).fixed ? 0 : undefined,
              width: '100%',
              backgroundColor: (block.props || {}).backgroundColor || '#fff',
              backgroundImage: (block.props || {}).backgroundImage ? `url(${(block.props || {}).backgroundImage})` : undefined,
            }}
            onClick={handleClick}
          >
            {/* Logo */}
            <a href={(block.props || {}).logoLink || '#'} className="flex items-center gap-2">
              {(block.props || {}).logoUrl ? (
                <img src={(block.props || {}).logoUrl} alt="Logo" style={{ height: 32, width: 32, objectFit: 'contain' }} />
              ) : (
                <span className="font-bold text-lg">Logo</span>
              )}
            </a>
            {/* Menu */}
            <ul className={`flex gap-6 ${(block.props || {}).menuAlign || 'justify-end'}`}>
              {menuItems.map((item: any, idx: number) => (
                <li key={idx}>
                  <a href={item.url} className="text-gray-700 hover:text-blue-600 transition-colors">{item.text}</a>
                </li>
              ))}
            </ul>
            {/* Hamburger for mobile (placeholder) */}
            <button className="md:hidden block ml-4 p-2 border rounded">☰</button>
          </nav>
        );
      }
      case 'header': {
        return (
          <header
            className={`p-8 rounded-lg shadow bg-gradient-to-br from-blue-50 to-white text-center ${universalClass}`}
            style={{
              ...universalStyle,
              backgroundImage: (block.props || {}).backgroundVideo
                ? undefined
                : (block.props || {}).backgroundImage
                ? `url(${(block.props || {}).backgroundImage})`
                : undefined,
            }}
            onClick={handleClick}
          >
            {((block.props || {}).backgroundVideo && (
              <video
                src={(block.props || {}).backgroundVideo}
                autoPlay
                loop
                muted
                className="absolute inset-0 w-full h-full object-cover opacity-30 rounded-lg"
                style={{ zIndex: 0 }}
              />
            ))}
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h1 className="text-4xl font-bold mb-2">{(block.props || {}).headline || 'Header Headline'}</h1>
              {((block.props || {}).subtitle && <p className="text-lg text-gray-600 mb-4">{(block.props || {}).subtitle}</p>)}
              {((block.props || {}).ctaText && (
                <a href={(block.props || {}).ctaUrl || '#'} className="inline-block px-6 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition">
                  {(block.props || {}).ctaText}
                </a>
              ))}
            </div>
          </header>
        );
      }
      case 'logo': {
        return (
          <div
            className={`flex items-center justify-center p-2 ${universalClass}`}
            style={universalStyle}
            onClick={handleClick}
          >
            <a href={(block.props || {}).link || '#'}>
              {(block.props || {}).imageUrl ? (
                <img
                  src={(block.props || {}).imageUrl}
                  alt="Logo"
                  style={{
                    width: (block.props || {}).width || 64,
                    height: (block.props || {}).height || 64,
                    objectFit: 'contain',
                    padding: (block.props || {}).padding,
                    margin: (block.props || {}).margin,
                  }}
                />
              ) : (
                <span className="font-bold text-xl">Logo</span>
              )}
            </a>
          </div>
        );
      }
      case 'menu': {
        const menuItems = (block.props || {}).menuItems || [
          { text: 'Menu 1', url: '#' },
          { text: 'Menu 2', url: '#' },
        ];
        return (
          <nav
            className={`flex items-center gap-6 p-2 border border-gray-200 rounded-lg bg-white ${universalClass}`}
            style={universalStyle}
            onClick={handleClick}
          >
            <ul className="flex gap-4">
              {menuItems.map((item: any, idx: number) => (
                <li key={idx} className="relative group">
                  <a
                    href={item.url}
                    className="text-gray-700 hover:text-blue-600 transition-colors"
                    style={{ fontWeight: (block.props || {}).fontWeight || 500 }}
                  >
                    {item.text}
                  </a>
                  {/* Dropdown placeholder */}
                  {item.dropdown && (
                    <ul className="absolute left-0 mt-2 bg-white border rounded shadow-lg hidden group-hover:block">
                      {item.dropdown.map((sub: any, subIdx: number) => (
                        <li key={subIdx}>
                          <a href={sub.url} className="block px-4 py-2 hover:bg-blue-50">{sub.text}</a>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        );
      }
      case 'breadcrumb':
        return (
          <nav className={`p-2 border border-gray-200 rounded-lg shadow-sm flex items-center gap-2 bg-white ${universalClass}`} style={universalStyle}>
            {((block.props || {}).items || [{ text: 'Home', url: '#' }, { text: 'Page', url: '#' }]).map((item: any, idx: number) => (
              <span key={idx} className="flex items-center">
                <a href={item.url || '#'} className="text-blue-600 hover:underline">{item.text}</a>
                {idx < ((block.props || {}).items?.length || 2) - 1 && (
                  <span className="mx-2 text-gray-400">{((block.props || {}).separator || '>')}</span>
                )}
              </span>
            ))}
          </nav>
        );
      case 'footer':
        return (
          <footer className={`p-6 border border-gray-200 rounded-lg shadow-sm bg-gray-50 text-center ${universalClass}`} style={universalStyle}>
            <div className="mb-2">{(block.props || {}).text || 'Footer content here'}</div>
            <div className="flex justify-center gap-4">
              {((block.props || {}).links || [{ text: 'Link 1', url: '#' }, { text: 'Link 2', url: '#' }]).map((link: any, idx: number) => (
                <a key={idx} href={link.url} className="text-blue-600 hover:underline">{link.text}</a>
              ))}
            </div>
          </footer>
        );

      // --- MEDIA ELEMENTS PLACEHOLDERS ---
      case 'image': {
        const {
          src,
          alt = '',
          width,
          height,
          objectFit = 'cover',
          alignment = 'center',
          borderRadius = '0px',
          border = '',
          boxShadow = '',
          lightbox = false,
        } = (block.props || {});
        const [showLightbox, setShowLightbox] = useState(false);
        const handleImageClick = (e: React.MouseEvent) => {
          e.stopPropagation();
          if (lightbox && src) setShowLightbox(true);
        };
        const handleLightboxClose = (e: React.MouseEvent) => {
          e.stopPropagation();
          setShowLightbox(false);
        };
        const alignClass = alignment === 'left' ? 'justify-start' : alignment === 'right' ? 'justify-end' : 'justify-center';
        return (
          <div className={`relative group p-2 ${universalClass}`} style={{ maxWidth: '100%', width: '100%', ...universalStyle }} onClick={handleClick}>
            <div className={`flex ${alignClass}`}
              style={{ minHeight: 40 }}>
              {src ? (
                <>
                  <img
                    src={src}
                    alt={alt}
                    style={{
                      width: '100%',
                      height: height ? height : 'auto',
                      objectFit,
                      borderRadius,
                      border,
                      boxShadow,
                      cursor: lightbox ? 'zoom-in' : 'pointer',
                      maxWidth: '100%',
                      display: 'block',
                    }}
                    draggable={false}
                    onClick={handleImageClick}
                  />
                  {/* Drag-to-resize handles (corners) */}
                  <div className="absolute bottom-1 right-1 z-10 hidden group-hover:block">
                    <span className="inline-block w-3 h-3 bg-purple-400 rounded-full cursor-nwse-resize border-2 border-white shadow" />
                  </div>
                  {/* Lightbox modal */}
                  {lightbox && showLightbox && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80" onClick={handleLightboxClose}>
                      <img src={src} alt={alt} className="max-w-full max-h-full rounded-lg shadow-2xl" />
                      <button className="absolute top-8 right-8 text-white text-3xl font-bold" onClick={handleLightboxClose}>&times;</button>
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-32 flex items-center justify-center bg-purple-50 border-2 border-dashed border-purple-200 rounded-lg text-purple-400">
                  <span>No image selected</span>
                </div>
              )}
            </div>
          </div>
        );
      }
      case 'image-gallery': {
        const {
          images = [],
          columns = 3,
          gap = 8,
          hoverEffect = 'zoom',
        } = (block.props || {});
        const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
        const openLightbox = (idx: number) => setLightboxIndex(idx);
        const closeLightbox = () => setLightboxIndex(null);
        const colCount = Math.max(1, Math.min(6, columns));
        return (
          <div className={`relative group p-2 ${universalClass}`} style={{ maxWidth: '100%', width: '100%', ...universalStyle }} onClick={handleClick}>
            {images.length > 0 ? (
              <div
                className="grid"
                style={{
                  gridTemplateColumns: `repeat(${colCount}, minmax(0, 1fr))`,
                  gap: gap,
                }}
              >
                {images.map((img: any, idx: number) => (
                  <div
                    key={img.url || idx}
                    className={`relative overflow-hidden rounded-lg group/image cursor-pointer ${hoverEffect === 'zoom' ? 'hover:scale-105 transition-transform duration-200' : ''}`}
                    style={{ aspectRatio: '1/1', background: '#f3f4f6' }}
                    onClick={e => { e.stopPropagation(); openLightbox(idx); }}
                  >
                    <img
                      src={img.url}
                      alt={img.alt || `Gallery image ${idx + 1}`}
                      className="w-full h-full object-cover"
                      style={{ display: 'block' }}
                      draggable={false}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="w-full h-32 flex items-center justify-center bg-purple-50 border-2 border-dashed border-purple-200 rounded-lg text-purple-400">
                <span>No images in gallery</span>
              </div>
            )}
            {/* Lightbox modal */}
            {lightboxIndex !== null && images[lightboxIndex] && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80" onClick={closeLightbox}>
                <img src={images[lightboxIndex].url} alt={images[lightboxIndex].alt || ''} className="max-w-full max-h-full rounded-lg shadow-2xl" />
                <button className="absolute top-8 right-8 text-white text-3xl font-bold" onClick={closeLightbox}>&times;</button>
              </div>
            )}
          </div>
        );
      }
      case 'video-embed': {
        const {
          url = '',
          controls = true,
          autoplay = false,
          mute = false,
          loop = false,
          lazy = true,
        } = (block.props || {});
        // Helper to parse and embed the correct video provider
        let embedUrl = '';
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
          const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
          const id = match ? match[1] : '';
          embedUrl = id ? `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1${controls ? '' : '&controls=0'}${autoplay ? '&autoplay=1' : ''}${mute ? '&mute=1' : ''}${loop ? `&loop=1&playlist=${id}` : ''}` : '';
        } else if (url.includes('vimeo.com')) {
          const match = url.match(/vimeo\.com\/(\d+)/);
          const id = match ? match[1] : '';
          embedUrl = id ? `https://player.vimeo.com/video/${id}?title=0&byline=0&portrait=0${autoplay ? '&autoplay=1' : ''}${mute ? '&muted=1' : ''}${loop ? '&loop=1' : ''}` : '';
        } else if (url.includes('facebook.com')) {
          embedUrl = url ? `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=0&autoplay=${autoplay ? '1' : '0'}` : '';
        }
        return (
          <div className={`relative group p-2 ${universalClass}`} style={{ maxWidth: '100%', width: '100%', ...universalStyle }} onClick={handleClick}>
            {embedUrl ? (
              <div className="relative w-full" style={{ paddingBottom: '56.25%', height: 0 }}>
                <iframe
                  src={embedUrl}
                  title="Embedded Video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading={lazy ? 'lazy' : 'eager'}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                />
              </div>
            ) : (
              <div className="w-full h-32 flex items-center justify-center bg-purple-50 border-2 border-dashed border-purple-200 rounded-lg text-purple-400">
                <span>Paste a YouTube, Vimeo, or Facebook video URL</span>
              </div>
            )}
          </div>
        );
      }
      case 'video-upload': {
        const {
          url = '',
          thumbnail = '',
          controls = true,
          autoplay = false,
          mute = false,
          loop = false,
          lazy = true,
        } = (block.props || {});
        const [showVideo, setShowVideo] = useState(autoplay);
        if (!url) {
          return (
            <div className={`p-4 border-2 border-pink-300 rounded-lg bg-pink-50 text-pink-800 text-center ${universalClass}`}
              style={universalStyle}
              onClick={handleClick}
            >
              <span className="block text-pink-700 font-semibold">No video uploaded</span>
              <span className="block text-xs mt-1">Upload an .mp4 or .webm file</span>
            </div>
          );
        }
        return (
          <div className={`relative group w-full ${universalClass}`} style={{ maxWidth: '100%', width: '100%', ...universalStyle }} onClick={handleClick}>
            {!showVideo && thumbnail ? (
              <img
                src={thumbnail}
                alt="Video thumbnail"
                className="w-full h-auto object-cover rounded cursor-pointer"
                onClick={e => { e.stopPropagation(); setShowVideo(true); }}
                style={{ aspectRatio: '16/9' }}
              />
            ) : (
              <video
                src={url}
                poster={thumbnail || undefined}
                controls={controls}
                autoPlay={autoplay}
                muted={mute}
                loop={loop}
                preload={lazy ? 'none' : 'auto'}
                className="w-full h-auto rounded"
                style={{ aspectRatio: '16/9' }}
                onError={e => e.currentTarget.poster = ''}
              >
                <track kind="captions" />
                Sorry, your browser doesn't support embedded videos.
              </video>
            )}
          </div>
        );
      }
      case 'icon-box': {
        const {
          icon = '',
          iconType = 'svg',
          iconColor = '#6366f1',
          iconBg = '#f3f4f6',
          iconSize = 40,
          layout = 'icon-top',
          title = '',
          description = '',
        } = (block.props || {});
        const iconNode = iconType === 'svg' && icon ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: iconBg, borderRadius: '50%', width: iconSize, height: iconSize }}>
            <span style={{ color: iconColor, width: iconSize * 0.6, height: iconSize * 0.6 }} dangerouslySetInnerHTML={{ __html: icon }} />
          </span>
        ) : iconType === 'image' && icon ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: iconBg, borderRadius: '50%', width: iconSize, height: iconSize }}>
            <img src={icon} alt="Icon" style={{ width: iconSize * 0.6, height: iconSize * 0.6 }} />
          </span>
        ) : (
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#e5e7eb', borderRadius: '50%', width: iconSize, height: iconSize, color: '#9ca3af' }}>
            <svg width={iconSize * 0.6} height={iconSize * 0.6} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" /></svg>
          </span>
        );
        let content;
        if (layout === 'icon-left') {
          content = (
            <div className="flex items-center gap-4">
              {iconNode}
              <div>
                <div className="font-semibold text-lg">{title || 'Title'}</div>
                <div className="text-gray-600 text-sm">{description || 'Description'}</div>
              </div>
            </div>
          );
        } else if (layout === 'icon-right') {
          content = (
            <div className="flex items-center gap-4 flex-row-reverse">
              {iconNode}
              <div>
                <div className="font-semibold text-lg">{title || 'Title'}</div>
                <div className="text-gray-600 text-sm">{description || 'Description'}</div>
              </div>
            </div>
          );
        } else {
          content = (
            <div className="flex flex-col items-center text-center gap-2">
              {iconNode}
              <div className="font-semibold text-lg">{title || 'Title'}</div>
              <div className="text-gray-600 text-sm">{description || 'Description'}</div>
            </div>
          );
        }
        return (
          <div className={`p-4 rounded-lg border border-gray-200 bg-white shadow-sm ${universalClass}`} style={{ maxWidth: '100%', width: '100%', ...universalStyle }} onClick={handleClick}>
            {content}
          </div>
        );
      }
      case 'logo-carousel': {
        const {
          logos = [],
          visible = 6,
          speed = 30,
          hoverEffect = 'color',
        } = (block.props || {});
        if (!logos.length) {
          return (
            <div className={`p-4 border-2 border-yellow-300 rounded-lg bg-yellow-50 text-yellow-800 text-center ${universalClass}`}
              style={universalStyle}
              onClick={handleClick}
            >
              <span className="block text-yellow-700 font-semibold">No logos added</span>
              <span className="block text-xs mt-1">Upload or select up to 12 logos</span>
            </div>
          );
        }
        // Carousel logic: simple CSS scroll animation
        const itemWidth = 100 / visible;
        return (
          <div className={`overflow-hidden w-full py-2 ${universalClass}`} style={universalStyle} onClick={handleClick}>
            <div
              className="flex items-center gap-6 animate-logo-carousel"
              style={{
                animation: `logo-carousel-scroll ${speed}s linear infinite`,
                width: `${logos.length * itemWidth}%`,
              }}
            >
              {logos.map((logo: any, idx: number) => (
                <div
                  key={idx}
                  className="flex-shrink-0 flex flex-col items-center justify-center"
                  style={{ width: `${itemWidth}%` }}
                >
                  <img
                    src={logo.url}
                    alt={logo.alt || `Logo ${idx + 1}`}
                    className={`w-full h-16 object-contain transition-all duration-300 ${hoverEffect === 'color' ? 'grayscale hover:grayscale-0' : ''}`}
                    style={{ maxWidth: 120 }}
                  />
                </div>
              ))}
            </div>
            <style>{`
              @keyframes logo-carousel-scroll {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
              }
            `}</style>
          </div>
        );
      }
      case 'audio-player': {
        const {
          url = '',
          alt = '',
        } = (block.props || {});
        if (!url) {
          return (
            <div className={`p-4 border-2 border-blue-300 rounded-lg bg-blue-50 text-blue-800 text-center ${universalClass}`}
              style={universalStyle}
              onClick={handleClick}
            >
              <span className="block text-blue-700 font-semibold">No audio uploaded</span>
              <span className="block text-xs mt-1">Upload or paste audio file URL</span>
            </div>
          );
        }
        return (
          <div className={`w-full flex flex-col items-center gap-2 ${universalClass}`} style={{ maxWidth: '100%', width: '100%', ...universalStyle }} onClick={handleClick}>
            <audio controls className="w-full">
              <source src={url} />
              {alt && <track kind="descriptions" label="Description" srcLang="en" src={alt} />}
              Your browser does not support the audio element.
            </audio>
          </div>
        );
      }

      default:
        return (
          <div className={`p-4 bg-gray-100 border border-gray-200 rounded-lg ${universalClass}`} style={universalStyle}>
            <p className="text-gray-500">Unknown block type: {block.type}</p>
          </div>
        );
    }
  };

  if (isPreviewMode) {
    return <div onClick={handleClick}>{renderBlock()}</div>;
  }

  return (
    <div
      className={`relative group ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''} ${universalClass}`}
      onClick={handleClick}
    >
      {renderBlock()}
      
      {/* Block controls overlay */}
      {isSelected && (
        <div className="absolute -top-2 -right-2 flex space-x-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors shadow-lg"
            title="Remove block"
          >
            ×
          </button>
        </div>
      )}
      
      {/* Hover indicator */}
      {!isSelected && (
        <div className="absolute inset-0 border-2 border-dashed border-gray-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-lg" />
      )}
    </div>
  );
};

export default BlockRenderer; 