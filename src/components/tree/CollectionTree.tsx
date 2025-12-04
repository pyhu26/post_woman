import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRequestStore } from '@/stores/requestStore';
import type { Collection, Folder, Request, HttpMethod } from '@/types';
import {
  ChevronRight,
  ChevronDown,
  Folder as FolderIcon,
  FolderOpen,
  FolderPlus,
  MoreHorizontal,
  FileJson,
  Trash2,
  Pencil,
  Copy,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const METHOD_COLORS: Record<HttpMethod, string> = {
  GET: 'text-green-600',
  POST: 'text-yellow-600',
  PUT: 'text-blue-600',
  DELETE: 'text-red-600',
  PATCH: 'text-purple-600',
};

interface CollectionTreeProps {
  collection: Collection;
}

export function CollectionTree({ collection }: CollectionTreeProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isAddingFolder, setIsAddingFolder] = useState(false);
  const [isAddingRequest, setIsAddingRequest] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [editName, setEditName] = useState('');
  const { addFolder, addRequest, deleteCollection, updateCollection } = useRequestStore();

  const handleAddFolder = () => {
    if (newItemName.trim()) {
      addFolder(collection.id, null, newItemName.trim());
      setNewItemName('');
      setIsAddingFolder(false);
    }
  };

  const handleAddRequest = () => {
    if (newItemName.trim()) {
      addRequest(collection.id, null, {
        name: newItemName.trim(),
        method: 'GET',
        url: '',
        headers: [],
        params: [],
        body: '',
      });
      setNewItemName('');
      setIsAddingRequest(false);
    }
  };

  const handleRename = () => {
    if (editName.trim()) {
      updateCollection(collection.id, editName.trim());
      setIsRenaming(false);
      setEditName('');
    }
  };

  const startRename = () => {
    setEditName(collection.name);
    setIsRenaming(true);
  };

  return (
    <div className="mb-1">
      <div className="flex items-center group rounded hover:bg-muted px-1 py-0.5">
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 p-0"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
        </Button>

        {isRenaming ? (
          <Input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRename();
              if (e.key === 'Escape') {
                setIsRenaming(false);
                setEditName('');
              }
            }}
            onBlur={handleRename}
            autoFocus
            className="h-6 text-sm flex-1 ml-1"
          />
        ) : (
          <span className="flex-1 text-sm font-medium truncate ml-1">
            {collection.name}
          </span>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100"
            >
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setIsAddingRequest(true)}>
              <FileJson className="h-4 w-4 mr-2" />
              Add Request
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsAddingFolder(true)}>
              <FolderPlus className="h-4 w-4 mr-2" />
              Add Folder
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={startRename}>
              <Pencil className="h-4 w-4 mr-2" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => deleteCollection(collection.id)}
              className="text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isExpanded && (
        <div className="ml-4">
          {(isAddingFolder || isAddingRequest) && (
            <div className="py-1">
              <Input
                placeholder={isAddingFolder ? 'Folder name' : 'Request name'}
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    isAddingFolder ? handleAddFolder() : handleAddRequest();
                  }
                  if (e.key === 'Escape') {
                    setIsAddingFolder(false);
                    setIsAddingRequest(false);
                    setNewItemName('');
                  }
                }}
                autoFocus
                className="h-7 text-xs"
              />
            </div>
          )}

          {collection.folders.map((folder) => (
            <FolderTree
              key={folder.id}
              folder={folder}
              collectionId={collection.id}
            />
          ))}

          {collection.requests.map((request) => (
            <RequestItem
              key={request.id}
              request={request}
              collectionId={collection.id}
              folderId={null}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface FolderTreeProps {
  folder: Folder;
  collectionId: string;
}

function FolderTree({ folder, collectionId }: FolderTreeProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAddingRequest, setIsAddingRequest] = useState(false);
  const [isAddingFolder, setIsAddingFolder] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [editName, setEditName] = useState('');
  const { addRequest, addFolder, deleteFolder, updateFolder } = useRequestStore();

  const handleAddRequest = () => {
    if (newItemName.trim()) {
      addRequest(collectionId, folder.id, {
        name: newItemName.trim(),
        method: 'GET',
        url: '',
        headers: [],
        params: [],
        body: '',
      });
      setNewItemName('');
      setIsAddingRequest(false);
    }
  };

  const handleAddFolder = () => {
    if (newItemName.trim()) {
      addFolder(collectionId, folder.id, newItemName.trim());
      setNewItemName('');
      setIsAddingFolder(false);
      setIsExpanded(true);
    }
  };

  const handleRename = () => {
    if (editName.trim()) {
      updateFolder(collectionId, folder.id, editName.trim());
      setIsRenaming(false);
      setEditName('');
    }
  };

  const startRename = () => {
    setEditName(folder.name);
    setIsRenaming(true);
  };

  return (
    <div className="mb-0.5">
      <div className="flex items-center group rounded hover:bg-muted px-1 py-0.5">
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 p-0"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
        </Button>
        {isExpanded ? (
          <FolderOpen className="h-3 w-3 text-muted-foreground ml-1" />
        ) : (
          <FolderIcon className="h-3 w-3 text-muted-foreground ml-1" />
        )}

        {isRenaming ? (
          <Input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRename();
              if (e.key === 'Escape') {
                setIsRenaming(false);
                setEditName('');
              }
            }}
            onBlur={handleRename}
            autoFocus
            className="h-6 text-sm flex-1 ml-1"
          />
        ) : (
          <span className="flex-1 text-sm truncate ml-1">{folder.name}</span>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100"
            >
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => { setIsAddingRequest(true); setIsExpanded(true); }}>
              <FileJson className="h-4 w-4 mr-2" />
              Add Request
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setIsAddingFolder(true); setIsExpanded(true); }}>
              <FolderPlus className="h-4 w-4 mr-2" />
              Add Folder
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={startRename}>
              <Pencil className="h-4 w-4 mr-2" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => deleteFolder(collectionId, folder.id)}
              className="text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isExpanded && (
        <div className="ml-4">
          {(isAddingRequest || isAddingFolder) && (
            <div className="py-1">
              <Input
                placeholder={isAddingFolder ? 'Folder name' : 'Request name'}
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    isAddingFolder ? handleAddFolder() : handleAddRequest();
                  }
                  if (e.key === 'Escape') {
                    setIsAddingRequest(false);
                    setIsAddingFolder(false);
                    setNewItemName('');
                  }
                }}
                autoFocus
                className="h-7 text-xs"
              />
            </div>
          )}

          {folder.folders.map((subFolder) => (
            <FolderTree
              key={subFolder.id}
              folder={subFolder}
              collectionId={collectionId}
            />
          ))}

          {folder.requests.map((request) => (
            <RequestItem
              key={request.id}
              request={request}
              collectionId={collectionId}
              folderId={folder.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface RequestItemProps {
  request: Request;
  collectionId: string;
  folderId: string | null;
}

function RequestItem({ request, collectionId, folderId }: RequestItemProps) {
  const { setCurrentRequest, deleteRequest, currentRequest, addRequest } = useRequestStore();
  const isActive = currentRequest?.id === request.id;

  const handleDuplicate = () => {
    addRequest(collectionId, folderId, {
      name: `${request.name} (copy)`,
      method: request.method,
      url: request.url,
      headers: [...request.headers],
      params: [...request.params],
      body: request.body,
    });
  };

  return (
    <div
      className={cn(
        'flex items-center group rounded px-1 py-0.5 cursor-pointer',
        isActive ? 'bg-primary/10' : 'hover:bg-muted'
      )}
      onClick={() => setCurrentRequest({ ...request })}
    >
      <span className={cn('text-xs font-mono w-12', METHOD_COLORS[request.method])}>
        {request.method}
      </span>
      <span className="flex-1 text-sm truncate">{request.name}</span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              handleDuplicate();
            }}
          >
            <Copy className="h-4 w-4 mr-2" />
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              deleteRequest(collectionId, folderId, request.id);
            }}
            className="text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
