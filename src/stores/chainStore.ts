import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { RequestChain, ChainStep, ChainStepResult, Request } from '@/types';
import { sendRequest } from '@/utils/http';

interface ChainState {
  // Chains
  chains: RequestChain[];
  currentChain: RequestChain | null;

  // Execution
  isExecuting: boolean;
  executionResults: ChainStepResult[];
  currentStepIndex: number;

  // Actions - Chains
  createChain: (name: string) => void;
  updateChain: (id: string, updates: Partial<RequestChain>) => void;
  deleteChain: (id: string) => void;
  setCurrentChain: (chain: RequestChain | null) => void;

  // Actions - Steps
  addStep: (request: Request) => void;
  updateStep: (stepId: string, request: Request) => void;
  removeStep: (stepId: string) => void;
  reorderSteps: (fromIndex: number, toIndex: number) => void;

  // Actions - Execution
  executeChain: () => Promise<void>;
  stopExecution: () => void;
  clearResults: () => void;
}

const generateId = () => crypto.randomUUID();

export const useChainStore = create<ChainState>()(
  persist(
    (set, get) => ({
      chains: [],
      currentChain: null,
      isExecuting: false,
      executionResults: [],
      currentStepIndex: -1,

      // Chains
      createChain: (name) => {
        const newChain: RequestChain = {
          id: generateId(),
          name,
          steps: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          chains: [...state.chains, newChain],
          currentChain: newChain,
        }));
      },

      updateChain: (id, updates) => {
        set((state) => ({
          chains: state.chains.map((c) =>
            c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
          ),
          currentChain:
            state.currentChain?.id === id
              ? { ...state.currentChain, ...updates, updatedAt: new Date().toISOString() }
              : state.currentChain,
        }));
      },

      deleteChain: (id) => {
        set((state) => ({
          chains: state.chains.filter((c) => c.id !== id),
          currentChain: state.currentChain?.id === id ? null : state.currentChain,
        }));
      },

      setCurrentChain: (chain) => {
        set({ currentChain: chain, executionResults: [], currentStepIndex: -1 });
      },

      // Steps
      addStep: (request) => {
        const { currentChain } = get();
        if (!currentChain) return;

        const newStep: ChainStep = {
          id: generateId(),
          request: { ...request, id: generateId() },
          order: currentChain.steps.length,
        };

        const updatedChain = {
          ...currentChain,
          steps: [...currentChain.steps, newStep],
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          chains: state.chains.map((c) => (c.id === currentChain.id ? updatedChain : c)),
          currentChain: updatedChain,
        }));
      },

      updateStep: (stepId, request) => {
        const { currentChain } = get();
        if (!currentChain) return;

        const updatedChain = {
          ...currentChain,
          steps: currentChain.steps.map((s) =>
            s.id === stepId ? { ...s, request: { ...request, updatedAt: new Date().toISOString() } } : s
          ),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          chains: state.chains.map((c) => (c.id === currentChain.id ? updatedChain : c)),
          currentChain: updatedChain,
        }));
      },

      removeStep: (stepId) => {
        const { currentChain } = get();
        if (!currentChain) return;

        const updatedSteps = currentChain.steps
          .filter((s) => s.id !== stepId)
          .map((s, index) => ({ ...s, order: index }));

        const updatedChain = {
          ...currentChain,
          steps: updatedSteps,
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          chains: state.chains.map((c) => (c.id === currentChain.id ? updatedChain : c)),
          currentChain: updatedChain,
        }));
      },

      reorderSteps: (fromIndex, toIndex) => {
        const { currentChain } = get();
        if (!currentChain) return;

        const steps = [...currentChain.steps];
        const [removed] = steps.splice(fromIndex, 1);
        steps.splice(toIndex, 0, removed);

        const reorderedSteps = steps.map((s, index) => ({ ...s, order: index }));

        const updatedChain = {
          ...currentChain,
          steps: reorderedSteps,
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          chains: state.chains.map((c) => (c.id === currentChain.id ? updatedChain : c)),
          currentChain: updatedChain,
        }));
      },

      // Execution
      executeChain: async () => {
        const { currentChain } = get();
        if (!currentChain || currentChain.steps.length === 0) return;

        // Initialize results
        const initialResults: ChainStepResult[] = currentChain.steps.map((step) => ({
          stepId: step.id,
          request: step.request,
          response: null,
          error: null,
          status: 'pending' as const,
        }));

        set({ isExecuting: true, executionResults: initialResults, currentStepIndex: 0 });

        // Execute steps sequentially
        for (let i = 0; i < currentChain.steps.length; i++) {
          const { isExecuting } = get();
          if (!isExecuting) break; // Stop if execution was cancelled

          const step = currentChain.steps[i];

          // Update current step to running
          set((state) => ({
            currentStepIndex: i,
            executionResults: state.executionResults.map((r, idx) =>
              idx === i ? { ...r, status: 'running' as const } : r
            ),
          }));

          try {
            const response = await sendRequest(step.request);

            // Update result
            set((state) => ({
              executionResults: state.executionResults.map((r, idx) =>
                idx === i
                  ? {
                      ...r,
                      response,
                      status: response.status >= 200 && response.status < 400 ? 'success' : 'error',
                      error: response.status >= 400 ? `HTTP ${response.status}` : null,
                    }
                  : r
              ),
            }));

            // If request failed with 4xx or 5xx, stop execution
            if (response.status >= 400) {
              set({ isExecuting: false });
              break;
            }
          } catch (error) {
            set((state) => ({
              executionResults: state.executionResults.map((r, idx) =>
                idx === i
                  ? {
                      ...r,
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

        set({ isExecuting: false, currentStepIndex: -1 });
      },

      stopExecution: () => {
        set({ isExecuting: false, currentStepIndex: -1 });
      },

      clearResults: () => {
        set({ executionResults: [], currentStepIndex: -1 });
      },
    }),
    {
      name: 'post-woman-chains',
      partialize: (state) => ({
        chains: state.chains,
      }),
    }
  )
);
