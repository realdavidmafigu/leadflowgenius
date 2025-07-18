import React from 'react';

interface ElementsPanelProps {
  onAddSection: (type: 'default' | 'hero' | 'features' | 'testimonials' | 'contact') => void;
  onAddRow: (sectionId: string, columnCount: number) => void;
  onAddColumn: (sectionId: string, rowId: string, width: 'full' | 'half' | 'third' | 'quarter') => void;
  onAddBlock: (sectionId: string, rowId: string, columnId: string, type: any) => void;
  selectedElement: any;
  sections: any[];
}

// You can copy the content of ComponentSidebar here, or import and re-export it if it's already modular.
import ComponentSidebar from './ComponentSidebar';

const ElementsPanel: React.FC<ElementsPanelProps> = (props) => {
  return <ComponentSidebar {...props} />;
};

export default ElementsPanel; 