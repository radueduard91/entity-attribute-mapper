import { useCallback, useState, useRef } from 'react';
import { useDropzone, FileRejection, DropEvent } from 'react-dropzone';
import { 
  FileUploadProps, 
  Entity, 
  Attribute 
} from '@/types';
import { parseEntitiesCSV, parseAttributesCSV, parseEntitiesWithHierarchyJSON } from '@/utils/csv-parser';
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
  const [entitiesLoaded, setEntitiesLoaded] = useState(isEntitiesFileUploaded);
  const [attributesLoaded, setAttributesLoaded] = useState(isAttributesFileUploaded);
  const [loadingEntities, setLoadingEntities] = useState(false);
  const [loadingAttributes, setLoadingAttributes] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadType, setUploadType] = useState<'csv' | 'json'>('csv');
  const [uploadedEntities, setUploadedEntities] = useState<Entity[]>([]);
  const errorRef = useRef<string | null>(null);

  const handleUploadTypeChange = (type: 'csv' | 'json') => {
    setUploadType(type);
    setError(null);
  };

  const onEntityDrop = useCallback(async (
    acceptedFiles: File[], 
    fileRejections: FileRejection[], 
    event: DropEvent
  ) => {
    if (acceptedFiles.length === 0) return;
    
    try {
      const file = acceptedFiles[0];
      const entities = await parseEntitiesCSV(file);
      
      console.log('Loaded entities with externalIds:', entities.map(e => ({
        name: e.name, 
        externalId: e.externalId,
        type: typeof e.externalId
      })));
      
      if (entities.length > 0) {
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

  const onJsonDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;
      
      setError(null);
      setLoadingEntities(true);
      setLoadingAttributes(true);
      
      try {
        const file = acceptedFiles[0];
        console.log('Processing JSON file:', file.name);
        
        const { entities, attributes } = await parseEntitiesWithHierarchyJSON(file);
        
        console.log('JSON file processed successfully');
        console.log('Parsed entities:', entities);
        console.log('Parsed attributes:', attributes);
        
        onEntityFileUpload(entities);
        onAttributeFileUpload(attributes);
        
        setEntitiesLoaded(true);
        setAttributesLoaded(true);
        setUploadedEntities(entities);
      } catch (error) {
        console.error('Error processing JSON file:', error);
        setError(`Error processing JSON file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setLoadingEntities(false);
        setLoadingAttributes(false);
      }
    },
    [onEntityFileUpload, onAttributeFileUpload]
  );

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
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        if (text) {
          console.log('CSV first 500 chars:', text.substring(0, 500));
        }
      };
      reader.readAsText(file);
      
      const attributes = await parseAttributesCSV(file, uploadedEntities);
      
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

  const { 
    getRootProps: getJsonRootProps,
    getInputProps: getJsonInputProps,
    isDragActive: isJsonDragActive
  } = useDropzone({
    onDrop: onJsonDrop,
    accept: {
      'application/json': ['.json']
    },
    maxFiles: 1
  });

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
    <div className="flex flex-col items-center justify-center h-full p-6 space-y-6">
      <div className="w-full max-w-2xl">
        <h2 className="text-2xl font-bold text-center mb-6">Upload Data</h2>
        
        <div className="flex justify-center mb-6">
          <div className="inline-flex rounded-md shadow-sm">
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                uploadType === 'csv' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => handleUploadTypeChange('csv')}
            >
              CSV Files
            </button>
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                uploadType === 'json' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => handleUploadTypeChange('json')}
            >
              JSON File
            </button>
          </div>
        </div>
        
        {uploadType === 'json' ? (
          <div
            {...getJsonRootProps()}
            className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition ${
              isJsonDragActive 
                ? 'border-blue-500 bg-blue-50' 
                : (entitiesLoaded && attributesLoaded) 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input {...getJsonInputProps()} />
            
            {loadingEntities || loadingAttributes ? (
              <div className="flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-700 mb-2"></div>
                <p>Processing JSON file...</p>
              </div>
            ) : (
              <>
                {entitiesLoaded && attributesLoaded ? (
                  <div className="text-green-600">
                    <svg className="w-16 h-16 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="text-lg font-semibold">JSON file uploaded successfully!</p>
                    <p className="text-sm text-gray-500 mt-1">Entities and attributes have been loaded</p>
                  </div>
                ) : (
                  <>
                    <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-lg font-semibold">Drop your JSON file here</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Upload a single entities_with_hierarchy.json file containing all entities, attributes, and relationships
                    </p>
                    <button 
                      type="button"
                      className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        document.getElementById('json-file-input')?.click();
                      }}
                    >
                      Select JSON File
                    </button>
                    <input 
                      id="json-file-input"
                      type="file"
                      className="hidden"
                      accept=".json"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          const file = e.target.files[0];
                          onJsonDrop([file]);
                        }
                      }}
                    />
                  </>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="space-y-6">
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
        )}
        
        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            <h3 className="font-bold mb-1">Error</h3>
            <p>{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
