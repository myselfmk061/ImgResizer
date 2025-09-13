import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn('text-primary', className)}
      >
        <path
          d="M6.5 22C3.46243 22 2 20.5376 2 17.5V6.5C2 3.46243 3.46243 2 6.5 2H17.5C20.5376 2 22 3.46243 22 6.5V17.5C22 20.5376 20.5376 22 17.5 22H6.5Z"
          stroke="currentColor"
          strokeWidth="2.5"
        />
        <path
          d="M9 19V9H19M19 9L14 14M19 9L14 4"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <h1 className="text-xl font-bold tracking-tight">ImgResizer</h1>
    </div>
  );
}
