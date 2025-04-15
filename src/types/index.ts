
import { Node, Edge } from '@xyflow/react';

export interface Entity {
  id: string;
  name: string;
  description: string;
  parent: string;
  system: SystemType;
}

export interface Attribute {
  id: string;
  name: string;
  description: string;
  isPrimaryKey: boolean;
  entityId: string;
  system: SystemType;
}

export type SystemType = 'EAM' | 'iPen' | 'Both';

export interface EntityNode extends Node {
  data: {
    entity: Entity;
    attributes: Attribute[];
  };
  type: 'entity';
}

export interface EntityCSVRow {
  name: string;
  description: string;
  parent: string;
  system: string;
}

export interface AttributeCSVRow {
  name: string;
  description: string;
  primary_key: string;
  entity: string;
  system: string;
}

export interface EntityRelationEdge extends Edge {
  data: {
    relationshipType: 'parent-child';
  };
}

export interface AppState {
  entities: Entity[];
  attributes: Attribute[];
  nodes: EntityNode[];
  edges: EntityRelationEdge[];
  isEntitiesFileUploaded: boolean;
  isAttributesFileUploaded: boolean;
  searchTerm: string;
  systemFilter: SystemType | 'All';
}

export interface DiagramSidebarProps {
  entities: Entity[];
  attributes: Attribute[];
  onAddEntity: () => void;
  onAddAttribute: () => void;
  onExportCSV: () => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  systemFilter: SystemType | 'All';
  onSystemFilterChange: (value: SystemType | 'All') => void;
}

export interface FileUploadProps {
  onEntityFileUpload: (entities: Entity[]) => void;
  onAttributeFileUpload: (attributes: Attribute[]) => void;
  isEntitiesFileUploaded: boolean;
  isAttributesFileUploaded: boolean;
}

export interface EntityFormValues {
  name: string;
  description: string;
  parent: string;
  system: SystemType;
}

export interface AttributeFormValues {
  name: string;
  description: string;
  isPrimaryKey: boolean;
  entityId: string;
  system: SystemType;
}

export interface EntityFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: EntityFormValues) => void;
  initialValues?: EntityFormValues;
  entities: Entity[];
}

export interface AttributeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: AttributeFormValues) => void;
  initialValues?: AttributeFormValues;
  entities: Entity[];
}

export interface EntityNodeProps {
  data: {
    entity: Entity;
    attributes: Attribute[];
    onEditEntity: (entityId: string) => void;
    onDeleteEntity: (entityId: string) => void;
    onEditAttribute: (attributeId: string) => void;
    onDeleteAttribute: (attributeId: string) => void;
    onAddAttribute: (entityId: string) => void;
  };
  isConnectable: boolean;
}
