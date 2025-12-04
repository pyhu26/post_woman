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
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useWorkflowStore } from '@/stores/workflowStore';
import { RequestNode } from './RequestNode';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const nodeTypes: Record<string, any> = {
  request: RequestNode,
};

export function WorkflowCanvas() {
  const {
    currentWorkflow,
    updateNodePosition,
    addEdge: addWorkflowEdge,
    removeEdge,
    removeNode,
    executionResults,
    currentNodeId,
  } = useWorkflowStore();

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
        },
      };
    });
  }, [currentWorkflow, executionResults, currentNodeId]);

  // Convert workflow edges to ReactFlow edges
  const initialEdges: Edge[] = useMemo(() => {
    if (!currentWorkflow) return [];

    return currentWorkflow.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      animated: currentNodeId === edge.target,
      style: { strokeWidth: 2 },
      label: edge.mappings.length > 0 ? `${edge.mappings.length} mappings` : undefined,
      labelStyle: { fontSize: 10 },
      labelBgStyle: { fill: 'white' },
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
