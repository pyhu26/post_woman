import { useState } from 'react';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sidebar } from '@/components/tree/Sidebar';
import { ChainSidebar } from '@/components/chain/ChainSidebar';
import { RequestPanel } from '@/components/request/RequestPanel';
import { ChainPanel } from '@/components/chain/ChainPanel';
import { FileJson, Link2 } from 'lucide-react';

type TabValue = 'request' | 'chain';

export function MainLayout() {
  const [activeTab, setActiveTab] = useState<TabValue>('request');

  return (
    <div className="h-screen w-screen flex flex-col">
      <div className="border-b px-3 py-2 flex items-center gap-4">
        <h1 className="font-bold text-lg">Post Woman</h1>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>
          <TabsList>
            <TabsTrigger value="request" className="flex items-center gap-1">
              <FileJson className="h-4 w-4" />
              Request
            </TabsTrigger>
            <TabsTrigger value="chain" className="flex items-center gap-1">
              <Link2 className="h-4 w-4" />
              Chain
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={20} minSize={15} maxSize={40}>
          <div className="h-full flex flex-col">
            {activeTab === 'request' ? (
              <Sidebar />
            ) : (
              <ChainSidebar />
            )}
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={80}>
          {activeTab === 'request' ? <RequestPanel /> : <ChainPanel />}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
