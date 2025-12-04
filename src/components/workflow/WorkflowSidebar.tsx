import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useWorkflowStore } from '@/stores/workflowStore';
import { Plus, Workflow, MoreHorizontal, Trash2, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';

export function WorkflowSidebar() {
  const {
    workflows,
    currentWorkflow,
    createWorkflow,
    setCurrentWorkflow,
    deleteWorkflow,
    updateWorkflow,
  } = useWorkflowStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleAddWorkflow = () => {
    if (newName.trim()) {
      createWorkflow(newName.trim());
      setNewName('');
      setIsAdding(false);
    }
  };

  const handleStartEdit = (workflow: { id: string; name: string }) => {
    setEditingId(workflow.id);
    setEditName(workflow.name);
  };

  const handleSaveEdit = () => {
    if (editingId && editName.trim()) {
      updateWorkflow(editingId, { name: editName.trim() });
    }
    setEditingId(null);
    setEditName('');
  };

  return (
    <div className="h-full flex flex-col border-r">
      <div className="p-3 border-b flex items-center justify-between">
        <h2 className="font-semibold text-sm flex items-center gap-2">
          <Workflow className="h-4 w-4" />
          Workflows
        </h2>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => setIsAdding(true)}
          title="Add Workflow"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {isAdding && (
        <div className="p-2 border-b">
          <Input
            placeholder="Workflow name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddWorkflow();
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
          {workflows.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No workflows yet
            </p>
          ) : (
            workflows.map((workflow) => (
              <div
                key={workflow.id}
                className={cn(
                  'flex items-center group rounded px-2 py-1.5 cursor-pointer',
                  currentWorkflow?.id === workflow.id
                    ? 'bg-primary/10'
                    : 'hover:bg-muted'
                )}
                onClick={() => setCurrentWorkflow(workflow)}
              >
                <Workflow className="h-3 w-3 text-muted-foreground mr-2" />

                {editingId === workflow.id ? (
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit();
                      if (e.key === 'Escape') {
                        setEditingId(null);
                        setEditName('');
                      }
                    }}
                    onBlur={handleSaveEdit}
                    onClick={(e) => e.stopPropagation()}
                    autoFocus
                    className="h-6 text-sm flex-1"
                  />
                ) : (
                  <>
                    <span className="flex-1 text-sm truncate">{workflow.name}</span>
                    <span className="text-xs text-muted-foreground mr-2">
                      {workflow.nodes.length}
                    </span>
                  </>
                )}

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
                        handleStartEdit(workflow);
                      }}
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteWorkflow(workflow.id);
                      }}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
