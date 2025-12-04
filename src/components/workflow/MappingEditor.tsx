import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useWorkflowStore } from '@/stores/workflowStore';
import type { ParameterMapping, WorkflowEdge } from '@/types';
import { Plus, Trash2, ArrowRight } from 'lucide-react';

interface MappingEditorProps {
  edge: WorkflowEdge | null;
  onClose: () => void;
}

export function MappingEditor({ edge, onClose }: MappingEditorProps) {
  const { updateEdgeMappings, currentWorkflow } = useWorkflowStore();
  const [mappings, setMappings] = useState<ParameterMapping[]>(
    edge?.mappings || []
  );

  if (!edge || !currentWorkflow) return null;

  const sourceNode = currentWorkflow.nodes.find((n) => n.id === edge.source);
  const targetNode = currentWorkflow.nodes.find((n) => n.id === edge.target);

  const handleAddMapping = () => {
    const newMapping: ParameterMapping = {
      id: crypto.randomUUID(),
      sourceJsonPath: '$.data',
      targetField: '',
      targetType: 'header',
    };
    setMappings([...mappings, newMapping]);
  };

  const handleUpdateMapping = (
    id: string,
    updates: Partial<ParameterMapping>
  ) => {
    setMappings(
      mappings.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );
  };

  const handleRemoveMapping = (id: string) => {
    setMappings(mappings.filter((m) => m.id !== id));
  };

  const handleSave = () => {
    updateEdgeMappings(edge.id, mappings);
    onClose();
  };

  return (
    <Dialog open={!!edge} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Parameter Mappings
            <span className="text-sm font-normal text-muted-foreground">
              {sourceNode?.request.name}
              <ArrowRight className="h-4 w-4 inline mx-1" />
              {targetNode?.request.name}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Map values from the source response to the target request.
            Use JSONPath syntax (e.g., $.data.token) to extract values.
          </div>

          {mappings.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No mappings yet. Add a mapping to pass data between requests.
            </p>
          ) : (
            <div className="space-y-3">
              {mappings.map((mapping) => (
                <div
                  key={mapping.id}
                  className="flex items-center gap-2 p-3 border rounded-lg"
                >
                  <div className="flex-1 space-y-2">
                    <div>
                      <label className="text-xs text-muted-foreground">
                        Source JSONPath
                      </label>
                      <Input
                        value={mapping.sourceJsonPath}
                        onChange={(e) =>
                          handleUpdateMapping(mapping.id, {
                            sourceJsonPath: e.target.value,
                          })
                        }
                        placeholder="$.data.token"
                        className="h-8 text-sm font-mono"
                      />
                    </div>

                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="text-xs text-muted-foreground">
                          Target Type
                        </label>
                        <Select
                          value={mapping.targetType}
                          onValueChange={(value) =>
                            handleUpdateMapping(mapping.id, {
                              targetType: value as ParameterMapping['targetType'],
                            })
                          }
                        >
                          <SelectTrigger className="h-8 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="header">Header</SelectItem>
                            <SelectItem value="param">Query Param</SelectItem>
                            <SelectItem value="url">URL (template)</SelectItem>
                            <SelectItem value="body">Body (template)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex-1">
                        <label className="text-xs text-muted-foreground">
                          Target Field
                        </label>
                        <Input
                          value={mapping.targetField}
                          onChange={(e) =>
                            handleUpdateMapping(mapping.id, {
                              targetField: e.target.value,
                            })
                          }
                          placeholder={
                            mapping.targetType === 'header'
                              ? 'Authorization'
                              : mapping.targetType === 'param'
                              ? 'userId'
                              : 'variableName'
                          }
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => handleRemoveMapping(mapping.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <Button variant="outline" onClick={handleAddMapping} className="w-full">
            <Plus className="h-4 w-4 mr-1" />
            Add Mapping
          </Button>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Mappings</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
