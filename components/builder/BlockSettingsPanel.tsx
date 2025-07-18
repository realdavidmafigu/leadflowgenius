import React, { useState } from 'react';

interface BlockSettingsPanelProps {
  selectedElement: any;
  sections: any[];
  onUpdateBlock: (sectionId: string, rowId: string, columnId: string, blockId: string, props: any) => void;
  onUpdateElementProps?: (type: string, id: string, props: any) => void; // For section/row/column
}

// Simple local media library modal
const MediaLibraryModal = ({ isOpen, onClose, onSelect }: { isOpen: boolean; onClose: () => void; onSelect: (url: string) => void }) => {
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (!isOpen) return;
    // Fetch images from /media directory
    fetch('/media')
      .then(async (res) => {
        if (!res.ok) return setImages([]);
        const data = await res.json();
        setImages(data.images || []);
      })
      .catch(() => setImages([]));
  }, [isOpen]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed.');
      return;
    }
    setUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/upload-media', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setImages((prev) => [data.url, ...prev]);
        onSelect(data.url);
        onClose();
      } else {
        setError(data.error || 'Upload failed');
      }
    } catch (err) {
      setError('Upload failed');
    }
    setUploading(false);
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96 relative">
        <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={onClose}>&times;</button>
        <h3 className="text-lg font-semibold mb-4">Media Library</h3>
        <div className="mb-4">
          <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} />
          {uploading && <span className="ml-2 text-blue-500">Uploading...</span>}
          {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
        </div>
        <div className="grid grid-cols-3 gap-4">
          {images.map((img) => (
            <div key={img} className="cursor-pointer group" onClick={e => { e.preventDefault(); onSelect(img); onClose(); }}>
              <img src={img} alt="media" className="rounded-lg border border-gray-200 group-hover:border-blue-400 transition-all w-full h-24 object-cover" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

function BlockSettings({ block, onUpdate }: { block: any; onUpdate: (props: any) => void }) {
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  if (!block) return null;

  const handleChange = (key: string, value: any) => {
    onUpdate({ [key]: value });
  };

  // Universal settings
  return (
    <div className="space-y-6">
      {/* Content (for text-based blocks) */}
      {['text', 'heading', 'subheading', 'rich-text', 'quote'].includes(block.type) && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
          <textarea
            value={block.props.text || block.props.content || ''}
            onChange={e => handleChange(block.type === 'rich-text' ? 'content' : 'text', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            rows={block.type === 'rich-text' ? 6 : 3}
          />
        </div>
      )}
      {/* Typography */}
      <div className="grid grid-cols-2 gap-2">
      <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Font Family</label>
        <select
          value={block.props.fontFamily || 'Inter'}
            onChange={e => handleChange('fontFamily', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          <option value="Inter">Inter</option>
          <option value="Roboto">Roboto</option>
          <option value="Open Sans">Open Sans</option>
          <option value="Montserrat">Montserrat</option>
          <option value="Lato">Lato</option>
        </select>
      </div>
      <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Font Size</label>
        <input
            type="number"
            value={parseInt(block.props.fontSize) || 16}
            onChange={e => handleChange('fontSize', e.target.value + 'px')}
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>
      <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Font Weight</label>
        <select
          value={block.props.fontWeight || '400'}
            onChange={e => handleChange('fontWeight', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          <option value="100">Thin</option>
          <option value="200">Extra Light</option>
          <option value="300">Light</option>
          <option value="400">Normal</option>
          <option value="500">Medium</option>
          <option value="600">Semi Bold</option>
          <option value="700">Bold</option>
          <option value="800">Extra Bold</option>
          <option value="900">Black</option>
        </select>
      </div>
      <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Text Color</label>
        <input
          type="color"
          value={block.props.color || '#374151'}
            onChange={e => handleChange('color', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>
      <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Text Align</label>
        <select
          value={block.props.textAlign || 'left'}
            onChange={e => handleChange('textAlign', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
          <option value="justify">Justify</option>
        </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Line Height</label>
          <input
            type="number"
            step="0.01"
            value={parseFloat(block.props.lineHeight) || 1.6}
            onChange={e => handleChange('lineHeight', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Letter Spacing</label>
          <input
            type="number"
            step="0.01"
            value={parseFloat(block.props.letterSpacing) || 0}
            onChange={e => handleChange('letterSpacing', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>
      {/* Background */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">Background</label>
        <input
          type="color"
          value={block.props.backgroundColor || '#ffffff'}
          onChange={e => handleChange('backgroundColor', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
        />
        <input
          type="text"
          value={block.props.backgroundImage || ''}
          onChange={e => handleChange('backgroundImage', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
          placeholder="Paste image URL or use media library"
        />
        <input
          type="number"
          min="0"
          max="1"
          step="0.05"
          value={(block.props && block.props.backgroundOverlayOpacity !== undefined) ? block.props.backgroundOverlayOpacity : 0.4}
          onChange={e => handleChange('backgroundOverlayOpacity', parseFloat(e.target.value))}
          className="w-full"
        />
        <div className="text-xs text-gray-500 mt-1">{(block.props.backgroundOverlayOpacity ?? 0.4) * 100}%</div>
      </div>
      {/* Spacing */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Padding</label>
          <input
            type="text"
            value={block.props.padding || ''}
            onChange={e => handleChange('padding', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="e.g. 2rem"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Margin</label>
          <input
            type="text"
            value={block.props.margin || ''}
            onChange={e => handleChange('margin', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="e.g. 1rem"
          />
        </div>
      </div>
      {/* Border */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Border Color</label>
          <input
            type="color"
            value={block.props.borderColor || '#e5e7eb'}
            onChange={e => handleChange('borderColor', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Border Width</label>
          <input
            type="number"
            value={parseInt(block.props.borderWidth) || 0}
            onChange={e => handleChange('borderWidth', e.target.value + 'px')}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Border Style</label>
          <select
            value={block.props.borderStyle || 'solid'}
            onChange={e => handleChange('borderStyle', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="solid">Solid</option>
            <option value="dashed">Dashed</option>
            <option value="dotted">Dotted</option>
            <option value="double">Double</option>
            <option value="groove">Groove</option>
            <option value="ridge">Ridge</option>
            <option value="inset">Inset</option>
            <option value="outset">Outset</option>
            <option value="none">None</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Border Radius</label>
          <input
            type="number"
            value={parseInt(block.props.borderRadius) || 0}
            onChange={e => handleChange('borderRadius', e.target.value + 'px')}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>
      {/* Shadow */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Box Shadow</label>
        <input
          type="text"
          value={block.props.boxShadow || ''}
          onChange={e => handleChange('boxShadow', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
          placeholder="e.g. 0 2px 8px #0002"
        />
      </div>
      {/* Size & Layout */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Width</label>
          <input
            type="number"
            value={parseInt(block.props.width) || 0}
            onChange={e => handleChange('width', e.target.value + 'px')}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Max Width</label>
          <input
            type="number"
            value={parseInt(block.props.maxWidth) || 0}
            onChange={e => handleChange('maxWidth', e.target.value + 'px')}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Height</label>
          <input
            type="number"
            value={parseInt(block.props.height) || 0}
            onChange={e => handleChange('height', e.target.value + 'px')}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Display</label>
          <select
            value={block.props.display || 'block'}
            onChange={e => handleChange('display', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="block">Block</option>
            <option value="inline-block">Inline Block</option>
            <option value="flex">Flex</option>
            <option value="inline">Inline</option>
          </select>
        </div>
      </div>
      {/* Visibility */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Show on Desktop</label>
          <input
            type="checkbox"
            checked={block.props.showOnDesktop !== false}
            onChange={e => handleChange('showOnDesktop', e.target.checked)}
            className="mr-2"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Show on Mobile</label>
          <input
            type="checkbox"
            checked={block.props.showOnMobile !== false}
            onChange={e => handleChange('showOnMobile', e.target.checked)}
            className="mr-2"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Z-Index</label>
          <input
            type="number"
            value={parseInt(block.props.zIndex) || 0}
            onChange={e => handleChange('zIndex', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>
      {/* Advanced */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Custom CSS Classes</label>
        <input
          type="text"
          value={block.props.customClass || ''}
          onChange={e => handleChange('customClass', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Custom Inline Styles</label>
        <input
          type="text"
          value={block.props.customStyle || ''}
          onChange={e => handleChange('customStyle', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>
      {/* BUTTON BLOCK SETTINGS */}
      {block.type === 'button' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Button Link (URL)</label>
            <input
              type="text"
              value={block.props.url || ''}
              onChange={e => handleChange('url', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="https://..."
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={block.props.openInNewTab || false}
              onChange={e => handleChange('openInNewTab', e.target.checked)}
              className="mr-2"
            />
            <label className="text-xs font-medium text-gray-700">Open in new tab</label>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Hover Background Color</label>
            <input
              type="color"
              value={block.props.hoverBackground || '#2563eb'}
              onChange={e => handleChange('hoverBackground', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Button Text Color</label>
            <input
              type="color"
              value={block.props.textColor || '#ffffff'}
              onChange={e => handleChange('textColor', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
        </>
      )}
      {/* IMAGE BLOCK SETTINGS */}
      {block.type === 'image' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={block.props.src || ''}
                onChange={e => handleChange('src', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Paste image URL or use media library"
              />
              <button type="button" className="p-2 bg-gray-100 rounded hover:bg-blue-100" onClick={() => setMediaModalOpen(true)}>
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M4 12l4-4a2 2 0 012.828 0l4.586 4.586a2 2 0 002.828 0L20 12" />
                </svg>
              </button>
            </div>
            {mediaModalOpen && (
              <MediaLibraryModal
                isOpen={mediaModalOpen}
                onClose={() => setMediaModalOpen(false)}
                onSelect={url => { handleChange('src', url); setMediaModalOpen(false); }}
              />
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Alt Text</label>
            <input
              type="text"
              value={block.props.alt || ''}
              onChange={e => handleChange('alt', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Width (px)</label>
              <input
                type="number"
                value={parseInt(block.props.width) || ''}
                onChange={e => handleChange('width', e.target.value + 'px')}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Height (px)</label>
              <input
                type="number"
                value={parseInt(block.props.height) || ''}
                onChange={e => handleChange('height', e.target.value + 'px')}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Object Fit</label>
            <select
              value={block.props.objectFit || 'cover'}
              onChange={e => handleChange('objectFit', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="cover">Cover</option>
              <option value="contain">Contain</option>
              <option value="fill">Fill</option>
              <option value="none">None</option>
              <option value="scale-down">Scale Down</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Link (optional)</label>
            <input
              type="text"
              value={block.props.link || ''}
              onChange={e => handleChange('link', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="https://..."
            />
          </div>
        </>
      )}
      {/* DIVIDER BLOCK SETTINGS */}
      {block.type === 'divider' && (
        <>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Thickness (px)</label>
              <input
                type="number"
                value={parseInt(block.props.thickness) || 1}
                onChange={e => handleChange('thickness', e.target.value + 'px')}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Style</label>
              <select
                value={block.props.type || 'solid'}
                onChange={e => handleChange('type', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="solid">Solid</option>
                <option value="dashed">Dashed</option>
                <option value="dotted">Dotted</option>
                <option value="double">Double</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Color</label>
            <input
              type="color"
              value={block.props.color || '#e5e7eb'}
              onChange={e => handleChange('color', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Width</label>
            <input
              type="text"
              value={block.props.width || '100%'}
              onChange={e => handleChange('width', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="e.g. 100% or 200px"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Alignment</label>
            <select
              value={block.props.alignment || 'center'}
              onChange={e => handleChange('alignment', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Margin Top</label>
              <input
                type="text"
                value={block.props.marginTop || ''}
                onChange={e => handleChange('marginTop', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="e.g. 1rem"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Margin Bottom</label>
              <input
                type="text"
                value={block.props.marginBottom || ''}
                onChange={e => handleChange('marginBottom', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="e.g. 1rem"
              />
            </div>
          </div>
        </>
      )}
      {/* BULLET LIST BLOCK SETTINGS */}
      {block.type === 'bullet-list' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">List Items</label>
            {(block.props.items || []).map((item: any, idx: number) => (
              <div key={idx} className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={item.text || ''}
                  onChange={e => {
                    const newItems = [...block.props.items];
                    newItems[idx].text = e.target.value;
                    handleChange('items', newItems);
                  }}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder={`Item ${idx + 1}`}
                />
                <button type="button" className="text-red-500" onClick={() => {
                  const newItems = [...block.props.items];
                  newItems.splice(idx, 1);
                  handleChange('items', newItems);
                }}>×</button>
              </div>
            ))}
            <button type="button" className="mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded" onClick={() => {
              handleChange('items', [...(block.props.items || []), { text: '' }]);
            }}>Add Item</button>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Bullet Icon</label>
            <input
              type="text"
              value={block.props.icon || '•'}
              onChange={e => handleChange('icon', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="e.g. •, ✓, →, etc."
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Columns</label>
            <select
              value={block.props.columns || 1}
              onChange={e => handleChange('columns', parseInt(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Spacing</label>
            <input
              type="number"
              value={block.props.spacing || 1.6}
              step="0.1"
              onChange={e => handleChange('spacing', parseFloat(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
        </>
      )}
      {/* NUMBERED LIST BLOCK SETTINGS */}
      {block.type === 'numbered-list' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">List Items</label>
            {(block.props.items || []).map((item: any, idx: number) => (
              <div key={idx} className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={item.text || ''}
                  onChange={e => {
                    const newItems = [...block.props.items];
                    newItems[idx].text = e.target.value;
                    handleChange('items', newItems);
                  }}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder={`Item ${idx + 1}`}
                />
                <button type="button" className="text-red-500" onClick={() => {
                  const newItems = [...block.props.items];
                  newItems.splice(idx, 1);
                  handleChange('items', newItems);
                }}>×</button>
              </div>
            ))}
            <button type="button" className="mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded" onClick={() => {
              handleChange('items', [...(block.props.items || []), { text: '' }]);
            }}>Add Item</button>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Columns</label>
            <select
              value={block.props.columns || 1}
              onChange={e => handleChange('columns', parseInt(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Spacing</label>
            <input
              type="number"
              value={block.props.spacing || 1.6}
              step="0.1"
              onChange={e => handleChange('spacing', parseFloat(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
        </>
      )}
      {/* QUOTE BLOCK SETTINGS */}
      {block.type === 'quote' && (
        <>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Author</label>
            <input
              type="text"
              value={block.props.author || ''}
              onChange={e => handleChange('author', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={block.props.showQuotes !== false}
              onChange={e => handleChange('showQuotes', e.target.checked)}
              className="mr-2"
            />
            <label className="text-xs font-medium text-gray-700">Show Quote Marks</label>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Alignment</label>
            <select
              value={block.props.alignment || 'left'}
              onChange={e => handleChange('alignment', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
        </>
      )}
      {/* BADGE BLOCK SETTINGS */}
      {block.type === 'badge' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Badge Text</label>
            <input
              type="text"
              value={block.props.text || ''}
              onChange={e => handleChange('text', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="e.g. Best Seller"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Background Color</label>
            <input
              type="color"
              value={block.props.backgroundColor || '#EF4444'}
              onChange={e => handleChange('backgroundColor', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Text Color</label>
            <input
              type="color"
              value={block.props.textColor || '#FFFFFF'}
              onChange={e => handleChange('textColor', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Font Size</label>
              <input
                type="number"
                value={parseInt(block.props.fontSize) || 12}
                onChange={e => handleChange('fontSize', e.target.value + 'px')}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Font Weight</label>
              <select
                value={block.props.fontWeight || '600'}
                onChange={e => handleChange('fontWeight', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="400">Normal</option>
                <option value="500">Medium</option>
                <option value="600">Semi Bold</option>
                <option value="700">Bold</option>
                <option value="800">Extra Bold</option>
                <option value="900">Black</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Border Radius</label>
            <input
              type="number"
              value={parseInt(block.props.borderRadius) || 12}
              onChange={e => handleChange('borderRadius', e.target.value + 'px')}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Border</label>
            <input
              type="text"
              value={block.props.border || 'none'}
              onChange={e => handleChange('border', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="e.g. 1px solid #000"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Shape</label>
            <select
              value={block.props.shape || 'pill'}
              onChange={e => handleChange('shape', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="pill">Pill</option>
              <option value="rounded">Rounded</option>
              <option value="square">Square</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={block.props.animation || false}
              onChange={e => handleChange('animation', e.target.checked)}
              className="mr-2"
            />
            <label className="text-xs font-medium text-gray-700">Animate on Scroll</label>
          </div>
        </>
      )}
      {/* ICON BLOCK SETTINGS */}
      {block.type === 'icon' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
            <input
              type="text"
              value={block.props.icon || '⭐'}
              onChange={e => handleChange('icon', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="e.g. ⭐, ✅, →, or SVG code"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Size (px)</label>
              <input
                type="number"
                value={parseInt(block.props.size) || 24}
                onChange={e => handleChange('size', e.target.value + 'px')}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Color</label>
              <input
                type="color"
                value={block.props.color || '#6B7280'}
                onChange={e => handleChange('color', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Margin Top</label>
              <input
                type="text"
                value={block.props.marginTop || '0px'}
                onChange={e => handleChange('marginTop', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Margin Bottom</label>
              <input
                type="text"
                value={block.props.marginBottom || '0px'}
                onChange={e => handleChange('marginBottom', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Margin Left</label>
              <input
                type="text"
                value={block.props.marginLeft || '0px'}
                onChange={e => handleChange('marginLeft', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Margin Right</label>
              <input
                type="text"
                value={block.props.marginRight || '0px'}
                onChange={e => handleChange('marginRight', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Alignment</label>
            <select
              value={block.props.alignment || 'left'}
              onChange={e => handleChange('alignment', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={block.props.animation || false}
              onChange={e => handleChange('animation', e.target.checked)}
              className="mr-2"
            />
            <label className="text-xs font-medium text-gray-700">Animate on Hover</label>
          </div>
        </>
      )}
      {/* NAVIGATION BAR BLOCK SETTINGS */}
      {block.type === 'navigation-bar' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Menu Items</label>
            {(block.props.items || []).map((item: any, idx: number) => (
              <div key={idx} className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={item.text || ''}
                  onChange={e => {
                    const newItems = [...block.props.items];
                    newItems[idx].text = e.target.value;
                    handleChange('items', newItems);
                  }}
                  className="w-1/2 p-2 border border-gray-300 rounded-md"
                  placeholder={`Label ${idx + 1}`}
                />
                <input
                  type="text"
                  value={item.url || ''}
                  onChange={e => {
                    const newItems = [...block.props.items];
                    newItems[idx].url = e.target.value;
                    handleChange('items', newItems);
                  }}
                  className="w-1/2 p-2 border border-gray-300 rounded-md"
                  placeholder="URL"
                />
                <button type="button" className="text-red-500" onClick={() => {
                  const newItems = [...block.props.items];
                  newItems.splice(idx, 1);
                  handleChange('items', newItems);
                }}>×</button>
              </div>
            ))}
            <button type="button" className="mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded" onClick={() => {
              handleChange('items', [...(block.props.items || []), { text: '', url: '' }]);
            }}>Add Item</button>
      </div>
    </>
      )}
      {/* HEADER BLOCK SETTINGS */}
      {block.type === 'header' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Header Text</label>
            <input
              type="text"
              value={block.props.text || ''}
              onChange={e => handleChange('text', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Header Title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subtext</label>
            <input
              type="text"
              value={block.props.subtext || ''}
              onChange={e => handleChange('subtext', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Header subtitle or description"
            />
          </div>
        </>
      )}
      {/* LOGO BLOCK SETTINGS */}
      {block.type === 'logo' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Logo Image</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                className="block w-full border rounded px-2 py-1"
                value={block.props.imageUrl || ''}
                onChange={e => handleChange('imageUrl', e.target.value)}
                placeholder="Image URL"
              />
              <button type="button" className="p-2 bg-gray-100 rounded hover:bg-blue-100" onClick={() => setMediaModalOpen(true)}>
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M4 12l4-4a2 2 0 012.828 0l4.586 4.586a2 2 0 002.828 0L20 12" />
                </svg>
              </button>
            </div>
            {mediaModalOpen && (
              <MediaLibraryModal
                isOpen={mediaModalOpen}
                onClose={() => setMediaModalOpen(false)}
                onSelect={url => { handleChange('imageUrl', url); setMediaModalOpen(false); }}
              />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Link</label>
            <input
              type="text"
              className="block w-full border rounded px-2 py-1"
              value={block.props.link || ''}
              onChange={e => handleChange('link', e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <div>
              <label className="block text-xs">Width</label>
              <input
                type="number"
                className="w-20 border rounded px-1 py-0.5"
                value={block.props.width || 100}
                min={10}
                max={1000}
                onChange={e => handleChange('width', Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-xs">Height</label>
              <input
                type="number"
                className="w-20 border rounded px-1 py-0.5"
                value={block.props.height || 100}
                min={10}
                max={1000}
                onChange={e => handleChange('height', Number(e.target.value))}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <div>
              <label className="block text-xs">Padding</label>
              <input
                type="number"
                className="w-20 border rounded px-1 py-0.5"
                value={block.props.padding || 0}
                min={0}
                max={200}
                onChange={e => handleChange('padding', Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-xs">Margin</label>
              <input
                type="number"
                className="w-20 border rounded px-1 py-0.5"
                value={block.props.margin || 0}
                min={0}
                max={200}
                onChange={e => handleChange('margin', Number(e.target.value))}
              />
            </div>
          </div>
        </>
      )}
      {/* MENU BLOCK SETTINGS */}
      {block.type === 'menu' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Menu Items</label>
            {(block.props.menuItems || []).map((item, idx) => (
              <div key={idx} className="flex gap-2 items-center mb-2">
                <input
                  type="text"
                  className="border rounded px-2 py-1 w-32"
                  value={item.text}
                  onChange={e => {
                    const menuItems = [...block.props.menuItems];
                    menuItems[idx].text = e.target.value;
                    handleChange('menuItems', menuItems);
                  }}
                  placeholder="Label"
                />
                <input
                  type="text"
                  className="border rounded px-2 py-1 w-32"
                  value={item.url}
                  onChange={e => {
                    const menuItems = [...block.props.menuItems];
                    menuItems[idx].url = e.target.value;
                    handleChange('menuItems', menuItems);
                  }}
                  placeholder="URL"
                />
                <button
                  className="text-red-500 hover:text-red-700"
                  onClick={() => {
                    const menuItems = [...block.props.menuItems];
                    menuItems.splice(idx, 1);
                    handleChange('menuItems', menuItems);
                  }}
                >Remove</button>
              </div>
            ))}
            <button
              className="text-blue-500 hover:text-blue-700 mt-2"
              onClick={() => {
                const menuItems = [...(block.props.menuItems || [])];
                menuItems.push({ text: '', url: '' });
                handleChange('menuItems', menuItems);
              }}
            >Add Menu Item</button>
          </div>
        </>
      )}
      {/* BREADCRUMB BLOCK SETTINGS */}
      {block.type === 'breadcrumb' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Breadcrumb Items</label>
            {(block.props.items || []).map((item: any, idx: number) => (
              <div key={idx} className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={item.text || ''}
                  onChange={e => {
                    const newItems = [...block.props.items];
                    newItems[idx].text = e.target.value;
                    handleChange('items', newItems);
                  }}
                  className="w-1/2 p-2 border border-gray-300 rounded-md"
                  placeholder={`Label ${idx + 1}`}
                />
                <input
                  type="text"
                  value={item.url || ''}
                  onChange={e => {
                    const newItems = [...block.props.items];
                    newItems[idx].url = e.target.value;
                    handleChange('items', newItems);
                  }}
                  className="w-1/2 p-2 border border-gray-300 rounded-md"
                  placeholder="URL"
                />
                <button type="button" className="text-red-500" onClick={() => {
                  const newItems = [...block.props.items];
                  newItems.splice(idx, 1);
                  handleChange('items', newItems);
                }}>×</button>
              </div>
            ))}
            <button type="button" className="mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded" onClick={() => {
              handleChange('items', [...(block.props.items || []), { text: '', url: '' }]);
            }}>Add Item</button>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Separator</label>
            <input
              type="text"
              value={block.props.separator || '>'}
              onChange={e => handleChange('separator', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="e.g. >, /, |"
            />
          </div>
        </>
      )}
      {/* FOOTER BLOCK SETTINGS */}
      {block.type === 'footer' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Footer Text</label>
            <input
              type="text"
              value={block.props.text || ''}
              onChange={e => handleChange('text', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Footer content here"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Footer Links</label>
            {(block.props.links || []).map((link: any, idx: number) => (
              <div key={idx} className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={link.text || ''}
                  onChange={e => {
                    const newLinks = [...block.props.links];
                    newLinks[idx].text = e.target.value;
                    handleChange('links', newLinks);
                  }}
                  className="w-1/2 p-2 border border-gray-300 rounded-md"
                  placeholder={`Label ${idx + 1}`}
                />
                <input
                  type="text"
                  value={link.url || ''}
                  onChange={e => {
                    const newLinks = [...block.props.links];
                    newLinks[idx].url = e.target.value;
                    handleChange('links', newLinks);
                  }}
                  className="w-1/2 p-2 border border-gray-300 rounded-md"
                  placeholder="URL"
                />
                <button type="button" className="text-red-500" onClick={() => {
                  const newLinks = [...block.props.links];
                  newLinks.splice(idx, 1);
                  handleChange('links', newLinks);
                }}>×</button>
              </div>
            ))}
            <button type="button" className="mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded" onClick={() => {
              handleChange('links', [...(block.props.links || []), { text: '', url: '' }]);
            }}>Add Link</button>
          </div>
        </>
      )}
        </div>
      );
}

const BlockSettingsPanel: React.FC<BlockSettingsPanelProps> = ({ selectedElement, sections, onUpdateBlock, onUpdateElementProps }) => {
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [logoMediaModalOpen, setLogoMediaModalOpen] = useState(false);
  const [headerBgMediaModalOpen, setHeaderBgMediaModalOpen] = useState(false);
  const [rowBgMediaModalOpen, setRowBgMediaModalOpen] = useState(false);
  const [columnBgMediaModalOpen, setColumnBgMediaModalOpen] = useState(false);

  if (!selectedElement) return null;

  console.log('BlockSettingsPanel selectedElement:', selectedElement);

  // Find the selected element in the sections
  const findElement = () => {
    for (const section of sections) {
      if (selectedElement.type === 'section' && section.id === selectedElement.id) {
        return { type: 'section', element: section };
      }
      for (const row of section.rows) {
        if (selectedElement.type === 'row' && row.id === selectedElement.id) {
          return { type: 'row', element: row, sectionId: section.id };
        }
        for (const column of row.columns) {
          if (selectedElement.type === 'column' && column.id === selectedElement.id) {
            return { type: 'column', element: column, sectionId: section.id, rowId: row.id };
          }
          for (const block of column.blocks) {
            if (selectedElement.type === 'block' && block.id === selectedElement.id) {
              return { type: 'block', element: block, sectionId: section.id, rowId: row.id, columnId: column.id };
            }
          }
        }
      }
    }
    return null;
  };

  const elementData = findElement();
  console.log('BlockSettingsPanel elementData:', elementData);
  if (!elementData) return null;

  const { type, element, sectionId, rowId, columnId } = elementData;

  // Helper to update props for section/row/column
  const handleUpdateProps = (props: any) => {
    if (type === 'section' && onUpdateElementProps) onUpdateElementProps('section', element.id, props);
    if (type === 'row' && onUpdateElementProps) onUpdateElementProps('row', element.id, props);
    if (type === 'column' && onUpdateElementProps) onUpdateElementProps('column', element.id, props);
  };

  // Common style settings
  const styleSettings = (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
        <input
          type="color"
          value={(element.props || {}).backgroundColor || '#ffffff'}
          onChange={e => handleUpdateProps({ backgroundColor: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Background Image</label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={(element.props || {}).backgroundImage || ''}
            onChange={e => handleUpdateProps({ backgroundImage: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="Paste image URL or use media library"
          />
          <button type="button" className="p-2 bg-gray-100 rounded hover:bg-blue-100" onClick={() => setMediaModalOpen(true)}>
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M4 12l4-4a2 2 0 012.828 0l4.586 4.586a2 2 0 002.828 0L20 12" />
            </svg>
          </button>
        </div>
        {element.props && element.props.backgroundImage && (
          <div className="mt-2">
            <img src={element.props.backgroundImage} alt="bg preview" className="w-full h-24 object-cover rounded" />
          </div>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Background Overlay Opacity</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={(element.props && element.props.backgroundOverlayOpacity !== undefined) ? element.props.backgroundOverlayOpacity : 0.4}
          onChange={e => handleUpdateProps({ backgroundOverlayOpacity: parseFloat(e.target.value) })}
          className="w-full"
        />
        <div className="text-xs text-gray-500 mt-1">{(element.props && element.props.backgroundOverlayOpacity !== undefined ? element.props.backgroundOverlayOpacity : 0.4) * 100}%</div>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Padding</label>
          <input
            type="text"
            value={element.props.padding || ''}
            onChange={e => handleUpdateProps({ padding: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="e.g. 2rem"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Margin</label>
          <input
            type="text"
            value={element.props.margin || ''}
            onChange={e => handleUpdateProps({ margin: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="e.g. 1rem"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Border Radius</label>
          <input
            type="text"
            value={element.props.borderRadius || ''}
            onChange={e => handleUpdateProps({ borderRadius: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="e.g. 8px"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Box Shadow</label>
          <input
            type="text"
            value={element.props.boxShadow || ''}
            onChange={e => handleUpdateProps({ boxShadow: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="e.g. 0 2px 8px #0002"
          />
        </div>
      </div>
    </>
  );

  switch (type) {
    case 'block':
      // Custom settings for new layout blocks
      switch (element.type) {
        case 'navigation-bar':
          return (
            <div className="space-y-4">
              <h4 className="text-md font-semibold text-gray-900">Navigation Bar Settings</h4>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Logo Image</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    className="block w-full border rounded px-2 py-1"
                    value={element.props.logoUrl || ''}
                    onChange={e => handleUpdateProps({ logoUrl: e.target.value })}
                    placeholder="Logo Image URL"
                  />
                  <button type="button" className="p-2 bg-gray-100 rounded hover:bg-blue-100" onClick={() => setLogoMediaModalOpen(true)}>
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M4 12l4-4a2 2 0 012.828 0l4.586 4.586a2 2 0 002.828 0L20 12" />
                    </svg>
                  </button>
                </div>
                {logoMediaModalOpen && (
                  <MediaLibraryModal
                    isOpen={logoMediaModalOpen}
                    onClose={() => setLogoMediaModalOpen(false)}
                    onSelect={url => { handleUpdateProps({ logoUrl: url }); setLogoMediaModalOpen(false); }}
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Logo Link</label>
                <input type="text" value={element.props.logoLink || ''} onChange={e => handleUpdateProps({ logoLink: e.target.value })} className="w-full p-2 border border-gray-300 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Menu Items</label>
                {(element.props.menuItems || []).map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-center mb-2">
                    <input
                      type="text"
                      className="border rounded px-2 py-1 w-32"
                      value={item.text}
                      onChange={e => {
                        const menuItems = [...element.props.menuItems];
                        menuItems[idx].text = e.target.value;
                        handleUpdateProps({ menuItems });
                      }}
                      placeholder="Label"
                    />
                    <input
                      type="text"
                      className="border rounded px-2 py-1 w-32"
                      value={item.url}
                      onChange={e => {
                        const menuItems = [...element.props.menuItems];
                        menuItems[idx].url = e.target.value;
                        handleUpdateProps({ menuItems });
                      }}
                      placeholder="URL"
                    />
                    <button
                      className="text-red-500 hover:text-red-700"
                      onClick={() => {
                        const menuItems = [...element.props.menuItems];
                        menuItems.splice(idx, 1);
                        handleUpdateProps({ menuItems });
                      }}
                    >Remove</button>
                  </div>
                ))}
                <button
                  className="text-blue-500 hover:text-blue-700 mt-2"
                  onClick={() => {
                    const menuItems = [...(element.props.menuItems || [])];
                    menuItems.push({ text: '', url: '' });
                    handleUpdateProps({ menuItems });
                  }}
                >Add Menu Item</button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fixed Position</label>
                <input type="checkbox" checked={element.props.fixed || false} onChange={e => handleUpdateProps({ fixed: e.target.checked })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Menu Alignment</label>
                <select value={element.props.menuAlign || 'justify-end'} onChange={e => handleUpdateProps({ menuAlign: e.target.value })} className="w-full p-2 border border-gray-300 rounded-md">
                  <option value="justify-start">Left</option>
                  <option value="justify-center">Center</option>
                  <option value="justify-end">Right</option>
                </select>
              </div>
              {styleSettings}
            </div>
          );
        case 'header':
          return (
            <div className="space-y-4">
              <h4 className="text-md font-semibold text-gray-900">Header Settings</h4>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Headline</label>
                <input type="text" value={element.props.headline || ''} onChange={e => handleUpdateProps({ headline: e.target.value })} className="w-full p-2 border border-gray-300 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
                <input type="text" value={element.props.subtitle || ''} onChange={e => handleUpdateProps({ subtitle: e.target.value })} className="w-full p-2 border border-gray-300 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CTA Text</label>
                <input type="text" value={element.props.ctaText || ''} onChange={e => handleUpdateProps({ ctaText: e.target.value })} className="w-full p-2 border border-gray-300 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CTA URL</label>
                <input type="text" value={element.props.ctaUrl || ''} onChange={e => handleUpdateProps({ ctaUrl: e.target.value })} className="w-full p-2 border border-gray-300 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Background Image</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    className="block w-full border rounded px-2 py-1"
                    value={(element.props || {}).backgroundImage || ''}
                    onChange={e => handleUpdateProps({ backgroundImage: e.target.value })}
                    placeholder="Background Image URL"
                  />
                  <button type="button" className="p-2 bg-gray-100 rounded hover:bg-blue-100" onClick={() => setHeaderBgMediaModalOpen(true)}>
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M4 12l4-4a2 2 0 012.828 0l4.586 4.586a2 2 0 002.828 0L20 12" />
                    </svg>
                  </button>
                </div>
                {headerBgMediaModalOpen && (
                  <MediaLibraryModal
                    isOpen={headerBgMediaModalOpen}
                    onClose={() => setHeaderBgMediaModalOpen(false)}
                    onSelect={url => { handleUpdateProps({ backgroundImage: url }); setHeaderBgMediaModalOpen(false); }}
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Background Video URL</label>
                <input type="text" value={element.props.backgroundVideo || ''} onChange={e => handleUpdateProps({ backgroundVideo: e.target.value })} className="w-full p-2 border border-gray-300 rounded-md" />
              </div>
              {styleSettings}
            </div>
          );
        case 'logo':
          return (
            <div className="space-y-4">
              <h4 className="text-md font-semibold text-gray-900">Logo Settings</h4>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Logo Image</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    className="block w-full border rounded px-2 py-1"
                    value={element.props.imageUrl || ''}
                    onChange={e => handleUpdateProps({ imageUrl: e.target.value })}
                    placeholder="Image URL"
                  />
                  <button type="button" className="p-2 bg-gray-100 rounded hover:bg-blue-100" onClick={() => setLogoMediaModalOpen(true)}>
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M4 12l4-4a2 2 0 012.828 0l4.586 4.586a2 2 0 002.828 0L20 12" />
                    </svg>
                  </button>
                </div>
                {logoMediaModalOpen && (
                  <MediaLibraryModal
                    isOpen={logoMediaModalOpen}
                    onClose={() => setLogoMediaModalOpen(false)}
                    onSelect={url => { handleUpdateProps({ imageUrl: url }); setLogoMediaModalOpen(false); }}
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Link</label>
                <input
                  type="text"
                  className="block w-full border rounded px-2 py-1"
                  value={element.props.link || ''}
                  onChange={e => handleUpdateProps({ link: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <div>
                  <label className="block text-xs">Width</label>
                  <input
                    type="number"
                    className="w-20 border rounded px-1 py-0.5"
                    value={element.props.width || 100}
                    min={10}
                    max={1000}
                    onChange={e => handleUpdateProps({ width: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-xs">Height</label>
                  <input
                    type="number"
                    className="w-20 border rounded px-1 py-0.5"
                    value={element.props.height || 100}
                    min={10}
                    max={1000}
                    onChange={e => handleUpdateProps({ height: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <div>
                  <label className="block text-xs">Padding</label>
                  <input
                    type="number"
                    className="w-20 border rounded px-1 py-0.5"
                    value={element.props.padding || 0}
                    min={0}
                    max={200}
                    onChange={e => handleUpdateProps({ padding: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-xs">Margin</label>
                  <input
                    type="number"
                    className="w-20 border rounded px-1 py-0.5"
                    value={element.props.margin || 0}
                    min={0}
                    max={200}
                    onChange={e => handleUpdateProps({ margin: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>
          );
        case 'menu':
          return (
            <div className="space-y-4">
              <h4 className="text-md font-semibold text-gray-900">Menu Settings</h4>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Menu Items</label>
                {(element.props.menuItems || []).map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-center mb-2">
                    <input
                      type="text"
                      className="border rounded px-2 py-1 w-32"
                      value={item.text}
                      onChange={e => {
                        const menuItems = [...element.props.menuItems];
                        menuItems[idx].text = e.target.value;
                        handleUpdateProps({ menuItems });
                      }}
                      placeholder="Label"
                    />
                    <input
                      type="text"
                      className="border rounded px-2 py-1 w-32"
                      value={item.url}
                      onChange={e => {
                        const menuItems = [...element.props.menuItems];
                        menuItems[idx].url = e.target.value;
                        handleUpdateProps({ menuItems });
                      }}
                      placeholder="URL"
                    />
                    <button
                      className="text-red-500 hover:text-red-700"
                      onClick={() => {
                        const menuItems = [...element.props.menuItems];
                        menuItems.splice(idx, 1);
                        handleUpdateProps({ menuItems });
                      }}
                    >Remove</button>
                  </div>
                ))}
                <button
                  className="text-blue-500 hover:text-blue-700 mt-2"
                  onClick={() => {
                    const menuItems = [...(element.props.menuItems || [])];
                    menuItems.push({ text: '', url: '' });
                    handleUpdateProps({ menuItems });
                  }}
                >Add Menu Item</button>
              </div>
            </div>
          );
        case 'image':
          return (
            <div className="space-y-4">
              <h4 className="text-md font-semibold text-gray-900">Image Settings</h4>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    className="block w-full border rounded px-2 py-1"
                    value={element.props.src || ''}
                    onChange={e => handleUpdateProps({ src: e.target.value })}
                    placeholder="Paste image URL or use media library"
                  />
                  <button type="button" className="p-2 bg-gray-100 rounded hover:bg-blue-100" onClick={() => setMediaModalOpen(true)}>
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M4 12l4-4a2 2 0 012.828 0l4.586 4.586a2 2 0 002.828 0L20 12" />
                    </svg>
                  </button>
                </div>
                {mediaModalOpen && (
                  <MediaLibraryModal
                    isOpen={mediaModalOpen}
                    onClose={() => setMediaModalOpen(false)}
                    onSelect={url => { handleUpdateProps({ src: url }); setMediaModalOpen(false); }}
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Alt Text (for SEO & accessibility)</label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={element.props.alt || ''}
                  onChange={e => handleUpdateProps({ alt: e.target.value })}
                  placeholder="Describe the image"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Width (px or %)</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={element.props.width || ''}
                    onChange={e => handleUpdateProps({ width: e.target.value })}
                    placeholder="e.g. 400px or 100%"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Height (px or auto)</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={element.props.height || ''}
                    onChange={e => handleUpdateProps({ height: e.target.value })}
                    placeholder="e.g. 300px or auto"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Fit Mode</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={element.props.objectFit || 'cover'}
                  onChange={e => handleUpdateProps({ objectFit: e.target.value })}
                >
                  <option value="cover">Cover</option>
                  <option value="contain">Contain</option>
                  <option value="fill">Fill</option>
                  <option value="none">None</option>
                  <option value="scale-down">Scale Down</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Alignment</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={element.props.alignment || 'center'}
                  onChange={e => handleUpdateProps({ alignment: e.target.value })}
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Border Radius</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={element.props.borderRadius || ''}
                    onChange={e => handleUpdateProps({ borderRadius: e.target.value })}
                    placeholder="e.g. 8px or 50%"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Border</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={element.props.border || ''}
                    onChange={e => handleUpdateProps({ border: e.target.value })}
                    placeholder="e.g. 1px solid #ccc"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Box Shadow</label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={element.props.boxShadow || ''}
                  onChange={e => handleUpdateProps({ boxShadow: e.target.value })}
                  placeholder="e.g. 0 2px 8px #0002"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!element.props.lightbox}
                  onChange={e => handleUpdateProps({ lightbox: e.target.checked })}
                  className="mr-2"
                  id="lightbox-toggle"
                />
                <label htmlFor="lightbox-toggle" className="text-sm font-medium text-gray-700">Enable Lightbox (click to enlarge)</label>
              </div>
            </div>
          );
        case 'image-gallery':
          return (
            <div className="space-y-4">
              <h4 className="text-md font-semibold text-gray-900">Image Gallery Settings</h4>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gallery Images</label>
                <div className="space-y-2">
                  {(element.props.images || []).map((img: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 mb-1">
                      <img src={img.url} alt={img.alt || ''} className="w-12 h-12 object-cover rounded border" />
                      <input
                        type="text"
                        className="flex-1 p-2 border border-gray-300 rounded-md"
                        value={img.alt || ''}
                        onChange={e => {
                          const images = [...(element.props.images || [])];
                          images[idx] = { ...images[idx], alt: e.target.value };
                          handleUpdateProps({ images });
                        }}
                        placeholder="Alt text (for SEO)"
                      />
                      <button
                        type="button"
                        className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200"
                        onClick={() => {
                          const images = [...(element.props.images || [])];
                          images.splice(idx, 1);
                          handleUpdateProps({ images });
                        }}
                        title="Remove image"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded"
                    onClick={() => setMediaModalOpen(true)}
                  >
                    Add Image
                  </button>
                  {mediaModalOpen && (
                    <MediaLibraryModal
                      isOpen={mediaModalOpen}
                      onClose={() => setMediaModalOpen(false)}
                      onSelect={url => {
                        const images = [...(element.props.images || [])];
                        images.push({ url, alt: '' });
                        handleUpdateProps({ images });
                        setMediaModalOpen(false);
                      }}
                    />
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Columns</label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={element.props.columns || 3}
                    onChange={e => handleUpdateProps({ columns: parseInt(e.target.value) })}
                  >
                    {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Gap (px)</label>
                  <input
                    type="number"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={element.props.gap || 8}
                    onChange={e => handleUpdateProps({ gap: parseInt(e.target.value) })}
                    min={0}
                    max={64}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Hover Effect</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={element.props.hoverEffect || 'zoom'}
                  onChange={e => handleUpdateProps({ hoverEffect: e.target.value })}
                >
                  <option value="zoom">Zoom In</option>
                  <option value="darken">Darken</option>
                  <option value="none">None</option>
                </select>
              </div>
              {/* Future: grid/carousel toggle, padding, responsive, etc. */}
            </div>
          );
        case 'video-embed':
          return (
            <div className="space-y-4">
              <h4 className="text-md font-semibold text-gray-900">Video Embed Settings</h4>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Video URL</label>
                <input
                  type="text"
                  className="block w-full border rounded px-2 py-1"
                  value={element.props.url || ''}
                  onChange={e => handleUpdateProps({ url: e.target.value })}
                  placeholder="Paste YouTube, Vimeo, or Facebook URL"
                  aria-label="Video URL"
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={element.props.controls ?? true}
                    onChange={e => handleUpdateProps({ controls: e.target.checked })}
                  />
                  Show Controls
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={element.props.autoplay ?? false}
                    onChange={e => handleUpdateProps({ autoplay: e.target.checked })}
                  />
                  Autoplay
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={element.props.mute ?? false}
                    onChange={e => handleUpdateProps({ mute: e.target.checked })}
                  />
                  Mute
                </label>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={element.props.loop ?? false}
                    onChange={e => handleUpdateProps({ loop: e.target.checked })}
                  />
                  Loop
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={element.props.lazy ?? true}
                    onChange={e => handleUpdateProps({ lazy: e.target.checked })}
                  />
                  Lazy Load
                </label>
              </div>
            </div>
          );
        case 'video-upload':
          return (
            <div className="space-y-4">
              <h4 className="text-md font-semibold text-gray-900">Video Upload Settings</h4>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Video File (.mp4/.webm, max 100MB)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    className="block w-full border rounded px-2 py-1"
                    value={element.props.url || ''}
                    onChange={e => handleUpdateProps({ url: e.target.value })}
                    placeholder="Paste video URL or use media library"
                    aria-label="Video file URL"
                  />
                  {/* TODO: Add media library modal for video selection */}
                </div>
                {!element.props.url && (
                  <div className="text-xs text-gray-500 mt-1">No video selected. Upload or paste a video file URL.</div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Custom Thumbnail (optional)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    className="block w-full border rounded px-2 py-1"
                    value={element.props.thumbnail || ''}
                    onChange={e => handleUpdateProps({ thumbnail: e.target.value })}
                    placeholder="Paste image URL or use media library"
                    aria-label="Video thumbnail URL"
                  />
                  {/* TODO: Add media library modal for thumbnail selection */}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={element.props.controls ?? true}
                    onChange={e => handleUpdateProps({ controls: e.target.checked })}
                  />
                  Show Controls
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={element.props.autoplay ?? false}
                    onChange={e => handleUpdateProps({ autoplay: e.target.checked })}
                  />
                  Autoplay
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={element.props.mute ?? false}
                    onChange={e => handleUpdateProps({ mute: e.target.checked })}
                  />
                  Mute
                </label>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={element.props.loop ?? false}
                    onChange={e => handleUpdateProps({ loop: e.target.checked })}
                  />
                  Loop
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={element.props.lazy ?? true}
                    onChange={e => handleUpdateProps({ lazy: e.target.checked })}
                  />
                  Lazy Load
                </label>
              </div>
            </div>
          );
        case 'icon-box':
          return (
            <div className="space-y-4">
              <h4 className="text-md font-semibold text-gray-900">Icon Box Settings</h4>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Icon Type</label>
                <select
                  className="block w-full border rounded px-2 py-1"
                  value={element.props.iconType || 'svg'}
                  onChange={e => handleUpdateProps({ iconType: e.target.value })}
                  aria-label="Icon type"
                >
                  <option value="svg">SVG</option>
                  <option value="image">Image</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
                <input
                  type="text"
                  className="block w-full border rounded px-2 py-1"
                  value={element.props.icon || ''}
                  onChange={e => handleUpdateProps({ icon: e.target.value })}
                  placeholder={element.props.iconType === 'image' ? 'Paste image URL' : 'Paste SVG code'}
                  aria-label="Icon"
                />
                {/* TODO: Add icon picker or media library modal */}
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Icon Size</label>
                  <input
                    type="number"
                    min={16}
                    max={128}
                    className="block w-20 border rounded px-2 py-1"
                    value={element.props.iconSize || 40}
                    onChange={e => handleUpdateProps({ iconSize: Number(e.target.value) })}
                    aria-label="Icon size"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Icon Color</label>
                  <input
                    type="color"
                    className="block w-10 h-10 p-0 border rounded"
                    value={element.props.iconColor || '#6366f1'}
                    onChange={e => handleUpdateProps({ iconColor: e.target.value })}
                    aria-label="Icon color"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Icon Background</label>
                  <input
                    type="color"
                    className="block w-10 h-10 p-0 border rounded"
                    value={element.props.iconBg || '#f3f4f6'}
                    onChange={e => handleUpdateProps({ iconBg: e.target.value })}
                    aria-label="Icon background"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Layout</label>
                <select
                  className="block w-full border rounded px-2 py-1"
                  value={element.props.layout || 'icon-top'}
                  onChange={e => handleUpdateProps({ layout: e.target.value })}
                  aria-label="Layout"
                >
                  <option value="icon-top">Icon Top</option>
                  <option value="icon-left">Icon Left</option>
                  <option value="icon-right">Icon Right</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  className="block w-full border rounded px-2 py-1"
                  value={element.props.title || ''}
                  onChange={e => handleUpdateProps({ title: e.target.value })}
                  placeholder="Title"
                  aria-label="Title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  className="block w-full border rounded px-2 py-1"
                  value={element.props.description || ''}
                  onChange={e => handleUpdateProps({ description: e.target.value })}
                  placeholder="Description"
                  aria-label="Description"
                  rows={2}
                />
              </div>
            </div>
          );
        case 'logo-carousel':
          return (
            <div className="space-y-4">
              <h4 className="text-md font-semibold text-gray-900">Logo Carousel Settings</h4>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Logos (up to 12)</label>
                <div className="space-y-2">
                  {(element.props.logos || []).map((logo: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 mb-1">
                      <img src={logo.url} alt={logo.alt || ''} className="w-12 h-12 object-contain rounded border" />
                      <input
                        type="text"
                        className="block w-32 border rounded px-2 py-1"
                        value={logo.alt || ''}
                        onChange={e => {
                          const newLogos = [...(element.props.logos || [])];
                          newLogos[idx] = { ...newLogos[idx], alt: e.target.value };
                          handleUpdateProps({ logos: newLogos });
                        }}
                        placeholder="Alt text"
                        aria-label="Logo alt text"
                      />
                      <button
                        type="button"
                        className="text-red-500 hover:text-red-700 text-xs px-2"
                        onClick={() => {
                          const newLogos = [...(element.props.logos || [])];
                          newLogos.splice(idx, 1);
                          handleUpdateProps({ logos: newLogos });
                        }}
                        aria-label="Remove logo"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  {(element.props.logos || []).length < 12 && (
                    <button
                      type="button"
                      className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-xs font-medium hover:bg-blue-200"
                      onClick={() => {
                        // TODO: Open media library modal for logo selection
                        const newLogos = [...(element.props.logos || []), { url: '', alt: '' }];
                        handleUpdateProps({ logos: newLogos });
                      }}
                      aria-label="Add logo"
                    >
                      + Add Logo
                    </button>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Visible Items</label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    className="block w-20 border rounded px-2 py-1"
                    value={element.props.visible || 6}
                    onChange={e => handleUpdateProps({ visible: Number(e.target.value) })}
                    aria-label="Visible items"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Scroll Speed (seconds)</label>
                  <input
                    type="number"
                    min={5}
                    max={120}
                    className="block w-24 border rounded px-2 py-1"
                    value={element.props.speed || 30}
                    onChange={e => handleUpdateProps({ speed: Number(e.target.value) })}
                    aria-label="Scroll speed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hover Effect</label>
                  <select
                    className="block w-full border rounded px-2 py-1"
                    value={element.props.hoverEffect || 'color'}
                    onChange={e => handleUpdateProps({ hoverEffect: e.target.value })}
                    aria-label="Hover effect"
                  >
                    <option value="color">Grayscale to Color</option>
                    <option value="none">None</option>
                  </select>
                </div>
              </div>
            </div>
          );
        case 'audio-player':
          return (
            <div className="space-y-4">
              <h4 className="text-md font-semibold text-gray-900">Audio Player Settings</h4>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Audio File</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    className="block w-full border rounded px-2 py-1"
                    value={element.props.url || ''}
                    onChange={e => handleUpdateProps({ url: e.target.value })}
                    placeholder="Paste audio file URL or use media library"
                    aria-label="Audio file URL"
                  />
                  {/* TODO: Add media library modal for audio selection */}
                </div>
                {!element.props.url && (
                  <div className="text-xs text-gray-500 mt-1">No audio selected. Upload or paste an audio file URL.</div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Alt Text (for accessibility)</label>
                <input
                  type="text"
                  className="block w-full border rounded px-2 py-1"
                  value={element.props.alt || ''}
                  onChange={e => handleUpdateProps({ alt: e.target.value })}
                  placeholder="Audio description"
                  aria-label="Audio alt text"
                />
              </div>
              {/* Future: player style options */}
            </div>
          );
        default:
          return (
            <BlockSettings
              block={element}
              onUpdate={(props) => onUpdateBlock(sectionId, rowId, columnId, element.id, props)}
            />
          );
      }
    case 'section':
      return (
        <div className="space-y-4">
          <h4 className="text-md font-semibold text-gray-900 capitalize">Section Settings</h4>
          {styleSettings}
          <MediaLibraryModal
            isOpen={mediaModalOpen}
            onClose={() => setMediaModalOpen(false)}
            onSelect={url => handleUpdateProps({ backgroundImage: url })}
          />
        </div>
      );
    case 'row':
      return (
        <div className="space-y-4">
          <h4 className="text-md font-semibold text-gray-900">Row Settings</h4>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
            <input
              type="color"
              value={(element.props || {}).backgroundColor || '#ffffff'}
              onChange={e => handleUpdateProps({ backgroundColor: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Background Image</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                className="block w-full border rounded px-2 py-1"
                value={(element.props || {}).backgroundImage || ''}
                onChange={e => handleUpdateProps({ backgroundImage: e.target.value })}
                placeholder="Background Image URL"
              />
              <button type="button" className="p-2 bg-gray-100 rounded hover:bg-blue-100" onClick={() => setRowBgMediaModalOpen(true)}>
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M4 12l4-4a2 2 0 012.828 0l4.586 4.586a2 2 0 002.828 0L20 12" />
                </svg>
              </button>
            </div>
            {rowBgMediaModalOpen && (
              <MediaLibraryModal
                isOpen={rowBgMediaModalOpen}
                onClose={() => setRowBgMediaModalOpen(false)}
                onSelect={url => { handleUpdateProps({ backgroundImage: url }); setRowBgMediaModalOpen(false); }}
              />
            )}
          </div>
          <div className="flex gap-2">
            <div>
              <label className="block text-xs">Padding</label>
              <input
                type="number"
                className="w-20 border rounded px-1 py-0.5"
                value={element.props.padding || 0}
                min={0}
                max={200}
                onChange={e => handleUpdateProps({ padding: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-xs">Margin</label>
              <input
                type="number"
                className="w-20 border rounded px-1 py-0.5"
                value={element.props.margin || 0}
                min={0}
                max={200}
                onChange={e => handleUpdateProps({ margin: Number(e.target.value) })}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs">Border Radius</label>
            <input
              type="number"
              className="w-20 border rounded px-1 py-0.5"
              value={element.props.borderRadius || 0}
              min={0}
              max={100}
              onChange={e => handleUpdateProps({ borderRadius: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="block text-xs">Box Shadow</label>
            <input
              type="text"
              className="w-full border rounded px-2 py-1"
              value={element.props.boxShadow || ''}
              onChange={e => handleUpdateProps({ boxShadow: e.target.value })}
              placeholder="e.g. 0 2px 8px #0002"
            />
          </div>
        </div>
      );
    case 'column':
      return (
        <div className="space-y-4">
          <h4 className="text-md font-semibold text-gray-900">Column Settings</h4>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
            <input
              type="color"
              value={(element.props || {}).backgroundColor || '#ffffff'}
              onChange={e => handleUpdateProps({ backgroundColor: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Background Image</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                className="block w-full border rounded px-2 py-1"
                value={(element.props || {}).backgroundImage || ''}
                onChange={e => handleUpdateProps({ backgroundImage: e.target.value })}
                placeholder="Background Image URL"
              />
              <button type="button" className="p-2 bg-gray-100 rounded hover:bg-blue-100" onClick={() => setColumnBgMediaModalOpen(true)}>
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M4 12l4-4a2 2 0 012.828 0l4.586 4.586a2 2 0 002.828 0L20 12" />
                </svg>
              </button>
            </div>
            {columnBgMediaModalOpen && (
              <MediaLibraryModal
                isOpen={columnBgMediaModalOpen}
                onClose={() => setColumnBgMediaModalOpen(false)}
                onSelect={url => { handleUpdateProps({ backgroundImage: url }); setColumnBgMediaModalOpen(false); }}
              />
            )}
          </div>
          <div className="flex gap-2">
            <div>
              <label className="block text-xs">Padding</label>
              <input
                type="number"
                className="w-20 border rounded px-1 py-0.5"
                value={element.props.padding || 0}
                min={0}
                max={200}
                onChange={e => handleUpdateProps({ padding: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-xs">Margin</label>
              <input
                type="number"
                className="w-20 border rounded px-1 py-0.5"
                value={element.props.margin || 0}
                min={0}
                max={200}
                onChange={e => handleUpdateProps({ margin: Number(e.target.value) })}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs">Border Radius</label>
            <input
              type="number"
              className="w-20 border rounded px-1 py-0.5"
              value={element.props.borderRadius || 0}
              min={0}
              max={100}
              onChange={e => handleUpdateProps({ borderRadius: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="block text-xs">Box Shadow</label>
            <input
              type="text"
              className="w-full border rounded px-2 py-1"
              value={element.props.boxShadow || ''}
              onChange={e => handleUpdateProps({ boxShadow: e.target.value })}
              placeholder="e.g. 0 2px 8px #0002"
            />
          </div>
          <div>
            <label className="block text-xs">Width</label>
            <select
              className="w-full border rounded px-2 py-1"
              value={element.props.width || 'full'}
              onChange={e => handleUpdateProps({ width: e.target.value })}
            >
              <option value="full">Full</option>
              <option value="half">Half</option>
              <option value="third">Third</option>
              <option value="quarter">Quarter</option>
            </select>
          </div>
        </div>
      );
    default:
      return (
        <div className="text-gray-500">
          Settings for {type} elements coming soon.
        </div>
      );
  }
};

export default BlockSettingsPanel; 