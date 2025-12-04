import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { Sidebar } from '@/components/tree/Sidebar';
import { RequestPanel } from '@/components/request/RequestPanel';

export function MainLayout() {
  return (
    <div className="h-screen w-screen">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={20} minSize={15} maxSize={40}>
          <Sidebar />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={80}>
          <RequestPanel />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
