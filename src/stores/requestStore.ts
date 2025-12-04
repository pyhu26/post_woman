import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Collection, Request, Folder, HttpMethod, RequestResponse } from '@/types';

interface RequestState {
  // Collections
  collections: Collection[];
  activeCollectionId: string | null;

  // Current request
  currentRequest: Request | null;

  // Response
  response: RequestResponse | null;
  isLoading: boolean;

  // Actions - Collections
  addCollection: (name: string) => void;
  updateCollection: (id: string, name: string) => void;
  deleteCollection: (id: string) => void;

  // Actions - Folders
  addFolder: (collectionId: string, parentId: string | null, name: string) => void;
  updateFolder: (collectionId: string, folderId: string, name: string) => void;
  deleteFolder: (collectionId: string, folderId: string) => void;

  // Actions - Requests
  addRequest: (collectionId: string, folderId: string | null, request: Omit<Request, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateRequest: (collectionId: string, folderId: string | null, request: Request) => void;
  deleteRequest: (collectionId: string, folderId: string | null, requestId: string) => void;

  // Actions - Current Request
  setCurrentRequest: (request: Request | null) => void;
  updateCurrentRequest: (updates: Partial<Request>) => void;

  // Actions - Response
  setResponse: (response: RequestResponse | null) => void;
  setIsLoading: (isLoading: boolean) => void;
}

const generateId = () => crypto.randomUUID();

const createDefaultRequest = (): Request => ({
  id: generateId(),
  name: 'New Request',
  method: 'GET' as HttpMethod,
  url: '',
  headers: [],
  params: [],
  body: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export const useRequestStore = create<RequestState>()(
  persist(
    (set) => ({
      collections: [],
      activeCollectionId: null,
      currentRequest: createDefaultRequest(),
      response: null,
      isLoading: false,

      // Collections
      addCollection: (name) => {
        const newCollection: Collection = {
          id: generateId(),
          name,
          folders: [],
          requests: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          collections: [...state.collections, newCollection],
        }));
      },

      updateCollection: (id, name) => {
        set((state) => ({
          collections: state.collections.map((c) =>
            c.id === id ? { ...c, name, updatedAt: new Date().toISOString() } : c
          ),
        }));
      },

      deleteCollection: (id) => {
        set((state) => ({
          collections: state.collections.filter((c) => c.id !== id),
        }));
      },

      // Folders
      addFolder: (collectionId, parentId, name) => {
        const newFolder: Folder = {
          id: generateId(),
          name,
          parentId,
          requests: [],
          folders: [],
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          collections: state.collections.map((c) => {
            if (c.id !== collectionId) return c;

            if (!parentId) {
              return { ...c, folders: [...c.folders, newFolder] };
            }

            const addToFolder = (folders: Folder[]): Folder[] =>
              folders.map((f) => {
                if (f.id === parentId) {
                  return { ...f, folders: [...f.folders, newFolder] };
                }
                return { ...f, folders: addToFolder(f.folders) };
              });

            return { ...c, folders: addToFolder(c.folders) };
          }),
        }));
      },

      updateFolder: (collectionId, folderId, name) => {
        set((state) => ({
          collections: state.collections.map((c) => {
            if (c.id !== collectionId) return c;

            const updateInFolders = (folders: Folder[]): Folder[] =>
              folders.map((f) => {
                if (f.id === folderId) {
                  return { ...f, name };
                }
                return { ...f, folders: updateInFolders(f.folders) };
              });

            return { ...c, folders: updateInFolders(c.folders) };
          }),
        }));
      },

      deleteFolder: (collectionId, folderId) => {
        set((state) => ({
          collections: state.collections.map((c) => {
            if (c.id !== collectionId) return c;

            const removeFromFolders = (folders: Folder[]): Folder[] =>
              folders
                .filter((f) => f.id !== folderId)
                .map((f) => ({ ...f, folders: removeFromFolders(f.folders) }));

            return { ...c, folders: removeFromFolders(c.folders) };
          }),
        }));
      },

      // Requests
      addRequest: (collectionId, folderId, request) => {
        const newRequest: Request = {
          ...request,
          id: generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          collections: state.collections.map((c) => {
            if (c.id !== collectionId) return c;

            if (!folderId) {
              return { ...c, requests: [...c.requests, newRequest] };
            }

            const addToFolder = (folders: Folder[]): Folder[] =>
              folders.map((f) => {
                if (f.id === folderId) {
                  return { ...f, requests: [...f.requests, newRequest] };
                }
                return { ...f, folders: addToFolder(f.folders) };
              });

            return { ...c, folders: addToFolder(c.folders) };
          }),
        }));
      },

      updateRequest: (collectionId, folderId, request) => {
        const updatedRequest = { ...request, updatedAt: new Date().toISOString() };

        set((state) => ({
          collections: state.collections.map((c) => {
            if (c.id !== collectionId) return c;

            if (!folderId) {
              return {
                ...c,
                requests: c.requests.map((r) =>
                  r.id === request.id ? updatedRequest : r
                ),
              };
            }

            const updateInFolder = (folders: Folder[]): Folder[] =>
              folders.map((f) => {
                if (f.id === folderId) {
                  return {
                    ...f,
                    requests: f.requests.map((r) =>
                      r.id === request.id ? updatedRequest : r
                    ),
                  };
                }
                return { ...f, folders: updateInFolder(f.folders) };
              });

            return { ...c, folders: updateInFolder(c.folders) };
          }),
        }));
      },

      deleteRequest: (collectionId, folderId, requestId) => {
        set((state) => ({
          collections: state.collections.map((c) => {
            if (c.id !== collectionId) return c;

            if (!folderId) {
              return {
                ...c,
                requests: c.requests.filter((r) => r.id !== requestId),
              };
            }

            const removeFromFolder = (folders: Folder[]): Folder[] =>
              folders.map((f) => {
                if (f.id === folderId) {
                  return {
                    ...f,
                    requests: f.requests.filter((r) => r.id !== requestId),
                  };
                }
                return { ...f, folders: removeFromFolder(f.folders) };
              });

            return { ...c, folders: removeFromFolder(c.folders) };
          }),
        }));
      },

      // Current Request
      setCurrentRequest: (request) => {
        set({ currentRequest: request, response: null });
      },

      updateCurrentRequest: (updates) => {
        set((state) => ({
          currentRequest: state.currentRequest
            ? { ...state.currentRequest, ...updates }
            : null,
        }));
      },

      // Response
      setResponse: (response) => set({ response }),
      setIsLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'post-woman-storage',
      partialize: (state) => ({
        collections: state.collections,
      }),
    }
  )
);
