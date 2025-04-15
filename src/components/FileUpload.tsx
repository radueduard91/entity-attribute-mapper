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
      onEntityFileUpload(entities);
      
      toast({
        title: "Entities uploaded",
        description: `Successfully loaded ${entities.length} entities.`,
      });
    } catch (error) {
      console.error('Error parsing entity CSV:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to parse entity file",
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
  const onAttributeDrop = useCallback(async (acceptedFiles: File[]) => {
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
      const attributes = await parseAttributesCSV(file, [] as Entity[]);
      onAttributeFileUpload(attributes);
      
      toast({
        title: "Attributes uploaded",
        description: `Successfully loaded ${attributes.length} attributes.`,
      });
    } catch (error) {
      console.error('Error parsing attribute CSV:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to parse attribute file",
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
            CSV must contain: name, description, parent, system
          </p>
        </div>
      </div>
      
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold">2. Upload Attributes</h3>
        <div 
          {...getAttributeRootProps()} 
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
            CSV must contain: name, description, primary_key, entity, system
          </p>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
