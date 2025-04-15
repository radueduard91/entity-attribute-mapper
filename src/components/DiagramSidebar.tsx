
import React from 'react';
import { 
  DiagramSidebarProps,
  SystemType 
} from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  PlusCircle, 
  Download, 
  Search, 
  Filter 
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const DiagramSidebar = ({
  entities,
  attributes,
  onAddEntity,
  onAddAttribute,
  onExportCSV,
  searchTerm,
  onSearchChange,
  systemFilter,
  onSystemFilterChange
}: DiagramSidebarProps) => {
  return (
    <div className="w-full md:w-64 px-4 py-6 border-b md:border-r md:border-b-0 h-full overflow-auto flex flex-col">
      <div className="flex flex-col gap-6">
        <h2 className="text-xl font-bold">Entity-Attribute Mapper</h2>
        
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1 justify-start" 
              onClick={onAddEntity}
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Add Entity
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 justify-start" 
              onClick={onAddAttribute}
              disabled={entities.length === 0}
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Add Attribute
            </Button>
          </div>
          
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={onExportCSV}
            disabled={entities.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            <Input
              placeholder="Search attributes..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-8"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <Select
              value={systemFilter}
              onValueChange={(value) => onSystemFilterChange(value as SystemType | 'All')}
            >
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Filter by system" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All systems</SelectItem>
                <SelectItem value="EAM">EAM</SelectItem>
                <SelectItem value="iPen">iPen</SelectItem>
                <SelectItem value="Both">Both</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="mt-4 space-y-2">
          <h3 className="text-sm font-semibold text-gray-500">STATS</h3>
          <div className="grid grid-cols-2 gap-2">
            <Card>
              <CardContent className="p-3">
                <div className="text-2xl font-bold">{entities.length}</div>
                <div className="text-xs text-gray-500">Entities</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3">
                <div className="text-2xl font-bold">{attributes.length}</div>
                <div className="text-xs text-gray-500">Attributes</div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-500 mb-2">SYSTEM LEGEND</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-sm bg-eam"></div>
              <span className="text-sm">EAM</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-sm bg-ipen"></div>
              <span className="text-sm">iPen</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-sm bg-both"></div>
              <span className="text-sm">Both</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiagramSidebar;
