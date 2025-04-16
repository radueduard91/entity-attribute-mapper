import { Edge, Node, MarkerType, Position } from '@xyflow/react';
import { 
  Entity, 
  Attribute, 
  EntityNode, 
  EntityRelationEdge 
} from '@/types';

// Generate nodes from entities and attributes with hierarchy positioning
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
  
  // Organize entities by level for better layout
  const entitiesByLevel: Record<number, Entity[]> = {};
  entities.forEach(entity => {
    const level = entity.level || 0;
    if (!entitiesByLevel[level]) {
      entitiesByLevel[level] = [];
    }
    entitiesByLevel[level].push(entity);
  });
  
  const nodes: EntityNode[] = [];
  
  // Position constants
  const LEVEL_VERTICAL_SPACING = 250;
  const HORIZONTAL_SPACING = 350;
  const STARTING_Y = 50;
  
  // Generate nodes level by level
  Object.keys(entitiesByLevel)
    .map(Number)
    .sort((a, b) => a - b) // Sort levels in ascending order
    .forEach(level => {
      const levelEntities = entitiesByLevel[level];
      const levelY = STARTING_Y + level * LEVEL_VERTICAL_SPACING;
      
      // Position entities within level
      levelEntities.forEach((entity, index) => {
        // Find all attributes for this entity
        const entityAttributes = attributes.filter(attr => attr.entityId === entity.id);
        console.log(`Entity ${entity.name} (${entity.id}) has ${entityAttributes.length} attributes`);
        
        const entitiesCount = levelEntities.length;
        const xPosition = 100 + (index * HORIZONTAL_SPACING);
        
        nodes.push({
          id: entity.id,
          type: 'entity',
          position: { x: xPosition, y: levelY },
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
        } as EntityNode);
      });
    });
  
  return nodes;
};

// Generate edges from entity parent-child relationships
export const generateEdges = (entities: Entity[]): EntityRelationEdge[] => {
  const edges: EntityRelationEdge[] = [];
  
  // Build a map of externalId to entity id for quick lookups
  const externalIdToEntityId = entities.reduce((map, entity) => {
    if (entity.externalId) {
      map[entity.externalId] = entity.id;
    }
    return map;
  }, {} as Record<string, string>);
  
  entities.forEach(entity => {
    // Check both the parent field and the children array
    if (entity.parent && entity.parent !== '') {
      const parentId = externalIdToEntityId[entity.parent];
      
      if (parentId) {
        edges.push({
          id: `e-${parentId}-${entity.id}`,
          source: parentId,
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
        console.warn(`Could not find parent entity with ID "${entity.parent}" for entity "${entity.name}"`);
      }
    }
    
    // Add edges based on children array if present
    if (entity.children && entity.children.length > 0) {
      entity.children.forEach(childId => {
        // Find the internal ID for this child's external ID
        const childEntityId = externalIdToEntityId[childId];
        
        if (childEntityId) {
          // Check if this edge already exists (avoid duplicates)
          const edgeExists = edges.some(edge => 
            edge.source === entity.id && edge.target === childEntityId
          );
          
          if (!edgeExists) {
            // Find the child entity to get its system for styling
            const childEntity = entities.find(e => e.id === childEntityId);
            
            edges.push({
              id: `e-${entity.id}-${childEntityId}`,
              source: entity.id,
              target: childEntityId,
              type: 'smoothstep',
              markerEnd: {
                type: MarkerType.ArrowClosed,
                width: 15,
                height: 15,
              },
              style: { stroke: getSystemColor(childEntity?.system || 'EAM') },
              data: {
                relationshipType: 'parent-child'
              }
            } as EntityRelationEdge);
          }
        } else {
          console.warn(`Could not find child entity with external ID "${childId}" for entity "${entity.name}"`);
        }
      });
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

// New helper function to download JSON data
export const downloadJSON = (data: any, fileName: string): void => {
  const jsonString = JSON.stringify(data, null, 2);
  downloadFile(jsonString, fileName, 'application/json');
};
