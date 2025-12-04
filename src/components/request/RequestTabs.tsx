import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { KeyValueEditor } from './KeyValueEditor';
import { BodyEditor } from './BodyEditor';
import { useRequestStore } from '@/stores/requestStore';

export function RequestTabs() {
  const { currentRequest, updateCurrentRequest } = useRequestStore();

  if (!currentRequest) return null;

  return (
    <Tabs defaultValue="params" className="h-full flex flex-col">
      <TabsList className="mx-3 mt-2 w-fit">
        <TabsTrigger value="params">
          Params
          {currentRequest.params.length > 0 && (
            <span className="ml-1 text-xs text-muted-foreground">
              ({currentRequest.params.filter((p) => p.enabled).length})
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="headers">
          Headers
          {currentRequest.headers.length > 0 && (
            <span className="ml-1 text-xs text-muted-foreground">
              ({currentRequest.headers.filter((h) => h.enabled).length})
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="body">Body</TabsTrigger>
      </TabsList>

      <TabsContent value="params" className="flex-1 m-0 overflow-auto">
        <KeyValueEditor
          items={currentRequest.params}
          onChange={(params) => updateCurrentRequest({ params })}
          placeholder={{ key: 'Parameter', value: 'Value' }}
        />
      </TabsContent>

      <TabsContent value="headers" className="flex-1 m-0 overflow-auto">
        <KeyValueEditor
          items={currentRequest.headers}
          onChange={(headers) => updateCurrentRequest({ headers })}
          placeholder={{ key: 'Header', value: 'Value' }}
        />
      </TabsContent>

      <TabsContent value="body" className="flex-1 m-0 overflow-hidden">
        <BodyEditor
          value={currentRequest.body}
          onChange={(body) => updateCurrentRequest({ body })}
        />
      </TabsContent>
    </Tabs>
  );
}
