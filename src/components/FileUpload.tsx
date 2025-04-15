import { useCallback, useState } from 'react';
import { useDropzone, FileRejection, DropEvent } from 'react-dropzone';
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
  // Store entities from the entity dropzone to use in the attribute dropzone
  const [uploadedEntities, setUploadedEntities] = useState<Entity[]>([]);
  
  // Entities dropzone
  const onEntityDrop = useCallback(async (
    acceptedFiles: File[], 
    fileRejections: FileRejection[], 
    event: DropEvent
  ) => {
    if (acceptedFiles.length === 0) return;
    
    try {
      const file = acceptedFiles[0];
      const entities = await parseEntitiesCSV(file);
      
      // Log entity external IDs for debugging
      console.log('Loaded entities with externalIds:', entities.map(e => ({
        name: e.name, 
        externalId: e.externalId,
        type: typeof e.externalId
      })));
      
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
      } else {
        toast({
          title: "Empty file",
          description: "No entities found in the uploaded file.",
          variant: "destructive"
        });
        return;
      }
      
      // Store entities for attribute upload
      setUploadedEntities(entities);
      onEntityFileUpload(entities);
      
      toast({
        title: "Entities uploaded",
        description: `Successfully loaded ${entities.length} entities.`,
      });
    } catch (error) {
      console.error('Error parsing entity CSV:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to parse entity file. Please ensure the CSV has Entity ID, Entity Name, Entity Description, Entity System, and Entity parent ID columns.",
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
  
  // Attributes dropzone
  const onAttributeDrop = useCallback(async (
    acceptedFiles: File[], 
    fileRejections: FileRejection[], 
    event: DropEvent
  ) => {
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
      console.log('Current entities for attribute mapping:', uploadedEntities);
      console.log('Number of entities available for matching:', uploadedEntities.length);
      console.log('Entity IDs available:', uploadedEntities.map(e => e.externalId));
      
      // Read first few lines of CSV for debugging
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        if (text) {
          console.log('CSV first 500 chars:', text.substring(0, 500));
        }
      };
      reader.readAsText(file);
      
      // Pass the current entities to the parseAttributesCSV function
      const attributes = await parseAttributesCSV(file, uploadedEntities);
      
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
        description: error instanceof Error ? error.message : "Failed to parse attribute file. Please check CSV format and entity references.",
        variant: "destructive"
      });
    }
  }, [isEntitiesFileUploaded, onAttributeFileUpload, toast, uploadedEntities]);
  
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
          className={`dropzone ${isEntityDragActive ? 'dropzone-active' : ''} ${isEntitiesFileUploaded ? 'border-green-500 bg-green-50' : ''} border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center hover:border-gray-400 transition-colors`}
        >
          <input {...getEntityInputProps()} />
          <UploadCloud className="w-12 h-12 text-gray-400 mb-4" />
          <p className="text-sm text-center text-gray-600">
            {isEntitiesFileUploaded 
              ? "Entities uploaded! Drop new file to replace." 
              : "Drag & drop entity.csv file, or click to select"}
          </p>
          <p className="text-xs text-center text-gray-500 mt-2">
            CSV must contain: Entity ID, Entity Name, Entity Description, Entity System, Entity parent ID
          </p>
        </div>
      </div>
      
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold">2. Upload Attributes</h3>
        <div 
          {...getAttributeRootProps()} 
          className={`dropzone ${isAttributeDragActive ? 'dropzone-active' : ''} ${!isEntitiesFileUploaded ? 'opacity-50 cursor-not-allowed' : ''} ${isAttributesFileUploaded ? 'border-green-500 bg-green-50' : ''} border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center hover:border-gray-400 transition-colors`}
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
            CSV must contain: Attribute Name, Attribute Description, Primary Key, Container Entity ID (or Part Of Entity Name), Attribute System
          </p>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
