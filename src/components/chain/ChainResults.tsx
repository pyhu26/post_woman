import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useChainStore } from '@/stores/chainStore';
import { cn } from '@/lib/utils';
import {
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  ChevronDown,
  ChevronRight,
  Trash2,
} from 'lucide-react';
import type { ChainStepResult } from '@/types';

export function ChainResults() {
  const { executionResults, isExecuting, clearResults } = useChainStore();

  if (executionResults.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
        <p className="text-sm">Run the chain to see results</p>
        <p className="text-xs">Each step will be executed sequentially</p>
      </div>
    );
  }

  const successCount = executionResults.filter((r) => r.status === 'success').length;
  const errorCount = executionResults.filter((r) => r.status === 'error').length;
  const totalTime = executionResults.reduce(
    (acc, r) => acc + (r.response?.time || 0),
    0
  );

  return (
    <div className="h-full flex flex-col">
      <div className="px-3 py-2 border-b flex items-center gap-4 text-sm">
        <span className="font-medium">Results</span>
        {isExecuting ? (
          <span className="flex items-center gap-1 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Running...
          </span>
        ) : (
          <>
            <span className="flex items-center gap-1 text-green-600">
              <CheckCircle className="h-4 w-4" />
              {successCount}
            </span>
            {errorCount > 0 && (
              <span className="flex items-center gap-1 text-red-600">
                <XCircle className="h-4 w-4" />
                {errorCount}
              </span>
            )}
            <span className="text-muted-foreground text-xs">{totalTime}ms total</span>
          </>
        )}
        <div className="flex-1" />
        <Button
          variant="ghost"
          size="sm"
          onClick={clearResults}
          disabled={isExecuting}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Clear
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {executionResults.map((result, index) => (
            <ResultItem key={result.stepId} result={result} index={index} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

interface ResultItemProps {
  result: ChainStepResult;
  index: number;
}

function ResultItem({ result, index }: ResultItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusIcon = () => {
    switch (result.status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-muted-foreground" />;
      case 'running':
        return <Loader2 className="h-4 w-4 text-primary animate-spin" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
    }
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-green-600 bg-green-50';
    if (status >= 300 && status < 400) return 'text-yellow-600 bg-yellow-50';
    if (status >= 400 && status < 500) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div
      className={cn(
        'border rounded-lg overflow-hidden',
        result.status === 'running' && 'ring-2 ring-primary'
      )}
    >
      <div
        className={cn(
          'flex items-center gap-2 p-2 cursor-pointer hover:bg-muted/30',
          result.status === 'error' && 'bg-red-50/50'
        )}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
        {getStatusIcon()}
        <span className="text-xs font-medium text-muted-foreground w-6">
          #{index + 1}
        </span>
        <span className="text-sm truncate flex-1">{result.request.name}</span>

        {result.response && (
          <>
            <span
              className={cn(
                'font-mono px-2 py-0.5 rounded text-xs font-semibold',
                getStatusColor(result.response.status)
              )}
            >
              {result.response.status}
            </span>
            <span className="text-xs text-muted-foreground">
              {result.response.time}ms
            </span>
          </>
        )}

        {result.error && (
          <span className="text-xs text-red-600 truncate max-w-32">
            {result.error}
          </span>
        )}
      </div>

      {isExpanded && result.response && (
        <div className="border-t">
          <Tabs defaultValue="body" className="w-full">
            <TabsList className="mx-2 mt-2 w-fit">
              <TabsTrigger value="body" className="text-xs">
                Body
              </TabsTrigger>
              <TabsTrigger value="headers" className="text-xs">
                Headers ({Object.keys(result.response.headers).length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="body" className="m-0 p-2">
              <pre className="text-xs font-mono bg-muted/50 p-2 rounded overflow-auto max-h-48">
                {result.response.body || '(empty)'}
              </pre>
            </TabsContent>

            <TabsContent value="headers" className="m-0 p-2">
              <div className="text-xs font-mono space-y-1 max-h-48 overflow-auto">
                {Object.entries(result.response.headers).map(([key, value]) => (
                  <div key={key}>
                    <span className="text-muted-foreground">{key}: </span>
                    <span>{value}</span>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {isExpanded && result.error && !result.response && (
        <div className="border-t p-2">
          <p className="text-sm text-red-600">{result.error}</p>
        </div>
      )}
    </div>
  );
}
