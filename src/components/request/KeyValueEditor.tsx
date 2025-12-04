import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { KeyValue } from '@/types';
import { createKeyValue } from '@/utils/http';
import { Plus, Trash2, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KeyValueEditorProps {
  items: KeyValue[];
  onChange: (items: KeyValue[]) => void;
  placeholder?: { key: string; value: string };
}

export function KeyValueEditor({
  items,
  onChange,
  placeholder = { key: 'Key', value: 'Value' },
}: KeyValueEditorProps) {
  const addItem = () => {
    onChange([...items, createKeyValue()]);
  };

  const updateItem = (id: string, updates: Partial<KeyValue>) => {
    onChange(
      items.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const removeItem = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  const toggleItem = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (item) {
      updateItem(id, { enabled: !item.enabled });
    }
  };

  return (
    <div className="p-3">
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'h-8 w-8 shrink-0',
                item.enabled ? 'text-green-600' : 'text-muted-foreground'
              )}
              onClick={() => toggleItem(item.id)}
            >
              {item.enabled ? (
                <Check className="h-4 w-4" />
              ) : (
                <X className="h-4 w-4" />
              )}
            </Button>
            <Input
              placeholder={placeholder.key}
              value={item.key}
              onChange={(e) => updateItem(item.id, { key: e.target.value })}
              className={cn(
                'flex-1 h-8 text-sm',
                !item.enabled && 'opacity-50'
              )}
            />
            <Input
              placeholder={placeholder.value}
              value={item.value}
              onChange={(e) => updateItem(item.id, { value: e.target.value })}
              className={cn(
                'flex-1 h-8 text-sm',
                !item.enabled && 'opacity-50'
              )}
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
              onClick={() => removeItem(item.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <Button
        variant="outline"
        size="sm"
        className="mt-3"
        onClick={addItem}
      >
        <Plus className="h-4 w-4 mr-1" />
        Add
      </Button>
    </div>
  );
}
