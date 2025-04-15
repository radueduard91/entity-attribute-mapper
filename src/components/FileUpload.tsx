
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  FileUploadProps, 
  Entity, 
  Attribute 
} from '@/types';
import { parseEntitiesCSV, parseAttributesCSV } from '@/utils/csv-parser';
import { Button } from '@/components/ui/button';
import { UploadCloud } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const FileUpload = ({ 
  onEntityFileUpload, 
  onAttributeFileUpload,
  isEntitiesFileUploaded,
  isAttributesFileUploaded
}: FileUploadProps) => {
  const { toast } = useToast();
  
  // Entities dropzone
  const onEntityDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    try {
      const file = acceptedFiles[0];
      const entities = await parseEntitiesCSV(file);
      
      // Validate CSV structure
      if (entities.length > 0) {
        // Check for missing required fields
        const missingFields = entities.some(entity => !entity.name);
        
        if (missingFields) {
          toast({
            title: "Invalid CSV format",
            description: "Some entities are missing required fields. Please check your CSV format.",
            variant: "destructive"
          });
          return;
        }
      }
      
      onEntityFileUpload(entities);
      
      toast({
        title: "Entities uploaded",
        description: `Successfully loaded ${entities.length} entities.`,
      });
    } catch (error) {
      console.error('Error parsing entity CSV:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to parse entity file. Please ensure the CSV has Entity Name, Entity Description, Entity System, and Entity parent columns.",
        variant: "destructive"
      });
    }
  }, [onEntityFileUpload, toast]);
  
  const { 
    getRootProps: getEntityRootProps, 
    getInputProps: getEntityInputProps,
    isDragActive: isEntityDragActive
  } = useDropzone({ 
    onDrop: onEntityDrop,
    accept: {
      'text/csv': ['.csv']
    },
    maxFiles: 1
  });
  
  // Attributes dropzone - this function needs to get the current entities
  const onAttributeDrop = useCallback(async (acceptedFiles: File[], entities: Entity[]) => {
    if (acceptedFiles.length === 0) return;
    
    if (!isEntitiesFileUploaded) {
      toast({
        title: "Error",
        description: "Please upload entities file first",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const file = acceptedFiles[0];
      console.log('Current entities for attribute mapping:', entities);
      
      // Pass the current entities to the parseAttributesCSV function
      const attributes = await parseAttributesCSV(file, entities);
      
      if (attributes.length === 0) {
        toast({
          title: "Warning",
          description: "No valid attributes found. Make sure the 'Part Of Entity Name' in your CSV matches existing entity names.",
          variant: "destructive"
        });
        return;
      }
      
      // Validate CSV structure
      const missingFields = attributes.some(attr => !attr.name);
      
      if (missingFields) {
        toast({
          title: "Invalid CSV format",
          description: "Some attributes are missing required fields. Please check your CSV format.",
          variant: "destructive"
        });
        return;
      }
      
      onAttributeFileUpload(attributes);
      
      toast({
        title: "Attributes uploaded",
        description: `Successfully loaded ${attributes.length} attributes.`,
      });
    } catch (error) {
      console.error('Error parsing attribute CSV:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to parse attribute file. Please ensure the CSV has Attribute Name, Attribute Description, Primary Key, Part Of Entity Name, and Attribute System columns.",
        variant: "destructive"
      });
    }
  }, [isEntitiesFileUploaded, onAttributeFileUpload, toast]);
  
  const { 
    getRootProps: getAttributeRootProps, 
    getInputProps: getAttributeInputProps,
    isDragActive: isAttributeDragActive
  } = useDropzone({ 
    onDrop: onAttributeDrop,
    accept: {
      'text/csv': ['.csv']
    },
    maxFiles: 1
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold">1. Upload Entities</h3>
        <div 
          {...getEntityRootProps()} 
          className={`dropzone ${isEntityDragActive ? 'dropzone-active' : ''} ${isEntitiesFileUploaded ? 'border-green-500 bg-green-50' : ''}`}
        >
          <input {...getEntityInputProps()} />
          <UploadCloud className="w-12 h-12 text-gray-400 mb-4" />
          <p className="text-sm text-center text-gray-600">
            {isEntitiesFileUploaded 
              ? "Entities uploaded! Drop new file to replace." 
              : "Drag & drop entity.csv file, or click to select"}
          </p>
          <p className="text-xs text-center text-gray-500 mt-2">
            CSV must contain: Entity Name, Entity Description, Entity System, Entity parent
          </p>
        </div>
      </div>
      
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold">2. Upload Attributes</h3>
        <div 
          {...getAttributeRootProps({
            // Use a custom version of onDrop that receives the current entities
            onDrop: (acceptedFiles) => onAttributeDrop(acceptedFiles, []), // We'll have to fix this in the Index.tsx component
          })} 
          className={`dropzone ${isAttributeDragActive ? 'dropzone-active' : ''} ${!isEntitiesFileUploaded ? 'opacity-50 cursor-not-allowed' : ''} ${isAttributesFileUploaded ? 'border-green-500 bg-green-50' : ''}`}
        >
          <input {...getAttributeInputProps()} disabled={!isEntitiesFileUploaded} />
          <UploadCloud className="w-12 h-12 text-gray-400 mb-4" />
          <p className="text-sm text-center text-gray-600">
            {!isEntitiesFileUploaded 
              ? "Please upload entities first" 
              : isAttributesFileUploaded 
                ? "Attributes uploaded! Drop new file to replace." 
                : "Drag & drop attribute.csv file, or click to select"}
          </p>
          <p className="text-xs text-center text-gray-500 mt-2">
            CSV must contain: Attribute Name, Attribute Description, Primary Key, Part Of Entity Name, Attribute System
          </p>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
