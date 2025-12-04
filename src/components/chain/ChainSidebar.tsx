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
import { useChainStore } from '@/stores/chainStore';
import { Plus, Link2, MoreHorizontal, Trash2, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ChainSidebar() {
  const { chains, currentChain, createChain, setCurrentChain, deleteChain, updateChain } =
    useChainStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleAddChain = () => {
    if (newName.trim()) {
      createChain(newName.trim());
      setNewName('');
      setIsAdding(false);
    }
  };

  const handleStartEdit = (chain: { id: string; name: string }) => {
    setEditingId(chain.id);
    setEditName(chain.name);
  };

  const handleSaveEdit = () => {
    if (editingId && editName.trim()) {
      updateChain(editingId, { name: editName.trim() });
    }
    setEditingId(null);
    setEditName('');
  };

  return (
    <div className="border-t">
      <div className="p-3 border-b flex items-center justify-between">
        <h2 className="font-semibold text-sm flex items-center gap-2">
          <Link2 className="h-4 w-4" />
          Chains
        </h2>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => setIsAdding(true)}
          title="Add Chain"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {isAdding && (
        <div className="p-2 border-b">
          <Input
            placeholder="Chain name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddChain();
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

      <ScrollArea className="max-h-48">
        <div className="p-2">
          {chains.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-2">
              No chains yet
            </p>
          ) : (
            chains.map((chain) => (
              <div
                key={chain.id}
                className={cn(
                  'flex items-center group rounded px-2 py-1.5 cursor-pointer',
                  currentChain?.id === chain.id ? 'bg-primary/10' : 'hover:bg-muted'
                )}
                onClick={() => setCurrentChain(chain)}
              >
                <Link2 className="h-3 w-3 text-muted-foreground mr-2" />

                {editingId === chain.id ? (
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
                    <span className="flex-1 text-sm truncate">{chain.name}</span>
                    <span className="text-xs text-muted-foreground mr-2">
                      {chain.steps.length}
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
                        handleStartEdit(chain);
                      }}
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteChain(chain.id);
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
