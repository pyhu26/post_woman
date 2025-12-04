import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useWorkflowStore } from '@/stores/workflowStore';
import { useRequestStore } from '@/stores/requestStore';
import type { Request, HttpMethod } from '@/types';
import { Plus, FileJson } from 'lucide-react';
import { cn } from '@/lib/utils';

const METHOD_COLORS: Record<HttpMethod, string> = {
  GET: 'text-green-600',
  POST: 'text-yellow-600',
  PUT: 'text-blue-600',
  DELETE: 'text-red-600',
  PATCH: 'text-purple-600',
};

export function WorkflowToolbar() {
  const { currentWorkflow, addNode } = useWorkflowStore();
  const { collections } = useRequestStore();
  const [isOpen, setIsOpen] = useState(false);

  if (!currentWorkflow) return null;

  // Get all requests from collections
  const getAllRequests = () => {
    const requests: { request: Request; path: string }[] = [];

    collections.forEach((collection) => {
      collection.requests.forEach((req) => {
        requests.push({ request: req, path: collection.name });
      });

      const addFromFolder = (
        folders: typeof collection.folders,
        parentPath: string
      ) => {
        folders.forEach((folder) => {
          folder.requests.forEach((req) => {
            requests.push({ request: req, path: `${parentPath}/${folder.name}` });
          });
          addFromFolder(folder.folders, `${parentPath}/${folder.name}`);
        });
      };

      addFromFolder(collection.folders, collection.name);
    });

    return requests;
  };

  const handleAddNewNode = () => {
    const newRequest: Request = {
      id: crypto.randomUUID(),
      name: `Node ${currentWorkflow.nodes.length + 1}`,
      method: 'GET',
      url: '',
      headers: [],
      params: [],
      body: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Calculate position based on existing nodes
    const maxX = currentWorkflow.nodes.reduce(
      (max, node) => Math.max(max, node.position.x),
      0
    );
    const position = { x: maxX + 250, y: 100 };

    addNode(newRequest, position);
    setIsOpen(false);
  };

  const handleAddFromCollection = (request: Request) => {
    const maxX = currentWorkflow.nodes.reduce(
      (max, node) => Math.max(max, node.position.x),
      0
    );
    const position = { x: maxX + 250, y: 100 };

    addNode(request, position);
    setIsOpen(false);
  };

  const allRequests = getAllRequests();

  return (
    <div className="px-3 py-2 border-b flex items-center gap-2">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-1" />
            Add Node
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Node</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Button onClick={handleAddNewNode} className="w-full">
              <FileJson className="h-4 w-4 mr-2" />
              Create New Request
            </Button>

            {allRequests.length > 0 && (
              <>
                <div className="text-sm text-muted-foreground">
                  Or add from collection:
                </div>
                <ScrollArea className="max-h-64">
                  <div className="space-y-1">
                    {allRequests.map(({ request, path }) => (
                      <div
                        key={request.id}
                        className="flex items-center gap-2 p-2 rounded hover:bg-muted cursor-pointer"
                        onClick={() => handleAddFromCollection(request)}
                      >
                        <span
                          className={cn(
                            'font-mono text-xs w-14',
                            METHOD_COLORS[request.method]
                          )}
                        >
                          {request.method}
                        </span>
                        <span className="text-sm truncate flex-1">
                          {request.name}
                        </span>
                        <span className="text-xs text-muted-foreground truncate max-w-32">
                          {path}
                        </span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <span className="text-xs text-muted-foreground">
        Drag to connect nodes. Click edge to add mappings.
      </span>
    </div>
  );
}
