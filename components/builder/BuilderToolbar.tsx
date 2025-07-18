import React from 'react';

interface BuilderToolbarProps {
  onSave: () => void;
  onPreview: () => void;
  onPublish: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  isSaving: boolean;
  isPublished: boolean;
}

export default function BuilderToolbar({
  onSave,
  onPreview,
  onPublish,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  isSaving,
  isPublished
}: BuilderToolbarProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold text-gray-800">Funnel Builder</h1>
        
        {/* Undo/Redo */}
        <div className="flex items-center gap-2">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Undo"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Redo"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Save Status */}
        <div className="text-sm text-gray-500">
          {isSaving ? 'Saving...' : 'All changes saved'}
        </div>

        {/* Action Buttons */}
        <button
          onClick={onPreview}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Preview
        </button>
        
        <button
          onClick={onSave}
          disabled={isSaving}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>
        
        <button
          onClick={onPublish}
          disabled={isPublished}
          className={`px-4 py-2 rounded-lg transition-colors ${
            isPublished
              ? 'bg-green-600 text-white cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          {isPublished ? 'Published' : 'Publish'}
        </button>
      </div>
    </div>
  );
} 