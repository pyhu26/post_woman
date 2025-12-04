import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRequestStore } from '@/stores/requestStore';
import { CollectionTree } from './CollectionTree';
import { FileJson, FolderPlus } from 'lucide-react';

export function Sidebar() {
  const { collections, addCollection, createNewRequest } = useRequestStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');

  const handleAddCollection = () => {
    if (newName.trim()) {
      addCollection(newName.trim());
      setNewName('');
      setIsAdding(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-muted/30">
      <div className="p-3 border-b">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start"
          onClick={createNewRequest}
        >
          <FileJson className="h-4 w-4 mr-2" />
          New Request
        </Button>
      </div>

      <div className="p-3 border-b flex items-center justify-between">
        <h2 className="font-semibold text-sm">Collections</h2>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => setIsAdding(true)}
          title="Add Collection"
        >
          <FolderPlus className="h-4 w-4" />
        </Button>
      </div>

      {isAdding && (
        <div className="p-2 border-b">
          <Input
            placeholder="Collection name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddCollection();
              if (e.key === 'Escape') {
                setIsAdding(false);
                setNewName('');
              }
            }}
            autoFocus
            className="h-8 text-sm"
          />
        </div>
      )}

      <ScrollArea className="flex-1">
        <div className="p-2">
          {collections.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No collections yet
            </p>
          ) : (
            collections.map((collection) => (
              <CollectionTree key={collection.id} collection={collection} />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
