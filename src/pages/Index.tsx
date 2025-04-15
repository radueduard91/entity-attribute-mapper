import React, { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  Entity, 
  Attribute, 
  EntityRelationEdge, 
  EntityFormValues, 
  AttributeFormValues,
  SystemType
} from '@/types';
import DiagramSidebar from '@/components/DiagramSidebar';
import EntityDiagram from '@/components/EntityDiagram';
import FileUpload from '@/components/FileUpload';
import EntityForm from '@/components/EntityForm';
import AttributeForm from '@/components/AttributeForm';
import { useToast } from '@/hooks/use-toast';
import { entitiesToCSV, attributesToCSV } from '@/utils/csv-parser';
import { downloadFile } from '@/utils/diagram-utils';

const Index = () => {
  const { toast } = useToast();
  
  // State for data
  const [entities, setEntities] = useState<Entity[]>([]);
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [edges, setEdges] = useState<EntityRelationEdge[]>([]);
  
  // State for file uploads
  const [isEntitiesFileUploaded, setIsEntitiesFileUploaded] = useState(false);
  const [isAttributesFileUploaded, setIsAttributesFileUploaded] = useState(false);
  
  // State for search and filter
  const [searchTerm, setSearchTerm] = useState('');
  const [systemFilter, setSystemFilter] = useState<SystemType | 'All'>('All');
  
  // State for forms
  const [isEntityFormOpen, setIsEntityFormOpen] = useState(false);
  const [isAttributeFormOpen, setIsAttributeFormOpen] = useState(false);
  const [editingEntity, setEditingEntity] = useState<Entity | null>(null);
  const [editingAttribute, setEditingAttribute] = useState<Attribute | null>(null);
  const [preselectedEntityId, setPreselectedEntityId] = useState<string | null>(null);
  
  // Event handlers for entity form
  const handleAddEntity = () => {
    setEditingEntity(null);
    setIsEntityFormOpen(true);
  };
  
  const handleEditEntity = (entityId: string) => {
    const entity = entities.find(e => e.id === entityId);
    if (entity) {
      setEditingEntity(entity);
      setIsEntityFormOpen(true);
    }
  };
  
  const handleEntityFormSubmit = (values: EntityFormValues) => {
    if (editingEntity) {
      // Update existing entity
      const updatedEntities = entities.map(entity => 
        entity.id === editingEntity.id 
          ? { ...entity, ...values } 
          : entity
      );
      setEntities(updatedEntities);
      
      toast({
        title: "Entity updated",
        description: `Entity "${values.name}" has been updated.`,
      });
    } else {
      // Create new entity
      const newEntity: Entity = {
        id: uuidv4(),
        ...values
      };
      setEntities([...entities, newEntity]);
      
      toast({
        title: "Entity created",
        description: `Entity "${values.name}" has been created.`,
      });
    }
    setEditingEntity(null);
  };
  
  const handleDeleteEntity = (entityId: string) => {
    // Remove entity
    const updatedEntities = entities.filter(entity => entity.id !== entityId);
    
    // Remove attributes for this entity
    const updatedAttributes = attributes.filter(attr => attr.entityId !== entityId);
    
    // Remove edges connected to this entity
    const updatedEdges = edges.filter(edge => 
      edge.source !== entityId && edge.target !== entityId
    );
    
    setEntities(updatedEntities);
    setAttributes(updatedAttributes);
    setEdges(updatedEdges);
    
    toast({
      title: "Entity deleted",
      description: "Entity and its attributes have been deleted.",
    });
  };
  
  // Event handlers for attribute form
  const handleAddAttribute = (entityId?: string) => {
    setEditingAttribute(null);
    setIsAttributeFormOpen(true);
    setPreselectedEntityId(entityId || null);
  };
  
  const handleEditAttribute = (attributeId: string) => {
    const attribute = attributes.find(a => a.id === attributeId);
    if (attribute) {
      setEditingAttribute(attribute);
      setIsAttributeFormOpen(true);
    }
  };
  
  const handleAttributeFormSubmit = (values: AttributeFormValues) => {
    if (editingAttribute) {
      // Update existing attribute
      const updatedAttributes = attributes.map(attr => 
        attr.id === editingAttribute.id 
          ? { ...attr, ...values } 
          : attr
      );
      setAttributes(updatedAttributes);
      
      toast({
        title: "Attribute updated",
        description: `Attribute "${values.name}" has been updated.`,
      });
    } else {
      // Create new attribute
      const newAttribute: Attribute = {
        id: uuidv4(),
        ...values
      };
      setAttributes([...attributes, newAttribute]);
      
      toast({
        title: "Attribute created",
        description: `Attribute "${values.name}" has been created.`,
      });
    }
    setEditingAttribute(null);
    setPreselectedEntityId(null);
  };
  
  const handleDeleteAttribute = (attributeId: string) => {
    const updatedAttributes = attributes.filter(attr => attr.id !== attributeId);
    setAttributes(updatedAttributes);
    
    toast({
      title: "Attribute deleted",
      description: "Attribute has been deleted.",
    });
  };
  
  // Event handlers for file uploads
  const handleEntityFileUpload = (uploadedEntities: Entity[]) => {
    console.log('Entities uploaded:', uploadedEntities);
    setEntities(uploadedEntities);
    setIsEntitiesFileUploaded(true);
  };
  
  const handleAttributeFileUpload = (uploadedAttributes: Attribute[]) => {
    console.log('Attributes uploaded:', uploadedAttributes);
    
    // Ensure the uploaded attributes have valid entity IDs
    const validAttributes = uploadedAttributes.filter(attr => {
      const entityExists = entities.some(entity => entity.id === attr.entityId);
      if (!entityExists) {
        console.warn(`Skipping attribute "${attr.name}" - entity not found`);
      }
      return entityExists;
    });
    
    setAttributes(validAttributes);
    setIsAttributesFileUploaded(true);
  };
  
  // Edge changes handler
  const handleEdgesChange = (updatedEdges: EntityRelationEdge[]) => {
    setEdges(updatedEdges);
  };
  
  // Export to CSV
  const handleExportCSV = () => {
    if (entities.length === 0) {
      toast({
        title: "Export failed",
        description: "No entities to export.",
        variant: "destructive"
      });
      return;
    }
    
    // Generate CSV content
    const entitiesCSV = entitiesToCSV(entities);
    const attributesCSV = attributesToCSV(attributes, entities);
    
    // Download files
    downloadFile(entitiesCSV, 'entities.csv', 'text/csv');
    downloadFile(attributesCSV, 'attributes.csv', 'text/csv');
    
    toast({
      title: "Export successful",
      description: "Entities and attributes have been exported as CSV files.",
    });
  };
  
  // Create a custom FileUpload component that includes the current entities
  const FileUploadWithEntities = () => (
    <FileUpload
      onEntityFileUpload={handleEntityFileUpload}
      onAttributeFileUpload={handleAttributeFileUpload}
      isEntitiesFileUploaded={isEntitiesFileUploaded}
      isAttributesFileUploaded={isAttributesFileUploaded}
    />
  );
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b p-4">
        <h1 className="text-2xl font-bold">Entity-Attribute Mapper</h1>
      </header>
      
      {/* Main content */}
      <main className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar */}
        <DiagramSidebar
          entities={entities}
          attributes={attributes}
          onAddEntity={handleAddEntity}
          onAddAttribute={() => handleAddAttribute()}
          onExportCSV={handleExportCSV}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          systemFilter={systemFilter}
          onSystemFilterChange={setSystemFilter}
        />
        
        {/* Main content area */}
        <div className="flex-1 flex flex-col h-[calc(100vh-4rem)]">
          {!isEntitiesFileUploaded || !isAttributesFileUploaded ? (
            <FileUploadWithEntities />
          ) : (
            <EntityDiagram
              entities={entities}
              attributes={attributes}
              onEditEntity={handleEditEntity}
              onDeleteEntity={handleDeleteEntity}
              onEditAttribute={handleEditAttribute}
              onDeleteAttribute={handleDeleteAttribute}
              onAddAttribute={handleAddAttribute}
              onEdgesChange={handleEdgesChange}
              systemFilter={systemFilter}
              searchTerm={searchTerm}
            />
          )}
        </div>
      </main>
      
      {/* Forms */}
      <EntityForm
        open={isEntityFormOpen}
        onOpenChange={setIsEntityFormOpen}
        onSubmit={handleEntityFormSubmit}
        initialValues={editingEntity || undefined}
        entities={entities}
      />
      
      <AttributeForm
        open={isAttributeFormOpen}
        onOpenChange={setIsAttributeFormOpen}
        onSubmit={handleAttributeFormSubmit}
        initialValues={
          editingAttribute || 
          (preselectedEntityId 
            ? { 
                name: '', 
                description: '', 
                isPrimaryKey: false, 
                entityId: preselectedEntityId, 
                system: 'EAM' 
              } 
            : undefined)
        }
        entities={entities}
      />
    </div>
  );
};

export default Index;
