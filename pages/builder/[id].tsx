import { useRouter } from 'next/router';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useBuilderStore, BlockType } from '../../lib/builderStore';
import BuilderToolbar from '../../components/builder/BuilderToolbar';
import ComponentSidebar from '../../components/builder/ComponentSidebar';
import BlockRenderer from '../../components/builder/BlockRenderer';
import BuilderCanvas from '../../components/builder/BuilderCanvas';
import ElementsPanel from '../../components/builder/ElementsPanel';
import BlockSettingsPanel from '../../components/builder/BlockSettingsPanel';

export default function FunnelBuilder() {
  const router = useRouter();
  const { id } = router.query;
  const [funnel, setFunnel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Zustand store
  const {
    sections,
    selectedElement,
    history,
    historyIndex,
    isSaving,
    isPublished,
    addSection,
    addRow,
    addColumn,
    addBlock,
    updateBlock,
    removeBlock,
    removeSection,
    removeRow,
    removeColumn,
    selectElement,
    clearSelection,
    undo,
    redo,
    setSaving,
    setPublished,
    loadLayout,
  } = useBuilderStore();

  // Fetch funnel data
  useEffect(() => {
    if (!id) return;
    
    const fetchFunnel = async () => {
      try {
        const session = await supabase.auth.getSession();
        const res = await fetch(`/api/funnels/${id}`, {
          headers: {
            'Authorization': `Bearer ${session.data.session?.access_token}`
          }
        });
        
        if (res.ok) {
          const data = await res.json();
          setFunnel(data.funnel);
          
          // Load layout if it exists
          if (data.funnel.layout && data.funnel.layout.length > 0) {
            loadLayout(data.funnel.layout);
          }
          
          setPublished(data.funnel.published || false);
        } else {
          console.error('Failed to fetch funnel');
        }
      } catch (error) {
        console.error('Error fetching funnel:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFunnel();
  }, [id, loadLayout, setPublished]);

  // Auto-save functionality
  const saveFunnel = useCallback(async () => {
    if (!funnel || !id) return;
    
    setSaving(true);
    try {
      const session = await supabase.auth.getSession();
      const res = await fetch('/api/update-funnel', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.data.session?.access_token}`
        },
        body: JSON.stringify({
          funnelId: id,
          layout: sections,
          published: isPublished,
        }),
      });
      
      if (!res.ok) {
        throw new Error('Failed to save funnel');
      }
    } catch (error) {
      console.error('Error saving funnel:', error);
    } finally {
      setSaving(false);
    }
  }, [funnel, id, sections, isPublished, setSaving]);

  // Auto-save on changes
  useEffect(() => {
    if (sections.length > 0) {
      const timeoutId = setTimeout(saveFunnel, 2000); // Save after 2 seconds of no changes
      return () => clearTimeout(timeoutId);
    }
  }, [sections, saveFunnel]);

  // Handle adding sections
  const handleAddSection = (type: 'default' | 'hero' | 'features' | 'testimonials' | 'contact' = 'default') => {
    addSection(type);
  };

  // Handle adding rows
  const handleAddRow = (sectionId: string, columnCount: number) => {
    // Create a row with the specified number of columns
    const rowType = columnCount === 1 ? 'single' : columnCount === 2 ? 'two-column' : 'three-column';
    const newRowId = addRow(sectionId, rowType);
    if (newRowId) selectElement('row', newRowId);
  };

  // Handle adding columns
  const handleAddColumn = (sectionId: string, rowId: string, width: 'full' | 'half' | 'third' | 'quarter') => {
    const newColumnId = addColumn(sectionId, rowId, width);
    if (newColumnId) selectElement('column', newColumnId);
  };

  // Handle adding blocks
  const handleAddBlock = (sectionId: string, rowId: string, columnId: string, type: BlockType) => {
    addBlock(sectionId, rowId, columnId, type);
  };

  // Handle block updates
  const handleBlockUpdate = (sectionId: string, rowId: string, columnId: string, blockId: string, props: any) => {
    updateBlock(sectionId, rowId, columnId, blockId, props);
  };

  // Handle block removal
  const handleBlockRemove = (sectionId: string, rowId: string, columnId: string, blockId: string) => {
    removeBlock(sectionId, rowId, columnId, blockId);
    // Clear selection if the deleted block was selected
    if (selectedElement?.type === 'block' && selectedElement?.id === blockId) {
      clearSelection();
    }
  };

  // Handle section removal
  const handleSectionRemove = (sectionId: string) => {
    removeSection(sectionId);
    // Clear selection if the deleted section was selected
    if (selectedElement?.type === 'section' && selectedElement?.id === sectionId) {
      clearSelection();
    }
  };

  // Handle row removal
  const handleRowRemove = (sectionId: string, rowId: string) => {
    removeRow(sectionId, rowId);
    // Clear selection if the deleted row was selected
    if (selectedElement?.type === 'row' && selectedElement?.id === rowId) {
      clearSelection();
    }
  };

  // Handle column removal
  const handleColumnRemove = (sectionId: string, rowId: string, columnId: string) => {
    removeColumn(sectionId, rowId, columnId);
    // Clear selection if the deleted column was selected
    if (selectedElement?.type === 'column' && selectedElement?.id === columnId) {
      clearSelection();
    }
  };

  // Handle preview mode
  const handlePreview = () => {
    setIsPreviewMode(!isPreviewMode);
  };

  // Handle publish
  const handlePublish = async () => {
    setPublished(true);
    await saveFunnel();
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dragType = e.dataTransfer.getData('dragType');
    const dragData = JSON.parse(e.dataTransfer.getData('dragData') || '{}');

    if (dragType === 'section') {
      addSection(dragData.type);
    }
  };

  const handleSectionDrop = (e: React.DragEvent, sectionId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const dragType = e.dataTransfer.getData('dragType');
    const dragData = JSON.parse(e.dataTransfer.getData('dragData') || '{}');

    if (dragType === 'row') {
      // For drag and drop, we'll create a single column row by default
      addRow(sectionId, 'single');
    }
  };

  const handleRowDrop = (e: React.DragEvent, sectionId: string, rowId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const dragType = e.dataTransfer.getData('dragType');
    const dragData = JSON.parse(e.dataTransfer.getData('dragData') || '{}');

    if (dragType === 'column') {
      // For drag and drop, we'll create a full width column by default
      addColumn(sectionId, rowId, 'full');
    }
  };

  const blockTypes = [
    'text', 'heading', 'subheading', 'rich-text', 'button', 'link', 'divider', 'spacer', 'bullet-list', 'numbered-list', 'quote', 'badge', 'icon', 'navigation-bar', 'header', 'logo', 'menu', 'breadcrumb', 'footer', 'image', 'image-gallery', 'video-embed', 'video-upload', 'background-video', 'icon-box', 'image-text', 'logo-carousel', 'audio-player'
  ];

  const handleColumnDrop = (e: React.DragEvent, sectionId: string, rowId: string, columnId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const dragType = e.dataTransfer.getData('dragType');
    // Accept any block type except section/row/column
    if (
      dragType &&
      dragType !== 'section' &&
      dragType !== 'row' &&
      dragType !== 'column' &&
      blockTypes.includes(dragType)
    ) {
      addBlock(sectionId, rowId, columnId, dragType as BlockType);
    }
  };

  // Add handler to update section/row/column props
  const handleUpdateElementProps = (type: string, id: string, props: any) => {
    if (type === 'section') {
      // Find section and update its props
      const updatedSections = sections.map(section =>
        section.id === id ? { ...section, props: { ...section.props, ...props } } : section
      );
      loadLayout(updatedSections);
    } else if (type === 'row') {
      const updatedSections = sections.map(section => ({
        ...section,
        rows: section.rows.map(row =>
          row.id === id ? { ...row, props: { ...row.props, ...props } } : row
        )
      }));
      loadLayout(updatedSections);
    } else if (type === 'column') {
      const updatedSections = sections.map(section => ({
        ...section,
        rows: section.rows.map(row => ({
          ...row,
          columns: row.columns.map(column =>
            column.id === id ? { ...column, props: { ...column.props, ...props } } : column
          )
        }))
      }));
      loadLayout(updatedSections);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading funnel...</div>
      </div>
    );
  }

  if (!funnel) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">Funnel not found.</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      {!isPreviewMode && (
        <div className="w-64 flex flex-col h-full border-r border-gray-200 bg-white">
          <div className="flex-1 overflow-y-auto">
            <ElementsPanel 
              onAddSection={handleAddSection}
              onAddRow={handleAddRow}
              onAddColumn={handleAddColumn}
              onAddBlock={handleAddBlock}
              selectedElement={selectedElement}
              sections={sections}
            />
          </div>
        </div>
      )}
      {/* Canvas */}
      <div className="flex-1 flex flex-col h-full bg-gray-100">
        <BuilderToolbar
          onSave={saveFunnel}
          onPreview={handlePreview}
          onPublish={handlePublish}
          onUndo={undo}
          onRedo={redo}
          canUndo={historyIndex > 0}
          canRedo={historyIndex < history.length - 1}
          isSaving={isSaving}
          isPublished={isPublished}
        />
        <div className="flex-1 overflow-y-auto">
          <BuilderCanvas
            sections={sections}
            isPreviewMode={isPreviewMode}
            handleCanvasDrop={handleCanvasDrop}
            handleDragOver={handleDragOver}
            handleAddSection={handleAddSection}
            handleAddRow={handleAddRow}
            handleAddColumn={handleAddColumn}
            handleAddBlock={handleAddBlock}
            handleBlockUpdate={handleBlockUpdate}
            handleBlockRemove={handleBlockRemove}
            handleSectionRemove={handleSectionRemove}
            handleRowRemove={handleRowRemove}
            handleColumnRemove={handleColumnRemove}
            selectElement={selectElement}
            selectedElement={selectedElement}
            handleSectionDrop={handleSectionDrop}
            handleRowDrop={handleRowDrop}
            handleColumnDrop={handleColumnDrop}
          />
        </div>
      </div>
      {/* Settings Panel */}
      {!isPreviewMode && selectedElement && (
        <div className="w-80 flex flex-col h-full border-l border-gray-200 bg-white">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Element Settings</h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              <BlockSettingsPanel
                selectedElement={selectedElement}
                sections={sections}
                onUpdateBlock={handleBlockUpdate}
                onUpdateElementProps={handleUpdateElementProps}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Section Renderer Component
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
      className={`relative group transition-all duration-200 ${
        isSelected && !isPreviewMode 
          ? 'ring-2 ring-blue-500 ring-offset-2' 
          : !isPreviewMode 
            ? 'hover:ring-1 hover:ring-gray-300 hover:ring-offset-1' 
            : ''
      }`}
      style={{ backgroundColor: section.props.backgroundColor }}
      onClick={() => !isPreviewMode && onSelectElement('section', section.id)}
      onDrop={(e) => !isPreviewMode && onSectionDrop(e, section.id)}
      onDragOver={handleDragOver}
    >
      {/* Section Header - Only visible in edit mode */}
      {!isPreviewMode && (
        <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              <span className="text-sm font-medium capitalize">{section.type} Section</span>
              <span className="text-xs opacity-75">#{sectionIndex + 1}</span>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('Are you sure you want to delete this section? This will remove all content within it.')) {
                    onRemoveSection(section.id);
                  }
                }}
                className="p-1 hover:bg-red-600 rounded transition-colors"
                title="Delete Section"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={`mx-auto ${section.props.maxWidth} ${section.props.padding} ${!isPreviewMode ? 'pt-12' : ''}`}>
        {section.rows.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Empty Section</h3>
            <p className="text-gray-500 mb-6">Add rows to start building your content</p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-sm mx-auto">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-blue-900 mb-1">Add Content</h4>
                  <p className="text-xs text-blue-700">
                    Drag a row from the Layout panel or click the + button below
                  </p>
                </div>
              </div>
            </div>
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
        
                {/* Add Row Button */}
        {!isPreviewMode && (
          <div className="flex justify-center mt-6">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddRow(section.id, 1); // Add single column row by default
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="text-sm font-medium">Add Row</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Row Renderer Component
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  return (
    <div 
      className={`relative group transition-all duration-200 ${
        isSelected && !isPreviewMode 
          ? 'ring-2 ring-green-500 ring-offset-2' 
          : !isPreviewMode 
            ? 'hover:ring-1 hover:ring-green-300 hover:ring-offset-1' 
            : ''
      }`}
      onClick={() => !isPreviewMode && onSelectElement('row', row.id)}
      onDrop={(e) => !isPreviewMode && onRowDrop(e, sectionId, row.id)}
      onDragOver={handleDragOver}
    >
      {/* Row Header - Only visible in edit mode */}
      {!isPreviewMode && (
        <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              <span className="text-sm font-medium">Row {rowIndex + 1}</span>
              <span className="text-xs opacity-75">{row.columns.length} Column{row.columns.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('Are you sure you want to delete this row? This will remove all columns and content within it.')) {
                    onRemoveRow(sectionId, row.id);
                  }
                }}
                className="p-1 hover:bg-red-600 rounded transition-colors"
                title="Delete Row"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={`flex flex-wrap -mx-4 ${!isPreviewMode ? 'pt-12' : ''}`}>
        {row.columns.length === 0 ? (
          <div className="w-full text-center py-8">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h8M4 10h8M4 14h8M4 18h8" />
              </svg>
            </div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Empty Row</h4>
            <p className="text-gray-500 mb-4">Add columns to structure your content</p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 max-w-sm mx-auto">
              <div className="flex items-start space-x-2">
                <div className="flex-shrink-0">
                  <svg className="w-4 h-4 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h5 className="text-xs font-medium text-green-900 mb-1">Add Columns</h5>
                  <p className="text-xs text-green-700">
                    Drag a column from the Layout panel or click the + button below
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          row.columns.map((column: any, columnIndex: number) => (
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
          ))
        )}
      </div>
      
      {/* Add Column Button */}
      {!isPreviewMode && (
        <div className="flex justify-center mt-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddColumn(sectionId, row.id, 'full');
            }}
            className="flex items-center space-x-2 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors shadow-sm"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="text-xs font-medium">Add Column</span>
          </button>
        </div>
      )}
    </div>
  );
}

// Column Renderer Component
function ColumnRenderer({ 
  sectionId, 
  rowId, 
  column, 
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
      className={`px-4 ${getWidthClass(column.width)} group`}
    >
      <div 
        className={`relative min-h-[100px] p-4 border-2 border-dashed border-gray-300 rounded-lg ${isSelected && !isPreviewMode ? 'ring-2 ring-yellow-500' : ''}`}
        onClick={() => !isPreviewMode && onSelectElement('column', column.id)}
        onDrop={(e) => !isPreviewMode && onColumnDrop(e, sectionId, rowId, column.id)}
        onDragOver={handleDragOver}
      >
        {/* Delete Button for Column */}
        {!isPreviewMode && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm('Are you sure you want to delete this column? This will remove all blocks within it.')) {
                onRemoveColumn(sectionId, rowId, column.id);
              }
            }}
            className="absolute top-2 left-2 z-10 p-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
            title="Delete Column"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}

        {column.blocks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No blocks in this column</p>
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-sm text-purple-700">
                💡 Drag blocks from the sidebar to add content
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {column.blocks.map((block: any) => (
              <div
                key={block.id}
                className={`relative group/block ${selectedElement?.type === 'block' && selectedElement?.id === block.id && !isPreviewMode ? 'ring-2 ring-blue-500' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isPreviewMode) {
                    onSelectElement('block', block.id);
                  }
                }}
              >
                {/* Delete Button for Block */}
                {!isPreviewMode && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Are you sure you want to delete this block?')) {
                        onRemoveBlock(sectionId, rowId, column.id, block.id);
                      }
                    }}
                    className="absolute top-2 right-2 z-10 p-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors opacity-0 group-hover/block:opacity-100"
                    title="Delete Block"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}

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

// Element Settings Component
function ElementSettings({ selectedElement, sections, onUpdateBlock }: any) {
  if (!selectedElement) return null;

  // Find the selected element in the sections
  const findElement = () => {
    for (const section of sections) {
      if (selectedElement.type === 'section' && section.id === selectedElement.id) {
        return { type: 'section', element: section };
      }
      
      for (const row of section.rows) {
        if (selectedElement.type === 'row' && row.id === selectedElement.id) {
          return { type: 'row', element: row };
        }
        
        for (const column of row.columns) {
          if (selectedElement.type === 'column' && column.id === selectedElement.id) {
            return { type: 'column', element: column };
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
  if (!elementData) return null;

  const { type, element, sectionId, rowId, columnId } = elementData;

  switch (type) {
    case 'block':
      return (
        <BlockSettings
          block={element}
          onUpdate={(props) => onUpdateBlock(sectionId, rowId, columnId, element.id, props)}
        />
      );
    case 'section':
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
            <input
              type="color"
              value={element.props.backgroundColor || '#ffffff'}
              onChange={(e) => {
                // Update section props
                console.log('Update section background color');
              }}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
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
}

// Block Settings Component
function BlockSettings({ block, onUpdate }: { block: any; onUpdate: (props: any) => void }) {
  if (!block) return null;

  const handleChange = (key: string, value: any) => {
    onUpdate({ [key]: value });
  };

  const renderFontSettings = () => (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Font Family</label>
        <select
          value={block.props.fontFamily || 'Inter'}
          onChange={(e) => handleChange('fontFamily', e.target.value)}
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
        <label className="block text-sm font-medium text-gray-700 mb-2">Font Size</label>
        <input
          type="text"
          value={block.props.fontSize || '16px'}
          onChange={(e) => handleChange('fontSize', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
          placeholder="16px"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Font Weight</label>
        <select
          value={block.props.fontWeight || '400'}
          onChange={(e) => handleChange('fontWeight', e.target.value)}
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
        <label className="block text-sm font-medium text-gray-700 mb-2">Text Color</label>
        <input
          type="color"
          value={block.props.color || '#374151'}
          onChange={(e) => handleChange('color', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Text Alignment</label>
        <select
          value={block.props.textAlign || 'left'}
          onChange={(e) => handleChange('textAlign', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
          <option value="justify">Justify</option>
        </select>
      </div>
    </>
  );

  switch (block.type) {
    case 'text':
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Text Content</label>
            <textarea
              value={block.props.text || ''}
              onChange={(e) => handleChange('text', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              rows={4}
            />
          </div>
          {renderFontSettings()}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Line Height</label>
            <input
              type="text"
              value={block.props.lineHeight || '1.6'}
              onChange={(e) => handleChange('lineHeight', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="1.6"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Max Width</label>
            <input
              type="text"
              value={block.props.maxWidth || '100%'}
              onChange={(e) => handleChange('maxWidth', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="100%"
            />
          </div>
        </div>
      );

    case 'heading':
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Heading Text</label>
            <input
              type="text"
              value={block.props.text || ''}
              onChange={(e) => handleChange('text', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Heading Level</label>
            <select
              value={block.props.level || 'h2'}
              onChange={(e) => handleChange('level', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="h1">H1</option>
              <option value="h2">H2</option>
              <option value="h3">H3</option>
              <option value="h4">H4</option>
            </select>
          </div>
          {renderFontSettings()}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Margin Bottom</label>
            <input
              type="text"
              value={block.props.marginBottom || '16px'}
              onChange={(e) => handleChange('marginBottom', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="16px"
            />
          </div>
        </div>
      );

    case 'subheading':
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subheading Text</label>
            <input
              type="text"
              value={block.props.text || ''}
              onChange={(e) => handleChange('text', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          {renderFontSettings()}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Margin Bottom</label>
            <input
              type="text"
              value={block.props.marginBottom || '12px'}
              onChange={(e) => handleChange('marginBottom', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="12px"
            />
          </div>
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={block.props.shadow || false}
                onChange={(e) => handleChange('shadow', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Text Shadow</span>
            </label>
          </div>
        </div>
      );

    case 'rich-text':
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rich Text Content</label>
            <textarea
              value={block.props.content || ''}
              onChange={(e) => handleChange('content', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              rows={6}
              placeholder="<p>Enter your rich text content here</p>"
            />
          </div>
          {renderFontSettings()}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Line Height</label>
            <input
              type="text"
              value={block.props.lineHeight || '1.6'}
              onChange={(e) => handleChange('lineHeight', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="1.6"
            />
          </div>
        </div>
      );

    case 'button':
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Button Text</label>
            <input
              type="text"
              value={block.props.text || ''}
              onChange={(e) => handleChange('text', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Link Type</label>
            <select
              value={block.props.linkType || 'url'}
              onChange={(e) => handleChange('linkType', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="url">URL</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="anchor">Anchor Scroll</option>
              <option value="popup">Popup Trigger</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Link URL</label>
            <input
              type="text"
              value={block.props.linkUrl || ''}
              onChange={(e) => handleChange('linkUrl', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="#"
            />
          </div>
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={block.props.openInNewTab || false}
                onChange={(e) => handleChange('openInNewTab', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Open in New Tab</span>
            </label>
          </div>
          {renderFontSettings()}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
            <input
              type="color"
              value={block.props.backgroundColor || '#3B82F6'}
              onChange={(e) => handleChange('backgroundColor', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hover Background</label>
            <input
              type="color"
              value={block.props.hoverBackground || '#2563EB'}
              onChange={(e) => handleChange('hoverBackground', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Padding</label>
            <input
              type="text"
              value={block.props.padding || '12px 24px'}
              onChange={(e) => handleChange('padding', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="12px 24px"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Border Radius</label>
            <input
              type="text"
              value={block.props.borderRadius || '8px'}
              onChange={(e) => handleChange('borderRadius', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="8px"
            />
          </div>
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={block.props.shadow || false}
                onChange={(e) => handleChange('shadow', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Shadow</span>
            </label>
          </div>
        </div>
      );

    case 'link':
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Link Text</label>
            <input
              type="text"
              value={block.props.text || ''}
              onChange={(e) => handleChange('text', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">URL</label>
            <input
              type="text"
              value={block.props.url || ''}
              onChange={(e) => handleChange('url', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="#"
            />
          </div>
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={block.props.openInNewTab || false}
                onChange={(e) => handleChange('openInNewTab', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Open in New Tab</span>
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Style</label>
            <select
              value={block.props.style || 'text'}
              onChange={(e) => handleChange('style', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="text">Text</option>
              <option value="button">Button</option>
            </select>
          </div>
          {renderFontSettings()}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={block.props.underline || false}
                onChange={(e) => handleChange('underline', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Underline</span>
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hover Color</label>
            <input
              type="color"
              value={block.props.hoverColor || '#2563EB'}
              onChange={(e) => handleChange('hoverColor', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
      );

    case 'divider':
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              value={block.props.type || 'solid'}
              onChange={(e) => handleChange('type', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="solid">Solid</option>
              <option value="dotted">Dotted</option>
              <option value="dashed">Dashed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Thickness</label>
            <input
              type="text"
              value={block.props.thickness || '1px'}
              onChange={(e) => handleChange('thickness', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="1px"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
            <input
              type="color"
              value={block.props.color || '#E5E7EB'}
              onChange={(e) => handleChange('color', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Width</label>
            <input
              type="text"
              value={block.props.width || '100%'}
              onChange={(e) => handleChange('width', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="100%"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Margin Top</label>
            <input
              type="text"
              value={block.props.marginTop || '24px'}
              onChange={(e) => handleChange('marginTop', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="24px"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Margin Bottom</label>
            <input
              type="text"
              value={block.props.marginBottom || '24px'}
              onChange={(e) => handleChange('marginBottom', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="24px"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Alignment</label>
            <select
              value={block.props.alignment || 'center'}
              onChange={(e) => handleChange('alignment', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
        </div>
      );

    case 'spacer':
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Height</label>
            <input
              type="number"
              value={parseInt(block.props.height || '40')}
              onChange={(e) => handleChange('height', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
            <select
              value={block.props.unit || 'px'}
              onChange={(e) => handleChange('unit', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="px">Pixels</option>
              <option value="rem">Rem</option>
            </select>
          </div>
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={block.props.visibleOnMobile !== false}
                onChange={(e) => handleChange('visibleOnMobile', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Visible on Mobile</span>
            </label>
          </div>
        </div>
      );

    case 'bullet-list':
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Items</label>
            {block.props.items?.map((item: any, index: number) => (
              <div key={index} className="mb-2 p-2 border border-gray-200 rounded">
                <input
                  type="text"
                  value={item.text || ''}
                  onChange={(e) => {
                    const newItems = [...(block.props.items || [])];
                    newItems[index] = { ...newItems[index], text: e.target.value };
                    handleChange('items', newItems);
                  }}
                  className="w-full p-1 border border-gray-300 rounded text-sm"
                  placeholder={`Item ${index + 1}`}
                />
              </div>
            ))}
            <button
              onClick={() => {
                const newItems = [...(block.props.items || []), { text: '', icon: '•', color: '#6B7280' }];
                handleChange('items', newItems);
              }}
              className="w-full p-2 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 text-sm"
            >
              + Add Item
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Columns</label>
            <select
              value={block.props.columns || 1}
              onChange={(e) => handleChange('columns', parseInt(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value={1}>1 Column</option>
              <option value={2}>2 Columns</option>
              <option value={3}>3 Columns</option>
            </select>
          </div>
          {renderFontSettings()}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Spacing</label>
            <input
              type="text"
              value={block.props.spacing || '8px'}
              onChange={(e) => handleChange('spacing', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="8px"
            />
          </div>
        </div>
      );

    case 'numbered-list':
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Items</label>
            {block.props.items?.map((item: any, index: number) => (
              <div key={index} className="mb-2 p-2 border border-gray-200 rounded">
                <input
                  type="text"
                  value={item.text || ''}
                  onChange={(e) => {
                    const newItems = [...(block.props.items || [])];
                    newItems[index] = { ...newItems[index], text: e.target.value };
                    handleChange('items', newItems);
                  }}
                  className="w-full p-1 border border-gray-300 rounded text-sm"
                  placeholder={`Item ${index + 1}`}
                />
              </div>
            ))}
            <button
              onClick={() => {
                const newItems = [...(block.props.items || []), { text: '' }];
                handleChange('items', newItems);
              }}
              className="w-full p-2 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 text-sm"
            >
              + Add Item
            </button>
          </div>
          {renderFontSettings()}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Spacing</label>
            <input
              type="text"
              value={block.props.spacing || '8px'}
              onChange={(e) => handleChange('spacing', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="8px"
            />
          </div>
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={block.props.animation || false}
                onChange={(e) => handleChange('animation', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Animation</span>
            </label>
          </div>
        </div>
      );

    case 'quote':
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quote Text</label>
            <textarea
              value={block.props.text || ''}
              onChange={(e) => handleChange('text', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Author</label>
            <input
              type="text"
              value={block.props.author || ''}
              onChange={(e) => handleChange('author', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          {renderFontSettings()}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
            <input
              type="color"
              value={block.props.backgroundColor || '#F9FAFB'}
              onChange={(e) => handleChange('backgroundColor', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Padding</label>
            <input
              type="text"
              value={block.props.padding || '24px'}
              onChange={(e) => handleChange('padding', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="24px"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Border Radius</label>
            <input
              type="text"
              value={block.props.borderRadius || '8px'}
              onChange={(e) => handleChange('borderRadius', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="8px"
            />
          </div>
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={block.props.showQuotes !== false}
                onChange={(e) => handleChange('showQuotes', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Show Quote Marks</span>
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Alignment</label>
            <select
              value={block.props.alignment || 'left'}
              onChange={(e) => handleChange('alignment', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
        </div>
      );

    case 'badge':
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Badge Text</label>
            <input
              type="text"
              value={block.props.text || ''}
              onChange={(e) => handleChange('text', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          {renderFontSettings()}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
            <input
              type="color"
              value={block.props.backgroundColor || '#EF4444'}
              onChange={(e) => handleChange('backgroundColor', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Text Color</label>
            <input
              type="color"
              value={block.props.textColor || '#FFFFFF'}
              onChange={(e) => handleChange('textColor', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Padding</label>
            <input
              type="text"
              value={block.props.padding || '4px 8px'}
              onChange={(e) => handleChange('padding', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="4px 8px"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Border Radius</label>
            <input
              type="text"
              value={block.props.borderRadius || '12px'}
              onChange={(e) => handleChange('borderRadius', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="12px"
            />
          </div>
        </div>
      );

    case 'icon':
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
            <select
              value={block.props.icon || 'star'}
              onChange={(e) => handleChange('icon', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="star">⭐ Star</option>
              <option value="heart">❤️ Heart</option>
              <option value="check">✅ Check</option>
              <option value="arrow">→ Arrow</option>
              <option value="phone">📞 Phone</option>
              <option value="email">📧 Email</option>
              <option value="location">📍 Location</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
            <input
              type="text"
              value={block.props.size || '24px'}
              onChange={(e) => handleChange('size', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="24px"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
            <input
              type="color"
              value={block.props.color || '#6B7280'}
              onChange={(e) => handleChange('color', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Alignment</label>
            <select
              value={block.props.alignment || 'left'}
              onChange={(e) => handleChange('alignment', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Margin Top</label>
            <input
              type="text"
              value={block.props.marginTop || '0px'}
              onChange={(e) => handleChange('marginTop', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="0px"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Margin Bottom</label>
            <input
              type="text"
              value={block.props.marginBottom || '0px'}
              onChange={(e) => handleChange('marginBottom', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="0px"
            />
          </div>
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={block.props.animation || false}
                onChange={(e) => handleChange('animation', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Hover Animation</span>
            </label>
          </div>
        </div>
      );

    default:
      return (
        <div className="text-gray-500">
          No settings available for this block type.
        </div>
      );
  }
} 