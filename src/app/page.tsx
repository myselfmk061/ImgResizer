'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { SnapScaleTool } from '@/components/snapscale-tool';
import { Logo } from '@/components/logo';

export default function Home() {
  const { toast } = useToast();
  
  useEffect(() => {
    toast({
      title: '🎉 Welcome to ImgResizer!',
      description: 'Professional image resizing tool. Upload your images to resize, compress, and enhance them.',
      duration: Infinity,
    });
  }, [toast]);
  
  return (
    <div className="flex flex-col min-h-dvh bg-background text-foreground">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b shadow-sm backdrop-blur-sm bg-background/80 sticky top-0 z-40 animate-in slide-in-from-top duration-300">
        <div className="flex items-center gap-2">
          <Logo />
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-start p-4 sm:p-6 md:p-10 animate-in fade-in duration-500">
        <SnapScaleTool />
      </main>
      
      <div className="border-t py-4 px-4 bg-muted/30 animate-in slide-in-from-bottom duration-500">
        <div className="container mx-auto text-center">
          <div className="mb-2">
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-all duration-300 hover:scale-105 inline-block">
              Privacy Policy
            </Link>
          </div>
          <p className="text-sm text-muted-foreground animate-in fade-in duration-700 delay-200">
            Developed by <span className="font-semibold text-foreground hover:text-primary transition-colors duration-300 cursor-pointer">Myselfmk Apps</span> • Made with ❣️ in India
          </p>
          <p className="text-sm text-muted-foreground mt-2 animate-in fade-in duration-700 delay-300">
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
      <Toaster />
    </div>
  );
}
