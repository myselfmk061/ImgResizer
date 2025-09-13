import { ImageUp } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-2 group cursor-pointer">
      <ImageUp className="h-6 w-6 text-primary transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
      <h1 className="text-xl font-bold font-headline tracking-tight transition-all duration-300 group-hover:text-primary">
        ImgResizer
      </h1>
    </div>
  );
}