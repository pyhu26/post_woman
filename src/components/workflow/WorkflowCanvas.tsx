import { useCallback, useMemo, useEffect } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type Edge,
  type Node,
  type EdgeMouseHandler,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useWorkflowStore } from '@/stores/workflowStore';
import { RequestNode } from './RequestNode';
import type { WorkflowEdge } from '@/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const nodeTypes: Record<string, any> = {
  request: RequestNode,
};

interface WorkflowCanvasProps {
  onEdgeClick?: (edge: WorkflowEdge) => void;
}

export function WorkflowCanvas({ onEdgeClick }: WorkflowCanvasProps) {
  const {
    currentWorkflow,
    updateNodePosition,
    addEdge: addWorkflowEdge,
    removeEdge,
    removeNode,
    executionResults,
    currentNodeId,
  } = useWorkflowStore();

  // Handler for node deletion
  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      removeNode(nodeId);
    },
    [removeNode]
  );

  // Convert workflow nodes to ReactFlow nodes
  const initialNodes = useMemo(() => {
    if (!currentWorkflow) return [];

    return currentWorkflow.nodes.map((node) => {
      const result = executionResults.find((r) => r.nodeId === node.id);
      return {
        id: node.id,
        type: 'request',
        position: node.position,
        data: {
          request: node.request,
          isRunning: currentNodeId === node.id,
          status: result?.status,
          onDelete: handleDeleteNode,
        },
      };
    });
  }, [currentWorkflow, executionResults, currentNodeId, handleDeleteNode]);

  // Convert workflow edges to ReactFlow edges
  const initialEdges: Edge[] = useMemo(() => {
    if (!currentWorkflow) return [];

    return currentWorkflow.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      animated: currentNodeId === edge.target,
      style: { strokeWidth: 2, cursor: 'pointer' },
      label: edge.mappings.length > 0 ? `${edge.mappings.length} mapping${edge.mappings.length > 1 ? 's' : ''} (click to edit)` : 'Click to add mapping',
      labelStyle: { fontSize: 10, cursor: 'pointer' },
      labelBgStyle: { fill: 'white', cursor: 'pointer' },
      labelBgPadding: [4, 2] as [number, number],
      labelBgBorderRadius: 4,
    }));
  }, [currentWorkflow, currentNodeId]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Sync with store when workflow changes
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  const onConnect = useCallback(
    (connection: Connection) => {
      if (connection.source && connection.target) {
        addWorkflowEdge(connection.source, connection.target);
        setEdges((eds) => addEdge(connection, eds));
      }
    },
    [addWorkflowEdge, setEdges]
  );

  const onNodeDragStop = useCallback(
    (_: React.MouseEvent, node: Node) => {
      updateNodePosition(node.id, node.position);
    },
    [updateNodePosition]
  );

  const onEdgesDelete = useCallback(
    (deletedEdges: Edge[]) => {
      deletedEdges.forEach((edge) => removeEdge(edge.id));
    },
    [removeEdge]
  );

  const onNodesDelete = useCallback(
    (deletedNodes: Node[]) => {
      deletedNodes.forEach((node) => removeNode(node.id));
    },
    [removeNode]
  );

  // Handle edge click to open mapping editor
  const handleEdgeClick: EdgeMouseHandler = useCallback(
    (_, edge) => {
      if (!currentWorkflow || !onEdgeClick) return;
      const workflowEdge = currentWorkflow.edges.find((e) => e.id === edge.id);
      if (workflowEdge) {
        onEdgeClick(workflowEdge);
      }
    },
    [currentWorkflow, onEdgeClick]
  );

  if (!currentWorkflow) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <p>Select a workflow or create a new one</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        onEdgesDelete={onEdgesDelete}
        onNodesDelete={onNodesDelete}
        onEdgeClick={handleEdgeClick}
        nodeTypes={nodeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{
          type: 'smoothstep',
        }}
      >
        <Controls />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}
