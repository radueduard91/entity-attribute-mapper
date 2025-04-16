import { Node, Edge } from '@xyflow/react';

export interface Entity {
  id: string;
  name: string;
  description: string;
  parent: string;
  system: SystemType;
  externalId?: string;
  level?: number;
  isReferenceData?: boolean;
  children?: string[];
}

export interface Attribute {
  id: string;
  name: string;
  description: string;
  isPrimaryKey: boolean;
  entityId: string;
  system: SystemType;
  dataType?: string;
  isNullable?: boolean;
  externalId?: string;
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
  externalId?: string;
}

export interface AttributeCSVRow {
  name: string;
  description: string;
  primary_key: string;
  entity: string;
  entity_id?: string;
  system: string;
}

export interface EntityRelationEdge extends Edge {
  data: {
    relationshipType: 'parent-child';
  };
}

export interface EntityHierarchyJson {
  'Entity ID': string | number;
  'Entity Name': string;
  'Entity Description': string;
  'Entity System'?: string;
  'Reference Data'?: string;
  attributes?: AttributeJson[];
  parent_id?: string | null;
  children?: string[];
  level?: number;
}

export interface AttributeJson {
  'Attribute ID': string | number;
  'Attribute Name': string;
  'Attribute Description'?: string;
  'Primary Key'?: string;
  'Data Type'?: string;
  'Is Nullable'?: string;
  'Container Entity ID'?: string | number;
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
  initialValues?: Partial<EntityFormValues>;
  entities: Entity[];
}

export interface AttributeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: AttributeFormValues) => void;
  initialValues?: Partial<AttributeFormValues>;
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
