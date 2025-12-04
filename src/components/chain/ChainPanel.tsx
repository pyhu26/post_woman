import { useChainStore } from '@/stores/chainStore';
import { ChainHeader } from './ChainHeader';
import { ChainStepList } from './ChainStepList';
import { ChainResults } from './ChainResults';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';

export function ChainPanel() {
  const { currentChain } = useChainStore();

  if (!currentChain) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <p>Select a chain or create a new one</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <ChainHeader />
      <ResizablePanelGroup direction="vertical" className="flex-1">
        <ResizablePanel defaultSize={50} minSize={30}>
          <ChainStepList />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={50} minSize={20}>
          <ChainResults />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
