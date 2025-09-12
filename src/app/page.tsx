import { ImageUp } from 'lucide-react';
import { SnapScaleTool } from '@/components/snapscale-tool';

export default function Home() {
  return (
    <div className="flex flex-col min-h-dvh bg-background text-foreground">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b shadow-sm">
        <div className="flex items-center gap-2">
          <ImageUp className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold font-headline tracking-tight">
            ImgResizerApp
          </h1>
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-start p-4 sm:p-6 md:p-10">
        <SnapScaleTool />
      </main>
    </div>
  );
}
