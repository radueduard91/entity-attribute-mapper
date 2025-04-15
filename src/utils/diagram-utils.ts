import { Edge, Node, MarkerType, Position } from '@xyflow/react';
import { 
  Entity, 
  Attribute, 
  EntityNode, 
  EntityRelationEdge 
} from '@/types';

// Generate nodes from entities and attributes
export const generateNodes = (
  entities: Entity[], 
  attributes: Attribute[],
  onEditEntity: (entityId: string) => void,
  onDeleteEntity: (entityId: string) => void,
  onEditAttribute: (attributeId: string) => void,
  onDeleteAttribute: (attributeId: string) => void,
  onAddAttribute: (entityId: string) => void
): EntityNode[] => {
  console.log('Generating nodes from entities:', entities);
  console.log('Available attributes:', attributes);
  
  return entities.map((entity, index) => {
    // Find all attributes for this entity
    const entityAttributes = attributes.filter(attr => attr.entityId === entity.id);
    console.log(`Entity ${entity.name} (${entity.id}) has ${entityAttributes.length} attributes`);
    
    return {
      id: entity.id,
      type: 'entity',
      position: { x: 100 + (index % 3) * 300, y: 100 + Math.floor(index / 3) * 200 },
      data: {
        entity,
        attributes: entityAttributes,
        onEditEntity,
        onDeleteEntity,
        onEditAttribute,
        onDeleteAttribute,
        onAddAttribute
      },
      className: `entity-node ${getSystemClass(entity.system)}`,
    } as EntityNode;
  });
};

// Generate edges from entity parent relationships
export const generateEdges = (entities: Entity[]): EntityRelationEdge[] => {
  const edges: EntityRelationEdge[] = [];
  
  entities.forEach(entity => {
    if (entity.parent) {
      // Try to find parent entity by externalId first
      let parentEntity = entities.find(e => 
        e.externalId.toString().trim().toLowerCase() === entity.parent.toString().trim().toLowerCase()
      );
      
      // If not found by externalId, try by name (for backward compatibility)
      if (!parentEntity) {
        // Try exact match
        parentEntity = entities.find(e => e.name === entity.parent);
        
        // If still no match, try case-insensitive match
        if (!parentEntity) {
          parentEntity = entities.find(e => 
            e.name.toLowerCase() === entity.parent.toLowerCase()
          );
        }
      }
      
      if (parentEntity) {
        edges.push({
          id: `e-${parentEntity.id}-${entity.id}`,
          source: parentEntity.id,
          target: entity.id,
          type: 'smoothstep',
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 15,
            height: 15,
          },
          style: { stroke: getSystemColor(entity.system) },
          data: {
            relationshipType: 'parent-child'
          }
        } as EntityRelationEdge);
      } else {
        console.warn(`Could not find parent entity "${entity.parent}" for entity "${entity.name}"`);
      }
    }
  });
  
  return edges;
};

export const getSystemClass = (system: string): string => {
  const normalizedSystem = system.toLowerCase();
  
  if (normalizedSystem === 'eam') return 'eam-system';
  if (normalizedSystem === 'ipen') return 'ipen-system';
  if (normalizedSystem === 'both') return 'both-system';
  
  return 'eam-system'; // Default
};

export const getSystemColor = (system: string): string => {
  const normalizedSystem = system.toLowerCase();
  
  if (normalizedSystem === 'eam') return '#4CAF50';
  if (normalizedSystem === 'ipen') return '#1EAEDB';
  if (normalizedSystem === 'both') return '#F97316';
  
  return '#4CAF50'; // Default
};

// Download a string as a file
export const downloadFile = (content: string, fileName: string, contentType: string): void => {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  
  URL.revokeObjectURL(url);
};
