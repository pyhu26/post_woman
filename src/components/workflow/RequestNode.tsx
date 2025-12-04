import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { Request, HttpMethod } from '@/types';
import { cn } from '@/lib/utils';

const METHOD_COLORS: Record<HttpMethod, string> = {
  GET: 'bg-green-100 text-green-700 border-green-300',
  POST: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  PUT: 'bg-blue-100 text-blue-700 border-blue-300',
  DELETE: 'bg-red-100 text-red-700 border-red-300',
  PATCH: 'bg-purple-100 text-purple-700 border-purple-300',
};

interface RequestNodeProps {
  data: {
    request: Request;
    isRunning?: boolean;
    status?: 'pending' | 'running' | 'success' | 'error';
  };
  selected?: boolean;
}

function RequestNodeComponent({ data, selected }: RequestNodeProps) {
  const { request, isRunning, status } = data;

  const getStatusBorder = () => {
    if (isRunning) return 'ring-2 ring-primary animate-pulse';
    switch (status) {
      case 'success':
        return 'ring-2 ring-green-500';
      case 'error':
        return 'ring-2 ring-red-500';
      default:
        return '';
    }
  };

  return (
    <div
      className={cn(
        'px-4 py-3 shadow-md rounded-lg bg-white border-2 min-w-[180px]',
        selected ? 'border-primary' : 'border-gray-200',
        getStatusBorder()
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-gray-400"
      />

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'px-2 py-0.5 rounded text-xs font-mono font-bold border',
              METHOD_COLORS[request.method]
            )}
          >
            {request.method}
          </span>
          <span className="text-sm font-medium truncate max-w-[120px]">
            {request.name}
          </span>
        </div>

        <div className="text-xs text-muted-foreground font-mono truncate max-w-[200px]">
          {request.url || 'No URL'}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-primary"
      />
    </div>
  );
}

export const RequestNode = memo(RequestNodeComponent);
