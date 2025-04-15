
import React, { useCallback, useMemo } from 'react';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Node,
  Edge,
  EdgeChange
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { 
  Entity, 
  Attribute,
  EntityNode,
  EntityRelationEdge 
} from '@/types';
import EntityNodeComponent from './EntityNode';
import { generateNodes, generateEdges } from '@/utils/diagram-utils';

interface EntityDiagramProps {
  entities: Entity[];
  attributes: Attribute[];
  onEditEntity: (entityId: string) => void;
  onDeleteEntity: (entityId: string) => void;
  onEditAttribute: (attributeId: string) => void;
  onDeleteAttribute: (attributeId: string) => void;
  onAddAttribute: (entityId: string) => void;
  onEdgesChange: (edges: EntityRelationEdge[]) => void;
  systemFilter: string;
  searchTerm: string;
}

const nodeTypes = {
  entity: EntityNodeComponent,
};

const EntityDiagram = ({
  entities,
  attributes,
  onEditEntity,
  onDeleteEntity,
  onEditAttribute,
  onDeleteAttribute,
  onAddAttribute,
  onEdgesChange: updateEdgesChange, // Rename this prop to avoid conflict
  systemFilter,
  searchTerm
}: EntityDiagramProps) => {
  // Filter entities and attributes based on search and system filter
  const filteredEntities = useMemo(() => {
    let result = [...entities];
    
    // Apply system filter
    if (systemFilter !== 'All') {
      result = result.filter(entity => entity.system === systemFilter);
    }
    
    // Apply search filter (search in attributes)
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      const attributeEntityIds = attributes
        .filter(attr => 
          attr.name.toLowerCase().includes(lowerSearchTerm) || 
          attr.description.toLowerCase().includes(lowerSearchTerm)
        )
        .map(attr => attr.entityId);
      
      // Unique entity IDs
      const uniqueEntityIds = [...new Set(attributeEntityIds)];
      
      result = result.filter(entity => 
        entity.name.toLowerCase().includes(lowerSearchTerm) ||
        entity.description.toLowerCase().includes(lowerSearchTerm) ||
        uniqueEntityIds.includes(entity.id)
      );
    }
    
    return result;
  }, [entities, attributes, systemFilter, searchTerm]);

  // Filter attributes based on search and system filter
  const filteredAttributes = useMemo(() => {
    let result = [...attributes];
    
    // Apply system filter
    if (systemFilter !== 'All') {
      result = result.filter(attr => attr.system === systemFilter);
    }
    
    // Apply search filter
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(attr => 
        attr.name.toLowerCase().includes(lowerSearchTerm) ||
        attr.description.toLowerCase().includes(lowerSearchTerm)
      );
    }
    
    // Only include attributes that belong to filtered entities
    const filteredEntityIds = filteredEntities.map(entity => entity.id);
    result = result.filter(attr => filteredEntityIds.includes(attr.entityId));
    
    return result;
  }, [attributes, filteredEntities, systemFilter, searchTerm]);

  // Generate nodes and edges from filtered entities and attributes
  const initialNodes = useMemo(() => 
    generateNodes(
      filteredEntities, 
      filteredAttributes,
      onEditEntity,
      onDeleteEntity,
      onEditAttribute,
      onDeleteAttribute,
      onAddAttribute
    ),
    [filteredEntities, filteredAttributes, onEditEntity, onDeleteEntity, onEditAttribute, onDeleteAttribute, onAddAttribute]
  );
  
  const initialEdges = useMemo(() => 
    generateEdges(filteredEntities),
    [filteredEntities]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => {
      // Find source and target entities
      const sourceEntity = entities.find(e => e.id === params.source);
      const targetEntity = entities.find(e => e.id === params.target);
      
      if (sourceEntity && targetEntity) {
        // Update the target entity's parent to be the source entity's name
        const updatedEntities = entities.map(e => {
          if (e.id === targetEntity.id) {
            return { ...e, parent: sourceEntity.name };
          }
          return e;
        });
        
        // Add edge
        const newEdges = addEdge(
          {
            ...params,
            type: 'smoothstep',
            data: { relationshipType: 'parent-child' },
          }, 
          edges
        ) as EntityRelationEdge[];
        
        setEdges(newEdges);
        updateEdgesChange(newEdges);
      }
    },
    [entities, edges, setEdges, updateEdgesChange]
  );

  // When edges change (remove), update entity parent relationships
  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      // Handle edge removal
      const removedEdges = changes
        .filter(change => change.type === 'remove')
        .map(change => change.id);
      
      if (removedEdges.length > 0) {
        // Find the removed relationships and update entity parents
        const updatedEntities = entities.map(entity => {
          // Check if this entity has a parent relationship that was removed
          const parentEdge = initialEdges.find(edge => 
            edge.target === entity.id && removedEdges.includes(edge.id)
          );
          
          if (parentEdge) {
            // Remove the parent relationship
            return { ...entity, parent: '' };
          }
          
          return entity;
        });
        
        // Apply edge changes before proceeding
        onEdgesChange(changes as any); // Type assertion to fix the type error
        
        // Update edges based on the new entity relationships
        const newEdges = edges.filter(edge => !removedEdges.includes(edge.id));
        setEdges(newEdges);
        updateEdgesChange(newEdges);
      } else {
        // Normal edge changes (not removal)
        onEdgesChange(changes as any); // Type assertion to fix the type error
      }
    },
    [entities, initialEdges, edges, setEdges, onEdgesChange, updateEdgesChange]
  );

  // Update nodes and edges when filtered entities/attributes change
  React.useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        minZoom={0.2}
        maxZoom={4}
        attributionPosition="bottom-right"
      >
        <Background color="#aaa" gap={16} />
        <Controls />
        <MiniMap 
          nodeColor={(node) => {
            const nodeData = (node as EntityNode).data;
            if (nodeData && nodeData.entity) {
              const system = nodeData.entity.system.toLowerCase();
              if (system === 'eam') return '#4CAF50';
              if (system === 'ipen') return '#1EAEDB';
              if (system === 'both') return '#F97316';
            }
            return '#eee';
          }}
          maskColor="rgba(240, 240, 240, 0.6)"
          zoomable
          pannable
        />
      </ReactFlow>
    </div>
  );
};

export default EntityDiagram;
