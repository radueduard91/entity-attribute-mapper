
import Papa from 'papaparse';
import { v4 as uuidv4 } from 'uuid';
import { 
  Entity, 
  Attribute, 
  SystemType 
} from '@/types';

export const parseEntitiesCSV = (file: File): Promise<Entity[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const data = results.data as Record<string, string>[];
          console.log('Raw entity data from CSV:', data);
          
          // Map the specific template column names to our internal format
          const entities: Entity[] = data.map(row => {
            const name = row['Entity Name'] || row['name'] || '';
            const description = row['Entity Description'] || row['description'] || '';
            const externalId = row['Entity ID'] || row['id'] || '';
            
            // For parent, first check for parent ID, then for parent name
            const parentId = row['Entity parent ID'] || row['parent_id'] || '';
            const parent = row['Entity parent'] || row['parent'] || parentId;
            
            const systemRaw = row['Entity System'] || row['system'] || '';
            
            if (!name) {
              console.warn('Entity missing name:', row);
            }
            
            return {
              id: uuidv4(),
              name: name.trim(),
              description,
              parent,
              system: validateSystemType(systemRaw),
              externalId
            };
          });
          
          console.log('Processed entities:', entities);
          resolve(entities);
        } catch (error) {
          console.error('Error parsing entity CSV:', error);
          reject(error);
        }
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

export const parseAttributesCSV = (file: File, entities: Entity[]): Promise<Attribute[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const data = results.data as Record<string, string>[];
          console.log('Raw attribute data from CSV:', data);
          console.log('Available entities for matching:', entities.map(e => ({ name: e.name, externalId: e.externalId })));
          
          // Map the specific template column names to our internal format
          const attributes: Attribute[] = [];
          
          for (const row of data) {
            const name = row['Attribute Name'] || row['name'] || '';
            const description = row['Attribute Description'] || row['description'] || '';
            const isPrimaryKeyRaw = row['Primary Key'] || row['primary_key'] || '';
            
            // First try to match by Container Entity ID
            const containerEntityId = (row['Container Entity ID'] || row['entity_id'] || '').toString().trim();
            
            // Also check for entity name for backward compatibility
            const entityName = (row['Part Of Entity Name'] || row['entity'] || '').trim();
            
            const systemRaw = row['Attribute System'] || row['system'] || '';
            
            // Find the entity ID that matches the container entity ID in the CSV
            let entity = entities.find(e => e.externalId === containerEntityId);
            
            // If no match by ID, try by name (backwards compatibility)
            if (!entity && entityName) {
              // Try exact match
              entity = entities.find(e => e.name === entityName);
              
              // If still no match, try case-insensitive matching
              if (!entity) {
                entity = entities.find(e => e.name.toLowerCase() === entityName.toLowerCase());
              }
            }
            
            const entityId = entity?.id;
            
            if (!entityId) {
              console.warn(`Entity with ID "${containerEntityId}" or name "${entityName}" not found for attribute "${name}"`);
              continue; // Skip this attribute but keep processing others
            }
            
            const isPrimaryKey = isPrimaryKeyRaw.toLowerCase() === 'yes' || 
                              isPrimaryKeyRaw === '1' || 
                              isPrimaryKeyRaw.toLowerCase() === 'true';
            
            attributes.push({
              id: uuidv4(),
              name,
              description,
              isPrimaryKey,
              entityId,
              system: validateSystemType(systemRaw)
            });
          }
          
          console.log('Processed attributes:', attributes);
          
          if (attributes.length === 0) {
            console.warn('No valid attributes found after matching with entities');
          }
          
          resolve(attributes);
        } catch (error) {
          console.error('Error parsing attribute CSV:', error);
          reject(error);
        }
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

export const entitiesToCSV = (entities: Entity[]): string => {
  const data = entities.map(entity => ({
    'Entity ID': entity.externalId || '',
    'Entity Name': entity.name,
    'Entity Description': entity.description,
    'Entity parent ID': entity.parent,
    'Entity System': entity.system
  }));
  
  return Papa.unparse(data);
};

export const attributesToCSV = (attributes: Attribute[], entities: Entity[]): string => {
  const data = attributes.map(attr => {
    const entity = entities.find(e => e.id === attr.entityId);
    const entityExternalId = entity?.externalId || '';
    
    return {
      'Attribute Name': attr.name,
      'Attribute Description': attr.description,
      'Primary Key': attr.isPrimaryKey ? 'Yes' : 'No',
      'Container Entity ID': entityExternalId,
      'Attribute System': attr.system
    };
  });
  
  return Papa.unparse(data);
};

// Helper function to validate system type
const validateSystemType = (system: string): SystemType => {
  const normalizedSystem = system.trim().toLowerCase();
  
  if (normalizedSystem === 'eam') return 'EAM';
  if (normalizedSystem === 'ipen') return 'iPen';
  if (normalizedSystem === 'both') return 'Both';
  
  // Default to EAM if invalid value
  console.warn(`Invalid system type: "${system}", defaulting to "EAM"`);
  return 'EAM';
};
