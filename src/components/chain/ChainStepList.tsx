import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useChainStore } from '@/stores/chainStore';
import { useRequestStore } from '@/stores/requestStore';
import type { HttpMethod, Request } from '@/types';
import { Plus, Trash2, GripVertical, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

const METHOD_COLORS: Record<HttpMethod, string> = {
  GET: 'text-green-600',
  POST: 'text-yellow-600',
  PUT: 'text-blue-600',
  DELETE: 'text-red-600',
  PATCH: 'text-purple-600',
};

export function ChainStepList() {
  const { currentChain, addStep, updateStep, removeStep, reorderSteps, isExecuting, currentStepIndex } =
    useChainStore();
  const { collections } = useRequestStore();

  const [showAddNew, setShowAddNew] = useState(false);

  if (!currentChain) return null;

  const handleAddNewStep = () => {
    const newRequest: Request = {
      id: crypto.randomUUID(),
      name: `Step ${currentChain.steps.length + 1}`,
      method: 'GET',
      url: '',
      headers: [],
      params: [],
      body: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addStep(newRequest);
    setShowAddNew(false);
  };

  const handleAddFromCollection = (request: Request) => {
    addStep(request);
    setShowAddNew(false);
  };

  // Get all requests from collections
  const getAllRequests = () => {
    const requests: { request: Request; path: string }[] = [];

    collections.forEach((collection) => {
      collection.requests.forEach((req) => {
        requests.push({ request: req, path: `${collection.name}` });
      });

      const addFromFolder = (folders: typeof collection.folders, parentPath: string) => {
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

  const allRequests = getAllRequests();

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b flex items-center justify-between">
        <span className="text-sm font-medium">Steps</span>
        <Button size="sm" variant="outline" onClick={() => setShowAddNew(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Add Step
        </Button>
      </div>

      {showAddNew && (
        <div className="p-3 border-b bg-muted/50 space-y-2">
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAddNewStep}>
              Create New
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowAddNew(false)}>
              Cancel
            </Button>
          </div>
          {allRequests.length > 0 && (
            <>
              <div className="text-xs text-muted-foreground">Or add from collection:</div>
              <ScrollArea className="max-h-32">
                <div className="space-y-1">
                  {allRequests.map(({ request, path }) => (
                    <div
                      key={request.id}
                      className="flex items-center gap-2 p-1.5 rounded hover:bg-muted cursor-pointer text-sm"
                      onClick={() => handleAddFromCollection(request)}
                    >
                      <span className={cn('font-mono text-xs w-12', METHOD_COLORS[request.method])}>
                        {request.method}
                      </span>
                      <span className="truncate">{request.name}</span>
                      <span className="text-xs text-muted-foreground truncate ml-auto">
                        {path}
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </>
          )}
        </div>
      )}

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {currentChain.steps.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No steps yet. Add a step to start building your chain.
            </p>
          ) : (
            currentChain.steps.map((step, index) => (
              <StepItem
                key={step.id}
                step={step}
                index={index}
                totalSteps={currentChain.steps.length}
                isRunning={isExecuting && currentStepIndex === index}
                onUpdate={(request) => updateStep(step.id, request)}
                onRemove={() => removeStep(step.id)}
                onMoveUp={() => reorderSteps(index, index - 1)}
                onMoveDown={() => reorderSteps(index, index + 1)}
                disabled={isExecuting}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

interface StepItemProps {
  step: { id: string; request: Request; order: number };
  index: number;
  totalSteps: number;
  isRunning: boolean;
  onUpdate: (request: Request) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  disabled: boolean;
}

function StepItem({
  step,
  index,
  totalSteps,
  isRunning,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
  disabled,
}: StepItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={cn(
        'border rounded-lg overflow-hidden',
        isRunning && 'ring-2 ring-primary animate-pulse'
      )}
    >
      <div className="flex items-center gap-2 p-2 bg-muted/30">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground w-6">
          #{index + 1}
        </span>

        <Select
          value={step.request.method}
          onValueChange={(value) =>
            onUpdate({ ...step.request, method: value as HttpMethod })
          }
          disabled={disabled}
        >
          <SelectTrigger className="w-24 h-7">
            <SelectValue>
              <span className={cn('font-mono text-xs', METHOD_COLORS[step.request.method])}>
                {step.request.method}
              </span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {METHODS.map((method) => (
              <SelectItem key={method} value={method}>
                <span className={cn('font-mono', METHOD_COLORS[method])}>{method}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          value={step.request.url}
          onChange={(e) => onUpdate({ ...step.request, url: e.target.value })}
          placeholder="Enter URL"
          className="flex-1 h-7 text-sm font-mono"
          disabled={disabled}
        />

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onMoveUp}
            disabled={index === 0 || disabled}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onMoveDown}
            disabled={index === totalSteps - 1 || disabled}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive"
            onClick={onRemove}
            disabled={disabled}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-3 border-t">
          <div className="space-y-2">
            <div>
              <label className="text-xs text-muted-foreground">Name</label>
              <Input
                value={step.request.name}
                onChange={(e) => onUpdate({ ...step.request, name: e.target.value })}
                className="h-8 text-sm"
                disabled={disabled}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Body</label>
              <textarea
                value={step.request.body}
                onChange={(e) => onUpdate({ ...step.request, body: e.target.value })}
                className="w-full h-24 p-2 text-sm font-mono border rounded-md resize-none"
                disabled={disabled}
              />
            </div>
          </div>
        </div>
      )}

      <button
        className="w-full py-1 text-xs text-muted-foreground hover:bg-muted/50 border-t"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? 'Hide details' : 'Show details'}
      </button>
    </div>
  );
}
