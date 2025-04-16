
import { v4 as uuidv4 } from 'uuid';
import {
  Entity,
  Attribute,
  SystemType,
  EntityHierarchyJson
} from '@/types';

// Parse the uploaded JSON file containing entities with hierarchy
export const parseEntitiesWithHierarchyJSON = (file: File): Promise<{ entities: Entity[], attributes: Attribute[] }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        if (!event.target?.result) {
          throw new Error('Failed to read file');
        }
        
        const jsonString = event.target.result as string;
        const jsonData = JSON.parse(jsonString) as EntityHierarchyJson[];
        
        console.log('Loaded entity hierarchy JSON:', jsonData);
        
        if (!Array.isArray(jsonData)) {
          throw new Error('Invalid JSON format: Expected an array of entities');
        }
        
        const entities: Entity[] = [];
        const attributes: Attribute[] = [];
        
        // Process each entity from the JSON
        jsonData.forEach(entityJson => {
          const entityId = uuidv4(); // Generate a new internal ID for the entity
          
          // Determine system type from entity data
          const systemRaw = entityJson['Entity System'] || 'EAM';
          const systemType = validateSystemType(systemRaw);
          
          // Create entity object
          const entity: Entity = {
            id: entityId,
            name: entityJson['Entity Name'] || '',
            description: entityJson['Entity Description'] || '',
            parent: entityJson['parent_id'] || '', // Store parent ID for edge creation
            system: systemType,
            externalId: entityJson['Entity ID']?.toString() || '',
            level: entityJson['level'] || 0, // Store level for tree visualization
            isReferenceData: entityJson['Reference Data']?.toLowerCase() === 'yes',
            children: entityJson['children'] || []  // Store children IDs for edge creation
          };
          
          entities.push(entity);
          
          // Process attributes for this entity
          if (Array.isArray(entityJson.attributes)) {
            entityJson.attributes.forEach(attrJson => {
              const attribute: Attribute = {
                id: uuidv4(), // Generate a new internal ID for the attribute
                name: attrJson['Attribute Name'] || '',
                description: attrJson['Attribute Description'] || '',
                isPrimaryKey: attrJson['Primary Key']?.toLowerCase() === 'yes',
                entityId: entityId, // Link to the parent entity
                system: systemType,
                dataType: attrJson['Data Type'] || '',
                isNullable: attrJson['Is Nullable']?.toLowerCase() === 'yes',
                externalId: attrJson['Attribute ID']?.toString() || ''
              };
              
              attributes.push(attribute);
            });
          }
        });
        
        console.log('Processed entities:', entities);
        console.log('Processed attributes:', attributes);
        
        resolve({ entities, attributes });
      } catch (error) {
        console.error('Error parsing JSON:', error);
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read the file'));
    };
    
    reader.readAsText(file);
  });
};

// Helper function to validate system type (reused from csv-parser.ts)
const validateSystemType = (system: string): SystemType => {
  const normalizedSystem = system.trim().toLowerCase();
  
  if (normalizedSystem === 'eam') return 'EAM';
  if (normalizedSystem === 'ipen') return 'iPen';
  if (normalizedSystem === 'both') return 'Both';
  
  // Default to EAM if invalid value
  console.warn(`Invalid system type: "${system}", defaulting to "EAM"`);
  return 'EAM';
};

// Export to JSON format
export const entitiesToJSON = (entities: Entity[], attributes: Attribute[]): string => {
  // Group attributes by entity ID
  const attributesByEntityId = attributes.reduce((acc, attr) => {
    if (!acc[attr.entityId]) {
      acc[attr.entityId] = [];
    }
    acc[attr.entityId].push({
      'Attribute ID': attr.externalId,
      'Attribute Name': attr.name,
      'Attribute Description': attr.description,
      'Primary Key': attr.isPrimaryKey ? 'Yes' : 'No',
      'Data Type': attr.dataType || '',
      'Is Nullable': attr.isNullable ? 'Yes' : 'No',
      'Container Entity ID': attr.entityId
    });
    return acc;
  }, {} as Record<string, any[]>);
  
  // Create entity hierarchy with attributes
  const entitiesWithHierarchy = entities.map(entity => {
    // Find children entities
    const children = entities
      .filter(e => e.parent === entity.externalId)
      .map(e => e.externalId);
    
    return {
      'Entity ID': entity.externalId,
      'Entity Name': entity.name,
      'Entity Description': entity.description,
      'Entity System': entity.system,
      'Reference Data': entity.isReferenceData ? 'Yes' : 'No',
      'attributes': attributesByEntityId[entity.id] || [],
      'parent_id': entity.parent || null,
      'children': children,
      'level': entity.level || 0
    };
  });
  
  return JSON.stringify(entitiesWithHierarchy, null, 2);
};
