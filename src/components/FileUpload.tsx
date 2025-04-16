
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  FileUploadProps,
  Entity, 
  Attribute 
} from '@/types';
import { parseEntitiesWithHierarchyJSON } from '@/utils/json-parser';
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
        console.log('Total attributes loaded:', attributes.length);
        
        // Check entity-attribute relationships
        entities.forEach(entity => {
          const entityAttrs = attributes.filter(attr => attr.entityId === entity.id);
          console.log(`Entity ${entity.name} (${entity.id}) has ${entityAttrs.length} attributes`);
        });
        
        onEntityFileUpload(entities);
        onAttributeFileUpload(attributes);
        
        setEntitiesLoaded(true);
        setAttributesLoaded(true);
        
        toast({
          title: "Data loaded successfully",
          description: `Loaded ${entities.length} entities and ${attributes.length} attributes`,
        });
      } catch (error) {
        console.error('Error processing JSON file:', error);
        setError(`Error processing JSON file: ${error instanceof Error ? error.message : 'Unknown error'}`);
        
        toast({
          title: "Error loading data",
          description: error instanceof Error ? error.message : "Failed to process JSON file",
          variant: "destructive"
        });
      } finally {
        setLoadingEntities(false);
        setLoadingAttributes(false);
      }
    },
    [onEntityFileUpload, onAttributeFileUpload, toast]
  );

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

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 space-y-6">
      <div className="w-full max-w-2xl">
        <h2 className="text-2xl font-bold text-center mb-6">Upload Entity Data</h2>
        
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
