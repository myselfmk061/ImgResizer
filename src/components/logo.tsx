import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <h1 className="text-xl font-bold tracking-tight">ImgResizer</h1>
    </div>
  );
}
