import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRequestStore } from '@/stores/requestStore';
import { sendRequest } from '@/utils/http';
import type { HttpMethod } from '@/types';
import { Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

const METHOD_COLORS: Record<HttpMethod, string> = {
  GET: 'text-green-600',
  POST: 'text-yellow-600',
  PUT: 'text-blue-600',
  DELETE: 'text-red-600',
  PATCH: 'text-purple-600',
};

export function RequestBar() {
  const {
    currentRequest,
    updateCurrentRequest,
    setResponse,
    isLoading,
    setIsLoading,
  } = useRequestStore();

  if (!currentRequest) return null;

  const handleSend = async () => {
    if (!currentRequest.url) return;

    setIsLoading(true);
    setResponse(null);

    try {
      const response = await sendRequest(currentRequest);
      setResponse(response);
    } catch (error) {
      console.error('Request failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-3 border-b flex gap-2">
      <Select
        value={currentRequest.method}
        onValueChange={(value) =>
          updateCurrentRequest({ method: value as HttpMethod })
        }
      >
        <SelectTrigger className="w-28">
          <SelectValue>
            <span className={cn('font-mono', METHOD_COLORS[currentRequest.method])}>
              {currentRequest.method}
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {METHODS.map((method) => (
            <SelectItem key={method} value={method}>
              <span className={cn('font-mono', METHOD_COLORS[method])}>
                {method}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        placeholder="Enter URL"
        value={currentRequest.url}
        onChange={(e) => updateCurrentRequest({ url: e.target.value })}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSend();
        }}
        className="flex-1 font-mono text-sm"
      />

      <Button onClick={handleSend} disabled={isLoading || !currentRequest.url}>
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        <span className="ml-2">Send</span>
      </Button>
    </div>
  );
}
