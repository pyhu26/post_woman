import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWorkflowStore } from '@/stores/workflowStore';
import { Play, Square, Pencil, Check, X } from 'lucide-react';

export function WorkflowHeader() {
  const {
    currentWorkflow,
    updateWorkflow,
    isExecuting,
    executeWorkflow,
    stopExecution,
  } = useWorkflowStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');

  if (!currentWorkflow) return null;

  const handleStartEdit = () => {
    setEditName(currentWorkflow.name);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editName.trim()) {
      updateWorkflow(currentWorkflow.id, { name: editName.trim() });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditName('');
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
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleSave}>
            <Check className="h-4 w-4 text-green-600" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCancel}>
            <X className="h-4 w-4 text-muted-foreground" />
          </Button>
        </>
      ) : (
        <>
          <span className="text-sm font-medium">{currentWorkflow.name}</span>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleStartEdit}>
            <Pencil className="h-3 w-3 text-muted-foreground" />
          </Button>
        </>
      )}

      <div className="flex-1" />

      <span className="text-xs text-muted-foreground mr-2">
        {currentWorkflow.nodes.length} node{currentWorkflow.nodes.length !== 1 ? 's' : ''}
      </span>

      {isExecuting ? (
        <Button variant="destructive" size="sm" onClick={stopExecution}>
          <Square className="h-4 w-4 mr-1" />
          Stop
        </Button>
      ) : (
        <Button
          size="sm"
          onClick={executeWorkflow}
          disabled={currentWorkflow.nodes.length === 0}
        >
          <Play className="h-4 w-4 mr-1" />
          Run
        </Button>
      )}
    </div>
  );
}
