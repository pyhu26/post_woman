import { useState, useCallback } from 'react';
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

  const handleEdgeClick = useCallback(
    (edgeId: string) => {
      if (!currentWorkflow) return;
      const edge = currentWorkflow.edges.find((e) => e.id === edgeId);
      if (edge) setSelectedEdge(edge);
    },
    [currentWorkflow]
  );

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
          <WorkflowCanvasWithEdgeClick onEdgeClick={handleEdgeClick} />
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

// Wrapper component to handle edge clicks
function WorkflowCanvasWithEdgeClick({
  onEdgeClick,
}: {
  onEdgeClick: (edgeId: string) => void;
}) {
  return (
    <div
      className="h-full w-full"
      onClick={(e) => {
        // Check if clicked on an edge label
        const target = e.target as HTMLElement;
        const edgeLabel = target.closest('.react-flow__edge-textwrapper');
        if (edgeLabel) {
          const edge = edgeLabel.closest('.react-flow__edge');
          if (edge) {
            const edgeId = edge.getAttribute('data-id');
            if (edgeId) onEdgeClick(edgeId);
          }
        }
      }}
    >
      <WorkflowCanvas />
    </div>
  );
}
