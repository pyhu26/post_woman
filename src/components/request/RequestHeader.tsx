import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRequestStore } from '@/stores/requestStore';
import { Pencil, Check, X, Save, FolderPlus, ChevronDown } from 'lucide-react';

export function RequestHeader() {
  const {
    currentRequest,
    updateCurrentRequest,
    collections,
    addCollection,
    addRequest,
  } = useRequestStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');

  if (!currentRequest) return null;

  const handleStartEdit = () => {
    setEditName(currentRequest.name);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editName.trim()) {
      updateCurrentRequest({ name: editName.trim() });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditName('');
  };

  const handleSaveToCollection = (collectionId: string, folderId: string | null = null) => {
    addRequest(collectionId, folderId, {
      name: currentRequest.name,
      method: currentRequest.method,
      url: currentRequest.url,
      headers: currentRequest.headers,
      params: currentRequest.params,
      body: currentRequest.body,
    });
  };

  return (
    <div className="px-3 py-2 border-b bg-muted/30 flex items-center gap-2">
      {isEditing ? (
        <>
          <Input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') handleCancel();
            }}
            className="h-7 text-sm font-medium max-w-xs"
            autoFocus
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleSave}
          >
            <Check className="h-4 w-4 text-green-600" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleCancel}
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </Button>
        </>
      ) : (
        <>
          <span className="text-sm font-medium">{currentRequest.name}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleStartEdit}
          >
            <Pencil className="h-3 w-3 text-muted-foreground" />
          </Button>
        </>
      )}

      <div className="flex-1" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-7">
            <Save className="h-3 w-3 mr-1" />
            Save
            <ChevronDown className="h-3 w-3 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {collections.length === 0 ? (
            <DropdownMenuItem
              onClick={() => setIsCreatingCollection(true)}
            >
              <FolderPlus className="h-4 w-4 mr-2" />
              Create Collection
            </DropdownMenuItem>
          ) : (
            <>
              {collections.map((collection) => (
                <DropdownMenuSub key={collection.id}>
                  <DropdownMenuSubTrigger>
                    {collection.name}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem
                      onClick={() => handleSaveToCollection(collection.id, null)}
                    >
                      Save here
                    </DropdownMenuItem>
                    {collection.folders.length > 0 && (
                      <>
                        <DropdownMenuSeparator />
                        {collection.folders.map((folder) => (
                          <DropdownMenuItem
                            key={folder.id}
                            onClick={() => handleSaveToCollection(collection.id, folder.id)}
                          >
                            {folder.name}
                          </DropdownMenuItem>
                        ))}
                      </>
                    )}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setIsCreatingCollection(true)}
              >
                <FolderPlus className="h-4 w-4 mr-2" />
                New Collection
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {isCreatingCollection && (
        <div className="absolute top-12 right-3 bg-background border rounded-md shadow-lg p-3 z-50">
          <Input
            placeholder="Collection name"
            value={newCollectionName}
            onChange={(e) => setNewCollectionName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newCollectionName.trim()) {
                addCollection(newCollectionName.trim());
                setNewCollectionName('');
                setIsCreatingCollection(false);
              }
              if (e.key === 'Escape') {
                setIsCreatingCollection(false);
                setNewCollectionName('');
              }
            }}
            autoFocus
            className="w-48"
          />
          <div className="flex gap-2 mt-2">
            <Button
              size="sm"
              onClick={() => {
                if (newCollectionName.trim()) {
                  addCollection(newCollectionName.trim());
                  setNewCollectionName('');
                  setIsCreatingCollection(false);
                }
              }}
            >
              Create
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setIsCreatingCollection(false);
                setNewCollectionName('');
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
