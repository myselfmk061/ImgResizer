import { SnapScaleTool } from '@/components/snapscale-tool';

export default function Home() {
  return (
    <div className="flex flex-col min-h-dvh bg-background text-foreground">
      <main className="flex-1 flex flex-col items-center justify-start p-4 sm:p-6 md:p-10">
        <SnapScaleTool />
      </main>
    </div>
  );
}
