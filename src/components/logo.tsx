import { ImageUp } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <ImageUp className="h-6 w-6 text-primary" />
      <h1 className="text-xl font-bold font-headline tracking-tight">
        ImgResizer
      </h1>
    </div>
  );
}