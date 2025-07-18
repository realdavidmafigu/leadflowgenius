import React from 'react';
import BlockRenderer from './BlockRenderer';

interface BuilderCanvasProps {
  sections: any[];
  isPreviewMode: boolean;
  handleCanvasDrop: (e: React.DragEvent) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleAddSection: (type: string) => void;
  handleAddRow: (sectionId: string, columnCount: number) => void;
  handleAddColumn: (sectionId: string, rowId: string, width: string) => void;
  handleAddBlock: (sectionId: string, rowId: string, columnId: string, type: any) => void;
  handleBlockUpdate: (sectionId: string, rowId: string, columnId: string, blockId: string, props: any) => void;
  handleBlockRemove: (sectionId: string, rowId: string, columnId: string, blockId: string) => void;
  handleSectionRemove: (sectionId: string) => void;
  handleRowRemove: (sectionId: string, rowId: string) => void;
  handleColumnRemove: (sectionId: string, rowId: string, columnId: string) => void;
  selectElement: (type: string, id: string) => void;
  selectedElement: any;
  handleSectionDrop: (e: React.DragEvent, sectionId: string) => void;
  handleRowDrop: (e: React.DragEvent, sectionId: string, rowId: string) => void;
  handleColumnDrop: (e: React.DragEvent, sectionId: string, rowId: string, columnId: string) => void;
}

// Import SectionRenderer from the same file or move it to its own file if needed
// For now, assume it is in the same file

function SectionRenderer({ 
  section, 
  isPreviewMode, 
  onAddRow, 
  onAddColumn, 
  onAddBlock, 
  onUpdateBlock, 
  onRemoveBlock, 
  onRemoveSection,
  onRemoveRow,
  onRemoveColumn,
  onSelectElement, 
  selectedElement,
  onSectionDrop,
  onRowDrop,
  onColumnDrop,
  sectionIndex
}: any) {
  const isSelected = selectedElement?.type === 'section' && selectedElement?.id === section.id;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  return (
    <div 
      className={`relative group transition-all duration-200 bg-white/90 shadow-lg rounded-2xl mb-8 border border-transparent ${
        isSelected && !isPreviewMode 
          ? 'border-blue-400 ring-2 ring-blue-300' 
          : 'hover:border-blue-200'
      }`}
      style={{ 
        backgroundColor: section.props.backgroundColor || '#fff',
        backgroundImage: section.props.backgroundImage ? `url(${section.props.backgroundImage})` : undefined,
        backgroundSize: section.props.backgroundImage ? 'cover' : undefined,
        backgroundPosition: section.props.backgroundImage ? 'center' : undefined,
      }}
      onClick={() => !isPreviewMode && onSelectElement('section', section.id)}
      onDrop={(e) => {
        if (!isPreviewMode) {
          const dragType = e.dataTransfer.getData('dragType');
          const dragData = JSON.parse(e.dataTransfer.getData('dragData') || '{}');
          if (dragType === 'row') {
            onAddRow(section.id, dragData.columnCount || 1);
            return;
          }
          onSectionDrop(e, section.id);
        }
      }}
      onDragOver={handleDragOver}
    >
      {/* Overlay for background image opacity */}
      {section.props.backgroundImage && (
        <div
          className="absolute inset-0 pointer-events-none rounded-2xl"
          style={{
            background: '#000',
            opacity: section.props.backgroundOverlayOpacity ?? 0.4,
            zIndex: 1,
          }}
        />
      )}
      {/* Delete Button for Section */}
      {!isPreviewMode && (
        <button
          onClick={e => {
            e.stopPropagation();
            if (confirm('Are you sure you want to delete this section? This will remove all content within it.')) {
              onRemoveSection(section.id);
            }
          }}
          className="absolute top-2 right-2 z-20 p-2 rounded-full bg-red-500 text-white shadow-lg opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200 hover:bg-red-600 focus:bg-red-600"
          title="Delete Section"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )}
      <div className={`mx-auto ${section.props.maxWidth} ${section.props.padding}`}
        style={{ position: 'relative', zIndex: 2 }}
      >
        {section.rows.length === 0 ? (
          <div className="text-center py-16 opacity-60 select-none">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-400 mb-2">Empty Section</h3>
            <p className="text-gray-400 mb-6">Drag rows here to start building your layout</p>
          </div>
        ) : (
          <div className="space-y-6">
            {section.rows.map((row: any, rowIndex: number) => (
              <RowRenderer
                key={row.id}
                sectionId={section.id}
                row={row}
                rowIndex={rowIndex}
                isPreviewMode={isPreviewMode}
                onAddColumn={onAddColumn}
                onAddBlock={onAddBlock}
                onUpdateBlock={onUpdateBlock}
                onRemoveBlock={onRemoveBlock}
                onRemoveRow={onRemoveRow}
                onRemoveColumn={onRemoveColumn}
                onSelectElement={onSelectElement}
                selectedElement={selectedElement}
                onRowDrop={onRowDrop}
                onColumnDrop={onColumnDrop}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function RowRenderer({ 
  sectionId, 
  row, 
  rowIndex,
  isPreviewMode, 
  onAddColumn, 
  onAddBlock, 
  onUpdateBlock, 
  onRemoveBlock, 
  onRemoveRow,
  onRemoveColumn,
  onSelectElement, 
  selectedElement,
  onRowDrop,
  onColumnDrop
}: any) {
  const isSelected = selectedElement?.type === 'row' && selectedElement?.id === row.id;
  const [showColumnSettings, setShowColumnSettings] = React.useState(false);
  const [pendingDrop, setPendingDrop] = React.useState(false);
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    // If dragging a column, highlight drop zone
    if (e.dataTransfer.types.includes('text/plain') && e.dataTransfer.getData('text/plain') === 'column') {
      setPendingDrop(true);
    }
  };
  const handleDragLeave = (e: React.DragEvent) => {
    setPendingDrop(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    setPendingDrop(false);
    if (e.dataTransfer.types.includes('text/plain') && e.dataTransfer.getData('text/plain') === 'column') {
      setShowColumnSettings(true);
    } else {
      onRowDrop(e, sectionId, row.id);
    }
  };

  return (
    <div 
      className={`relative group transition-all duration-200 bg-gray-50 rounded-xl border border-transparent shadow-sm ${
        isSelected && !isPreviewMode 
          ? 'border-green-400 ring-2 ring-green-200' 
          : 'hover:border-green-200'
      } ${pendingDrop ? 'ring-2 ring-yellow-400 border-yellow-400' : ''}`}
      style={{ 
        backgroundColor: row.props?.backgroundColor || 'transparent',
        backgroundImage: row.props?.backgroundImage ? `url(${row.props.backgroundImage})` : undefined,
        backgroundSize: row.props?.backgroundImage ? 'cover' : undefined,
        backgroundPosition: row.props?.backgroundImage ? 'center' : undefined,
      }}
      onClick={() => !isPreviewMode && onSelectElement('row', row.id)}
      onDrop={e => {
        setPendingDrop(false);
        const dragType = e.dataTransfer.getData('dragType');
        const dragData = JSON.parse(e.dataTransfer.getData('dragData') || '{}');
        if (dragType === 'column') {
          setShowColumnSettings(true);
          return;
        }
        onRowDrop(e, sectionId, row.id);
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {/* Overlay for background image opacity */}
      {row.props?.backgroundImage && (
        <div
          className="absolute inset-0 pointer-events-none rounded-xl"
          style={{
            background: '#000',
            opacity: row.props.backgroundOverlayOpacity ?? 0.4,
            zIndex: 1,
          }}
        />
      )}
      {/* Delete Button for Row */}
      {!isPreviewMode && (
        <button
          onClick={e => {
            e.stopPropagation();
            if (confirm('Are you sure you want to delete this row? This will remove all columns and content within it.')) {
              onRemoveRow(sectionId, row.id);
            }
          }}
          className="absolute top-2 right-2 z-20 p-2 rounded-full bg-red-500 text-white shadow-lg opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200 hover:bg-red-600 focus:bg-red-600"
          title="Delete Row"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )}
      {/* Column Settings Modal for Column Drop */}
      {showColumnSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Columns</h3>
            <p className="text-sm text-gray-600 mb-4">Choose how many columns you want in this row:</p>
            <div className="space-y-2">
              {[1, 2, 3, 4].map((count) => (
                <button
                  key={count}
                  onClick={() => {
                    // Remove all existing columns first (optional, or just add new ones)
                    // Add the chosen number of columns
                    const width = count === 1 ? 'full' : count === 2 ? 'half' : count === 3 ? 'third' : 'quarter';
                    for (let i = 0; i < count; i++) {
                      onAddColumn(sectionId, row.id, width);
                    }
                    setShowColumnSettings(false);
                  }}
                  className="w-full flex items-center p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-yellow-50 hover:border-yellow-300 transition-all duration-200"
                >
                  <div className="flex items-center justify-center w-8 h-8 bg-yellow-100 rounded-md mr-3">
                    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              onClick={() => setShowColumnSettings(false)}
              className="mt-4 w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      <div className="p-6" style={{ position: 'relative', zIndex: 2 }}>
        {row.columns.length === 0 ? (
          <div className="text-center py-8 opacity-60 select-none">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-400 mb-2">Empty Row</h3>
            <p className="text-gray-400 mb-6">Drag columns here to start building your layout</p>
          </div>
        ) : (
          <div className="flex -mx-2">
            {row.columns.map((column: any, columnIndex: number) => (
              <ColumnRenderer
                key={column.id}
                sectionId={sectionId}
                rowId={row.id}
                column={column}
                columnIndex={columnIndex}
                isPreviewMode={isPreviewMode}
                onAddBlock={onAddBlock}
                onUpdateBlock={onUpdateBlock}
                onRemoveBlock={onRemoveBlock}
                onRemoveColumn={onRemoveColumn}
                onSelectElement={onSelectElement}
                selectedElement={selectedElement}
                onColumnDrop={onColumnDrop}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ColumnRenderer({ 
  sectionId, 
  rowId, 
  column, 
  columnIndex,
  isPreviewMode, 
  onAddBlock, 
  onUpdateBlock, 
  onRemoveBlock, 
  onRemoveColumn,
  onSelectElement, 
  selectedElement,
  onColumnDrop
}: any) {
  const isSelected = selectedElement?.type === 'column' && selectedElement?.id === column.id;
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };
  
  // Convert width to Tailwind classes
  const getWidthClass = (width: string) => {
    switch (width) {
      case 'full': return 'w-full';
      case '1/2': return 'w-full md:w-1/2';
      case '1/3': return 'w-full md:w-1/3';
      case '2/3': return 'w-full md:w-2/3';
      case '1/4': return 'w-full md:w-1/4';
      case '3/4': return 'w-full md:w-3/4';
      default: return 'w-full';
    }
  };

  return (
    <div 
      className={`px-2 ${getWidthClass(column.width)} group transition-all duration-200`}
    >
      <div 
        className={`relative min-h-[100px] p-4 border-2 border-dashed border-gray-200 rounded-lg bg-white shadow-sm ${isSelected && !isPreviewMode ? 'border-yellow-400 ring-2 ring-yellow-200' : 'hover:border-yellow-200'}`}
        style={{ 
          ...(column.props ? {
            backgroundColor: column.props.backgroundColor || 'transparent',
            backgroundImage: column.props.backgroundImage ? `url(${column.props.backgroundImage})` : undefined,
            backgroundSize: column.props.backgroundImage ? 'cover' : undefined,
            backgroundPosition: column.props.backgroundImage ? 'center' : undefined,
          } : { backgroundColor: 'transparent' }),
        }}
        onClick={() => !isPreviewMode && onSelectElement('column', column.id)}
        onDrop={(e) => !isPreviewMode && onColumnDrop(e, sectionId, rowId, column.id)}
        onDragOver={handleDragOver}
      >
        {/* Overlay for background image opacity */}
        {column.props?.backgroundImage && (
          <div
            className="absolute inset-0 pointer-events-none rounded-lg"
            style={{
              background: '#000',
              opacity: column.props.backgroundOverlayOpacity ?? 0.4,
              zIndex: 1,
            }}
          />
        )}
        {/* Delete Button for Column */}
        {!isPreviewMode && (
          <button
            onClick={e => {
              e.stopPropagation();
              if (confirm('Are you sure you want to delete this column? This will remove all blocks within it.')) {
                onRemoveColumn(sectionId, rowId, column.id);
              }
            }}
            className="absolute top-2 right-2 z-20 p-2 rounded-full bg-red-500 text-white shadow-lg opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200 hover:bg-red-600 focus:bg-red-600"
            title="Delete Column"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
        {column.blocks.length === 0 ? (
          <div className="text-center py-8 opacity-60 select-none">
            <p className="text-gray-400 mb-4">No blocks in this column</p>
            <div className="p-4 bg-purple-50 border border-purple-100 rounded-lg">
              <p className="text-sm text-purple-400">
                Drag blocks from the sidebar to add content
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4" style={{ position: 'relative', zIndex: 2 }}>
            {column.blocks.map((block: any) => (
              <div
                key={block.id}
                className={`relative group/block ${selectedElement?.type === 'block' && selectedElement?.id === block.id && !isPreviewMode ? 'ring-2 ring-blue-400' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isPreviewMode) {
                    onSelectElement('block', block.id);
                  }
                }}
              >
                <BlockRenderer
                  block={block}
                  isSelected={selectedElement?.type === 'block' && selectedElement?.id === block.id}
                  isPreviewMode={isPreviewMode}
                  onUpdate={(props) => onUpdateBlock(sectionId, rowId, column.id, block.id, props)}
                  onRemove={() => onRemoveBlock(sectionId, rowId, column.id, block.id)}
                  onSelect={() => onSelectElement('block', block.id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const BuilderCanvas: React.FC<BuilderCanvasProps> = ({
  sections,
  isPreviewMode,
  handleCanvasDrop,
  handleDragOver,
  handleAddSection,
  handleAddRow,
  handleAddColumn,
  handleAddBlock,
  handleBlockUpdate,
  handleBlockRemove,
  handleSectionRemove,
  handleRowRemove,
  handleColumnRemove,
  selectElement,
  selectedElement,
  handleSectionDrop,
  handleRowDrop,
  handleColumnDrop,
}) => {
  // Enhanced drop handler for the canvas
  const enhancedHandleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dragType = e.dataTransfer.getData('dragType');
    const dragData = JSON.parse(e.dataTransfer.getData('dragData') || '{}');
    if (dragType === 'section') {
      handleAddSection && handleAddSection(dragData.type || 'default');
      return;
    }
    handleCanvasDrop(e);
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <div 
          className={`relative bg-white shadow-lg rounded-lg overflow-hidden transition-all duration-200 ${
            isPreviewMode 
              ? 'shadow-none border-0' 
              : 'border border-gray-200 hover:border-gray-300'
          }`}
          style={{ 
            minHeight: '100vh',
            maxWidth: isPreviewMode ? '100%' : '1200px',
            margin: '0 auto'
          }}
          onDrop={enhancedHandleCanvasDrop}
          onDragOver={handleDragOver}
        >
          {sections.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
              <div className="text-center max-w-md mx-auto px-6">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Start Building Your Funnel
                </h2>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Create high-converting pages by dragging and dropping elements from the sidebar. 
                  Build sections, add rows and columns, then fill them with content.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-blue-900 mb-1">Quick Start Guide</h4>
                      <ul className="text-xs text-blue-700 space-y-1">
                        <li>• Drag a section from the Layout panel</li>
                        <li>• Add rows and columns to structure your content</li>
                        <li>• Drop content blocks to build your page</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative">
              {sections.map((section, index) => (
                <SectionRenderer
                  key={section.id}
                  section={section}
                  isPreviewMode={isPreviewMode}
                  onAddRow={handleAddRow}
                  onAddColumn={handleAddColumn}
                  onAddBlock={handleAddBlock}
                  onUpdateBlock={handleBlockUpdate}
                  onRemoveBlock={handleBlockRemove}
                  onRemoveSection={handleSectionRemove}
                  onRemoveRow={handleRowRemove}
                  onRemoveColumn={handleColumnRemove}
                  onSelectElement={selectElement}
                  selectedElement={selectedElement}
                  onSectionDrop={handleSectionDrop}
                  onRowDrop={handleRowDrop}
                  onColumnDrop={handleColumnDrop}
                  sectionIndex={index}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BuilderCanvas; 