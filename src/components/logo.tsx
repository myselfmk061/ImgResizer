import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        className={cn(className)}
      >
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#FF8A00', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#E52E71', stopOpacity: 1 }} />
          </linearGradient>
        </defs>
        <g fill="none" stroke="url(#logoGradient)" strokeWidth="1.5">
          <rect
            x="1.5"
            y="1.5"
            width="21"
            height="21"
            rx="4"
            ry="4"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 19V9h10m0 0l-4-4m4 4l-4 4"
          />
        </g>
      </svg>
      <h1 className="text-xl font-bold tracking-tight">ImgResizer</h1>
    </div>
  );
}
