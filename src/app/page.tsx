import { ImageUp } from 'lucide-react';
import Link from 'next/link';
import { SnapScaleTool } from '@/components/snapscale-tool';

export default function Home() {
  return (
    <div className="flex flex-col min-h-dvh bg-background text-foreground">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b shadow-sm">
        <div className="flex items-center gap-2">
          <ImageUp className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold tracking-tight">
            ImgResizer
          </h1>
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-start p-4 sm:p-6 md:p-10">
        <SnapScaleTool />
      </main>
      
      <footer className="border-t py-6 px-4">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2024 ImgResizer. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm">
            <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
