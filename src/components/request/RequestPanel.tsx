import { useRequestStore } from '@/stores/requestStore';
import { RequestHeader } from './RequestHeader';
import { RequestBar } from './RequestBar';
import { RequestTabs } from './RequestTabs';
import { ResponsePanel } from './ResponsePanel';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';

export function RequestPanel() {
  const { currentRequest } = useRequestStore();

  if (!currentRequest) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <p>Select a request or create a new one</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <RequestHeader />
      <RequestBar />
      <ResizablePanelGroup direction="vertical" className="flex-1">
        <ResizablePanel defaultSize={50} minSize={20}>
          <RequestTabs />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={50} minSize={20}>
          <ResponsePanel />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
