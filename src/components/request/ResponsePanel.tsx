import { useRequestStore } from '@/stores/requestStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import Editor from '@monaco-editor/react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export function ResponsePanel() {
  const { response, isLoading } = useRequestStore();

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!response) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <p>Send a request to see the response</p>
      </div>
    );
  }

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-green-600';
    if (status >= 300 && status < 400) return 'text-yellow-600';
    if (status >= 400 && status < 500) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="h-full flex flex-col">
      <div className="px-3 py-2 border-b flex items-center gap-4 text-sm">
        <span className="font-medium">Response</span>
        <span className={cn('font-mono', getStatusColor(response.status))}>
          {response.status} {response.statusText}
        </span>
        <span className="text-muted-foreground">{response.time}ms</span>
      </div>

      <Tabs defaultValue="body" className="flex-1 flex flex-col">
        <TabsList className="mx-3 mt-2 w-fit">
          <TabsTrigger value="body">Body</TabsTrigger>
          <TabsTrigger value="headers">
            Headers ({Object.keys(response.headers).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="body" className="flex-1 m-0 overflow-hidden">
          <Editor
            height="100%"
            defaultLanguage="json"
            value={response.body}
            theme="vs-light"
            options={{
              readOnly: true,
              minimap: { enabled: false },
              fontSize: 13,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              wordWrap: 'on',
            }}
          />
        </TabsContent>

        <TabsContent value="headers" className="flex-1 m-0 overflow-auto">
          <ScrollArea className="h-full">
            <div className="p-3 space-y-1">
              {Object.entries(response.headers).map(([key, value]) => (
                <div key={key} className="flex gap-2 text-sm font-mono">
                  <span className="text-muted-foreground">{key}:</span>
                  <span className="break-all">{value}</span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
