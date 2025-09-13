import React from 'react';

export function Logo() {
  return (
    <a href="/" className="flex items-center gap-3">
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="32" height="32" rx="6" fill="#F7F7F7" />
        <path
          d="M10 9H13V23H10V9Z"
          fill="#F2762A"
        />
        <path
          d="M13 9H18.554C20.9925 9 22.1263 10.2222 22.1263 12.5C22.1263 14.7778 20.9925 16 18.554 16H13V9Z"
          fill="#DD5828"
        />
        <path
          d="M13 16H18.5L22 23H18L15.5 17.5H13V16Z"
          fill="#DD5828"
        />
      </svg>
      <span className="text-xl font-semibold">ImgResizer</span>
    </a>
  );
}
