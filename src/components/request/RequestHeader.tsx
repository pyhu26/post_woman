import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRequestStore } from '@/stores/requestStore';
import { Pencil, Check, X } from 'lucide-react';

export function RequestHeader() {
  const { currentRequest, updateCurrentRequest } = useRequestStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');

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

      <span className="text-xs text-muted-foreground">
        {currentRequest.updatedAt &&
          `Last updated: ${new Date(currentRequest.updatedAt).toLocaleString()}`
        }
      </span>
    </div>
  );
}
