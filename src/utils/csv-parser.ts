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
            
            // Ensure externalId is stored as a string to prevent type mismatches
            return {
              id: uuidv4(),
              name: name.trim(),
              description,
              parent,
              system: validateSystemType(systemRaw),
              externalId: externalId.toString().trim()
            };
          });
          
          console.log('Processed entities with externalIds:', entities.map(e => ({
            name: e.name,
            externalId: e.externalId,
            type: typeof e.externalId
          })));
          
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
          console.log('Entities available for matching:', entities.map(e => ({
            id: e.id,
            externalId: e.externalId,
            name: e.name,
            type: typeof e.externalId
          })));
          
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
            
            console.log(`Looking for entity match for attribute "${name}" with Container Entity ID="${containerEntityId}" or name="${entityName}"`);
            
            // Find the entity ID that matches the container entity ID in the CSV
            // Use string comparison to avoid type mismatches
            let entity = entities.find(e => 
              e.externalId.toString().trim() === containerEntityId.toString().trim()
            );
            
            if (entity) {
              console.log(`Found entity match by externalId: ${entity.name} (${entity.externalId})`);
            }
            
            // If no match by ID, try by name (backwards compatibility)
            if (!entity && entityName) {
              // Try exact match
              entity = entities.find(e => e.name === entityName);
              
              if (entity) {
                console.log(`Found entity match by exact name: ${entity.name}`);
              }
              
              // If still no match, try case-insensitive matching
              if (!entity) {
                entity = entities.find(e => e.name.toLowerCase() === entityName.toLowerCase());
                
                if (entity) {
                  console.log(`Found entity match by case-insensitive name: ${entity.name}`);
                }
              }
            }
            
            const entityId = entity?.id;
            
            if (!entityId) {
              console.warn(`Entity with ID "${containerEntityId}" or name "${entityName}" not found for attribute "${name}"`);
              console.warn(`Available entity externalIds:`, entities.map(e => e.externalId));
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
            console.warn('No valid attributes found after matching with entities. Checking all attribute-entity pairs:');
            
            for (const row of data) {
              const containerEntityId = (row['Container Entity ID'] || row['entity_id'] || '').toString().trim();
              const attributeName = row['Attribute Name'] || row['name'] || '';
              
              console.log(`Attribute "${attributeName}" is looking for entity with ID "${containerEntityId}"`);
              console.log(`Available entity externalIds:`, entities.map(e => e.externalId));
              
              // DEBUG: Show exact comparison values for each entity
              entities.forEach(e => {
                console.log(`Comparing "${e.externalId}" (${typeof e.externalId}) with "${containerEntityId}" (${typeof containerEntityId}): ${e.externalId === containerEntityId}`);
                console.log(`Comparing as strings: "${String(e.externalId)}" with "${String(containerEntityId)}": ${String(e.externalId) === String(containerEntityId)}`);
                console.log(`Comparing trimmed strings: "${String(e.externalId).trim()}" with "${String(containerEntityId).trim()}": ${String(e.externalId).trim() === String(containerEntityId).trim()}`);
              });
            }
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
