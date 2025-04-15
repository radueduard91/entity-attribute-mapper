
import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { EntityNodeProps } from '@/types';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, PlusCircle, Key } from 'lucide-react';

const EntityNode = memo(({ data, isConnectable }: EntityNodeProps) => {
  const { 
    entity, 
    attributes, 
    onEditEntity, 
    onDeleteEntity,
    onEditAttribute,
    onDeleteAttribute,
    onAddAttribute
  } = data;

  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-2 h-2"
      />
      
      <div className="entity-node-content">
        <div className="entity-header flex justify-between items-center">
          <span className="truncate flex-1">{entity.name}</span>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5"
              onClick={(e) => {
                e.stopPropagation();
                onEditEntity(entity.id);
              }}
            >
              <Edit size={12} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteEntity(entity.id);
              }}
            >
              <Trash2 size={12} />
            </Button>
          </div>
        </div>
        
        <div className="entity-description">
          {entity.description}
        </div>
        
        <div className="entity-attributes">
          {attributes.length > 0 ? (
            attributes.map((attr) => (
              <div key={attr.id} className="entity-attribute hover:bg-gray-50 group">
                <div className="flex justify-between items-center w-full">
                  <div className="flex items-center">
                    {attr.isPrimaryKey && <Key size={10} className="entity-attribute-pk text-amber-500" />}
                    <span className="truncate">{attr.name}</span>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditAttribute(attr.id);
                      }}
                    >
                      <Edit size={10} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteAttribute(attr.id);
                      }}
                    >
                      <Trash2 size={10} />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-2 text-center text-gray-400 text-xs">No attributes</div>
          )}
          
          <div className="p-1 flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs flex items-center gap-1 hover:bg-gray-100"
              onClick={(e) => {
                e.stopPropagation();
                onAddAttribute(entity.id);
              }}
            >
              <PlusCircle size={10} />
              Add Attribute
            </Button>
          </div>
        </div>
      </div>
      
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-2 h-2"
      />
    </>
  );
});

export default EntityNode;
