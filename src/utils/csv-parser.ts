
import Papa from 'papaparse';
import { v4 as uuidv4 } from 'uuid';
import { 
  Entity, 
  Attribute, 
  EntityCSVRow, 
  AttributeCSVRow, 
  SystemType 
} from '@/types';

export const parseEntitiesCSV = (file: File): Promise<Entity[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const data = results.data as EntityCSVRow[];
          
          // Validate CSV structure (4 columns for entities)
          const requiredColumns = ['name', 'description', 'parent', 'system'];
          const hasRequiredColumns = requiredColumns.every(col => 
            Object.keys(data[0] || {}).map(key => key.toLowerCase()).includes(col.toLowerCase())
          );
          
          if (!hasRequiredColumns) {
            reject(new Error('Entity CSV must have name, description, parent, and system columns'));
            return;
          }
          
          const entities: Entity[] = data.map(row => ({
            id: uuidv4(),
            name: row.name,
            description: row.description,
            parent: row.parent,
            system: validateSystemType(row.system)
          }));
          
          resolve(entities);
        } catch (error) {
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
          const data = results.data as AttributeCSVRow[];
          
          // Validate CSV structure (5 columns for attributes)
          const requiredColumns = ['name', 'description', 'primary_key', 'entity', 'system'];
          const hasRequiredColumns = requiredColumns.every(col => 
            Object.keys(data[0] || {}).map(key => key.toLowerCase()).includes(col.toLowerCase().replace('_', ''))
          );
          
          if (!hasRequiredColumns) {
            reject(new Error('Attribute CSV must have name, description, primary_key, entity, and system columns'));
            return;
          }
          
          const attributes: Attribute[] = data.map(row => {
            // Find the entity ID that matches the entity name in the CSV
            const entityId = entities.find(e => e.name === row.entity)?.id;
            
            if (!entityId) {
              console.warn(`Entity "${row.entity}" not found for attribute "${row.name}"`);
            }
            
            return {
              id: uuidv4(),
              name: row.name,
              description: row.description,
              isPrimaryKey: row.primary_key.toLowerCase() === 'yes' || row.primary_key === '1' || row.primary_key.toLowerCase() === 'true',
              entityId: entityId || '',
              system: validateSystemType(row.system)
            };
          });
          
          resolve(attributes);
        } catch (error) {
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
    name: entity.name,
    description: entity.description,
    parent: entity.parent,
    system: entity.system
  }));
  
  return Papa.unparse(data);
};

export const attributesToCSV = (attributes: Attribute[], entities: Entity[]): string => {
  const data = attributes.map(attr => {
    const entityName = entities.find(e => e.id === attr.entityId)?.name || '';
    
    return {
      name: attr.name,
      description: attr.description,
      primary_key: attr.isPrimaryKey ? 'Yes' : 'No',
      entity: entityName,
      system: attr.system
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
