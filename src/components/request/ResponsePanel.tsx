import { useRequestStore } from '@/stores/requestStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import Editor from '@monaco-editor/react';
import { cn } from '@/lib/utils';
import { Loader2, Copy, Check } from 'lucide-react';
import { useState } from 'react';

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function ResponsePanel() {
  const { response, isLoading } = useRequestStore();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (response?.body) {
      await navigator.clipboard.writeText(response.body);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Sending request...</span>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
        <p className="text-sm">Send a request to see the response</p>
        <p className="text-xs">Click Send or press Enter in the URL field</p>
      </div>
    );
  }

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-green-600 bg-green-50';
    if (status >= 300 && status < 400) return 'text-yellow-600 bg-yellow-50';
    if (status >= 400 && status < 500) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const bodySize = new Blob([response.body]).size;

  return (
    <div className="h-full flex flex-col">
      <div className="px-3 py-2 border-b flex items-center gap-3 text-sm">
        <span className="font-medium">Response</span>
        <span
          className={cn(
            'font-mono px-2 py-0.5 rounded text-xs font-semibold',
            getStatusColor(response.status)
          )}
        >
          {response.status} {response.statusText}
        </span>
        <span className="text-muted-foreground text-xs">{response.time}ms</span>
        <span className="text-muted-foreground text-xs">{formatBytes(bodySize)}</span>
        <div className="flex-1" />
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2"
          onClick={handleCopy}
        >
          {copied ? (
            <Check className="h-3 w-3 text-green-600" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
          <span className="ml-1 text-xs">{copied ? 'Copied!' : 'Copy'}</span>
        </Button>
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
            <div className="p-3">
              <table className="w-full text-sm">
                <tbody>
                  {Object.entries(response.headers).map(([key, value]) => (
                    <tr key={key} className="border-b last:border-0">
                      <td className="py-1.5 pr-4 font-mono text-muted-foreground whitespace-nowrap align-top">
                        {key}
                      </td>
                      <td className="py-1.5 font-mono break-all">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
