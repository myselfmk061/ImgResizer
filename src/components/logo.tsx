import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" >
          <path d="M21 15V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H9" stroke="hsl(var(--primary))" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
          <path d="M15 3L21 9V12" stroke="hsl(var(--primary))" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
          <path d="M12 9L3 21" stroke="hsl(var(--primary))" stroke-width="2"></path>
          <path d="M21 3L12 12" stroke="hsl(var(--primary))" stroke-width="2" stroke-linecap="round"></path>
      </svg>
      <h1 className="text-xl font-bold tracking-tight">ImgResizer</h1>
    </div>
  );
}
