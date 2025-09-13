import { Logo } from '@/components/logo';
import { SnapScaleTool } from '@/components/snapscale-tool';

export default function Home() {
  return (
    <div className="flex flex-col min-h-dvh bg-background text-foreground">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b">
        <Logo />
      </header>
      <main className="flex-1 flex flex-col items-center justify-start p-4 sm:p-6 md:p-10">
        <SnapScaleTool />
      </main>
    </div>
  );
}
