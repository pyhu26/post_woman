import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Workflow,
  WorkflowNode,
  WorkflowEdge,
  WorkflowNodeResult,
  Request,
  ParameterMapping,
} from '@/types';
import { sendRequest } from '@/utils/http';
import { JSONPath } from 'jsonpath-plus';

interface WorkflowState {
  // Workflows
  workflows: Workflow[];
  currentWorkflow: Workflow | null;

  // Execution
  isExecuting: boolean;
  executionResults: WorkflowNodeResult[];
  currentNodeId: string | null;

  // Actions - Workflows
  createWorkflow: (name: string) => void;
  updateWorkflow: (id: string, updates: Partial<Workflow>) => void;
  deleteWorkflow: (id: string) => void;
  setCurrentWorkflow: (workflow: Workflow | null) => void;

  // Actions - Nodes
  addNode: (request: Request, position: { x: number; y: number }) => void;
  updateNode: (nodeId: string, updates: Partial<WorkflowNode>) => void;
  removeNode: (nodeId: string) => void;
  updateNodePosition: (nodeId: string, position: { x: number; y: number }) => void;

  // Actions - Edges
  addEdge: (source: string, target: string) => void;
  removeEdge: (edgeId: string) => void;
  updateEdgeMappings: (edgeId: string, mappings: ParameterMapping[]) => void;

  // Actions - Execution
  executeWorkflow: () => Promise<void>;
  stopExecution: () => void;
  clearResults: () => void;
}

const generateId = () => crypto.randomUUID();

// Topological sort to determine execution order
function getExecutionOrder(nodes: WorkflowNode[], edges: WorkflowEdge[]): string[] {
  const inDegree = new Map<string, number>();
  const adjacency = new Map<string, string[]>();

  // Initialize
  nodes.forEach((node) => {
    inDegree.set(node.id, 0);
    adjacency.set(node.id, []);
  });

  // Build graph
  edges.forEach((edge) => {
    adjacency.get(edge.source)?.push(edge.target);
    inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
  });

  // Find nodes with no incoming edges
  const queue: string[] = [];
  inDegree.forEach((degree, nodeId) => {
    if (degree === 0) queue.push(nodeId);
  });

  const result: string[] = [];
  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    result.push(nodeId);

    adjacency.get(nodeId)?.forEach((targetId) => {
      const newDegree = (inDegree.get(targetId) || 0) - 1;
      inDegree.set(targetId, newDegree);
      if (newDegree === 0) queue.push(targetId);
    });
  }

  return result;
}

// Apply parameter mappings to a request
function applyMappings(
  request: Request,
  mappings: ParameterMapping[],
  sourceResponse: string
): Request {
  let updatedRequest = { ...request };
  let parsedResponse: object;

  try {
    parsedResponse = JSON.parse(sourceResponse) as object;
  } catch {
    return updatedRequest;
  }

  mappings.forEach((mapping) => {
    try {
      const values = JSONPath({ path: mapping.sourceJsonPath, json: parsedResponse }) as unknown[];
      const value = values && values.length > 0 ? String(values[0]) : '';

      switch (mapping.targetType) {
        case 'header':
          updatedRequest = {
            ...updatedRequest,
            headers: updatedRequest.headers.map((h) =>
              h.key === mapping.targetField ? { ...h, value } : h
            ),
          };
          // Add if not exists
          if (!updatedRequest.headers.some((h) => h.key === mapping.targetField)) {
            updatedRequest.headers = [
              ...updatedRequest.headers,
              { id: generateId(), key: mapping.targetField, value, enabled: true },
            ];
          }
          break;

        case 'param':
          updatedRequest = {
            ...updatedRequest,
            params: updatedRequest.params.map((p) =>
              p.key === mapping.targetField ? { ...p, value } : p
            ),
          };
          if (!updatedRequest.params.some((p) => p.key === mapping.targetField)) {
            updatedRequest.params = [
              ...updatedRequest.params,
              { id: generateId(), key: mapping.targetField, value, enabled: true },
            ];
          }
          break;

        case 'url':
          updatedRequest = {
            ...updatedRequest,
            url: updatedRequest.url.replace(`{{${mapping.targetField}}}`, value),
          };
          break;

        case 'body':
          updatedRequest = {
            ...updatedRequest,
            body: updatedRequest.body.replace(`{{${mapping.targetField}}}`, value),
          };
          break;
      }
    } catch {
      // Skip invalid mappings
    }
  });

  return updatedRequest;
}

export const useWorkflowStore = create<WorkflowState>()(
  persist(
    (set, get) => ({
      workflows: [],
      currentWorkflow: null,
      isExecuting: false,
      executionResults: [],
      currentNodeId: null,

      // Workflows
      createWorkflow: (name) => {
        const newWorkflow: Workflow = {
          id: generateId(),
          name,
          nodes: [],
          edges: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          workflows: [...state.workflows, newWorkflow],
          currentWorkflow: newWorkflow,
        }));
      },

      updateWorkflow: (id, updates) => {
        set((state) => ({
          workflows: state.workflows.map((w) =>
            w.id === id ? { ...w, ...updates, updatedAt: new Date().toISOString() } : w
          ),
          currentWorkflow:
            state.currentWorkflow?.id === id
              ? { ...state.currentWorkflow, ...updates, updatedAt: new Date().toISOString() }
              : state.currentWorkflow,
        }));
      },

      deleteWorkflow: (id) => {
        set((state) => ({
          workflows: state.workflows.filter((w) => w.id !== id),
          currentWorkflow: state.currentWorkflow?.id === id ? null : state.currentWorkflow,
        }));
      },

      setCurrentWorkflow: (workflow) => {
        set({ currentWorkflow: workflow, executionResults: [], currentNodeId: null });
      },

      // Nodes
      addNode: (request, position) => {
        const { currentWorkflow } = get();
        if (!currentWorkflow) return;

        const newNode: WorkflowNode = {
          id: generateId(),
          type: 'request',
          request: { ...request, id: generateId() },
          position,
        };

        const updatedWorkflow = {
          ...currentWorkflow,
          nodes: [...currentWorkflow.nodes, newNode],
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          workflows: state.workflows.map((w) =>
            w.id === currentWorkflow.id ? updatedWorkflow : w
          ),
          currentWorkflow: updatedWorkflow,
        }));
      },

      updateNode: (nodeId, updates) => {
        const { currentWorkflow } = get();
        if (!currentWorkflow) return;

        const updatedWorkflow = {
          ...currentWorkflow,
          nodes: currentWorkflow.nodes.map((n) =>
            n.id === nodeId ? { ...n, ...updates } : n
          ),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          workflows: state.workflows.map((w) =>
            w.id === currentWorkflow.id ? updatedWorkflow : w
          ),
          currentWorkflow: updatedWorkflow,
        }));
      },

      removeNode: (nodeId) => {
        const { currentWorkflow } = get();
        if (!currentWorkflow) return;

        const updatedWorkflow = {
          ...currentWorkflow,
          nodes: currentWorkflow.nodes.filter((n) => n.id !== nodeId),
          edges: currentWorkflow.edges.filter(
            (e) => e.source !== nodeId && e.target !== nodeId
          ),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          workflows: state.workflows.map((w) =>
            w.id === currentWorkflow.id ? updatedWorkflow : w
          ),
          currentWorkflow: updatedWorkflow,
        }));
      },

      updateNodePosition: (nodeId, position) => {
        const { currentWorkflow } = get();
        if (!currentWorkflow) return;

        const updatedWorkflow = {
          ...currentWorkflow,
          nodes: currentWorkflow.nodes.map((n) =>
            n.id === nodeId ? { ...n, position } : n
          ),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          workflows: state.workflows.map((w) =>
            w.id === currentWorkflow.id ? updatedWorkflow : w
          ),
          currentWorkflow: updatedWorkflow,
        }));
      },

      // Edges
      addEdge: (source, target) => {
        const { currentWorkflow } = get();
        if (!currentWorkflow) return;

        // Prevent duplicate edges
        if (currentWorkflow.edges.some((e) => e.source === source && e.target === target)) {
          return;
        }

        const newEdge: WorkflowEdge = {
          id: generateId(),
          source,
          target,
          mappings: [],
        };

        const updatedWorkflow = {
          ...currentWorkflow,
          edges: [...currentWorkflow.edges, newEdge],
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          workflows: state.workflows.map((w) =>
            w.id === currentWorkflow.id ? updatedWorkflow : w
          ),
          currentWorkflow: updatedWorkflow,
        }));
      },

      removeEdge: (edgeId) => {
        const { currentWorkflow } = get();
        if (!currentWorkflow) return;

        const updatedWorkflow = {
          ...currentWorkflow,
          edges: currentWorkflow.edges.filter((e) => e.id !== edgeId),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          workflows: state.workflows.map((w) =>
            w.id === currentWorkflow.id ? updatedWorkflow : w
          ),
          currentWorkflow: updatedWorkflow,
        }));
      },

      updateEdgeMappings: (edgeId, mappings) => {
        const { currentWorkflow } = get();
        if (!currentWorkflow) return;

        const updatedWorkflow = {
          ...currentWorkflow,
          edges: currentWorkflow.edges.map((e) =>
            e.id === edgeId ? { ...e, mappings } : e
          ),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          workflows: state.workflows.map((w) =>
            w.id === currentWorkflow.id ? updatedWorkflow : w
          ),
          currentWorkflow: updatedWorkflow,
        }));
      },

      // Execution
      executeWorkflow: async () => {
        const { currentWorkflow } = get();
        if (!currentWorkflow || currentWorkflow.nodes.length === 0) return;

        const executionOrder = getExecutionOrder(currentWorkflow.nodes, currentWorkflow.edges);

        // Initialize results
        const initialResults: WorkflowNodeResult[] = currentWorkflow.nodes.map((node) => ({
          nodeId: node.id,
          request: node.request,
          response: null,
          error: null,
          status: 'pending' as const,
        }));

        set({ isExecuting: true, executionResults: initialResults, currentNodeId: null });

        const responseMap = new Map<string, string>();

        for (const nodeId of executionOrder) {
          const { isExecuting } = get();
          if (!isExecuting) break;

          const node = currentWorkflow.nodes.find((n) => n.id === nodeId);
          if (!node) continue;

          // Update current node to running
          set((state) => ({
            currentNodeId: nodeId,
            executionResults: state.executionResults.map((r) =>
              r.nodeId === nodeId ? { ...r, status: 'running' as const } : r
            ),
          }));

          // Get incoming edges and apply mappings
          let request = { ...node.request };
          const incomingEdges = currentWorkflow.edges.filter((e) => e.target === nodeId);

          for (const edge of incomingEdges) {
            const sourceResponse = responseMap.get(edge.source);
            if (sourceResponse && edge.mappings.length > 0) {
              request = applyMappings(request, edge.mappings, sourceResponse);
            }
          }

          try {
            const response = await sendRequest(request);
            responseMap.set(nodeId, response.body);

            set((state) => ({
              executionResults: state.executionResults.map((r) =>
                r.nodeId === nodeId
                  ? {
                      ...r,
                      request,
                      response,
                      status: response.status >= 200 && response.status < 400 ? 'success' : 'error',
                      error: response.status >= 400 ? `HTTP ${response.status}` : null,
                    }
                  : r
              ),
            }));

            if (response.status >= 400) {
              set({ isExecuting: false });
              break;
            }
          } catch (error) {
            set((state) => ({
              executionResults: state.executionResults.map((r) =>
                r.nodeId === nodeId
                  ? {
                      ...r,
                      request,
                      status: 'error' as const,
                      error: error instanceof Error ? error.message : 'Unknown error',
                    }
                  : r
              ),
              isExecuting: false,
            }));
            break;
          }
        }

        set({ isExecuting: false, currentNodeId: null });
      },

      stopExecution: () => {
        set({ isExecuting: false, currentNodeId: null });
      },

      clearResults: () => {
        set({ executionResults: [], currentNodeId: null });
      },
    }),
    {
      name: 'post-woman-workflows',
      partialize: (state) => ({
        workflows: state.workflows,
      }),
    }
  )
);
