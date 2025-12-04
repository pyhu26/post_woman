import { useState } from 'react';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sidebar } from '@/components/tree/Sidebar';
import { ChainSidebar } from '@/components/chain/ChainSidebar';
import { WorkflowSidebar } from '@/components/workflow/WorkflowSidebar';
import { RequestPanel } from '@/components/request/RequestPanel';
import { ChainPanel } from '@/components/chain/ChainPanel';
import { WorkflowPanel } from '@/components/workflow/WorkflowPanel';
import { FileJson, Link2, Workflow } from 'lucide-react';

type TabValue = 'request' | 'chain' | 'workflow';

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
            <TabsTrigger value="workflow" className="flex items-center gap-1">
              <Workflow className="h-4 w-4" />
              Workflow
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={20} minSize={15} maxSize={40}>
          <div className="h-full flex flex-col">
            {activeTab === 'request' && <Sidebar />}
            {activeTab === 'chain' && <ChainSidebar />}
            {activeTab === 'workflow' && <WorkflowSidebar />}
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={80}>
          {activeTab === 'request' && <RequestPanel />}
          {activeTab === 'chain' && <ChainPanel />}
          {activeTab === 'workflow' && <WorkflowPanel />}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
