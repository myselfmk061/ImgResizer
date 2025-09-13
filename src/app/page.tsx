import { ImageUp } from 'lucide-react';
import Link from 'next/link';
import { SnapScaleTool } from '@/components/snapscale-tool';
import { Logo } from '@/components/logo';

export default function Home() {
  return (
    <div className="flex flex-col min-h-dvh bg-background text-foreground">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b shadow-sm">
        <div className="flex items-center gap-2">
          <Logo />
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-start p-4 sm:p-6 md:p-10">
        <SnapScaleTool />
      </main>
      
      <div className="border-t py-4 px-4 bg-muted/30">
        <div className="container mx-auto text-center">
          <div className="mb-2">
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">
            Developed by <span className="font-semibold text-foreground">Myselfmk Apps</span> • Built with Next.js & Tailwind CSS
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            © 2024 ImgResizer. All rights reserved.
          </p>
        </div>
      </div>
      
      <footer className="border-t py-6 px-4">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex gap-4 text-sm">
            
          </div>
        </div>
      </footer>
    </div>
  );
}
