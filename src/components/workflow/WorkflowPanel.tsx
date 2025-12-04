import { useState } from 'react';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { useWorkflowStore } from '@/stores/workflowStore';
import { WorkflowHeader } from './WorkflowHeader';
import { WorkflowToolbar } from './WorkflowToolbar';
import { WorkflowCanvas } from './WorkflowCanvas';
import { WorkflowResults } from './WorkflowResults';
import { MappingEditor } from './MappingEditor';
import type { WorkflowEdge } from '@/types';

export function WorkflowPanel() {
  const { currentWorkflow } = useWorkflowStore();
  const [selectedEdge, setSelectedEdge] = useState<WorkflowEdge | null>(null);

  if (!currentWorkflow) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <p>Select a workflow or create a new one</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <WorkflowHeader />
      <WorkflowToolbar />
      <ResizablePanelGroup direction="vertical" className="flex-1">
        <ResizablePanel defaultSize={60} minSize={30}>
          <WorkflowCanvas onEdgeClick={setSelectedEdge} />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={40} minSize={20}>
          <WorkflowResults />
        </ResizablePanel>
      </ResizablePanelGroup>

      <MappingEditor
        edge={selectedEdge}
        onClose={() => setSelectedEdge(null)}
      />
    </div>
  );
}
