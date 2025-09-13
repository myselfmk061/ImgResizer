import React from 'react';

export function Logo() {
  return (
    <a href="/" className="flex items-center gap-3">
      <svg
        width="28"
        height="28"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M42 6H6C4.89543 6 4 6.89543 4 8V40C4 41.1046 4.89543 42 6 42H42C43.1046 42 44 41.1046 44 40V8C44 6.89543 43.1046 6 42 6Z"
          stroke="#DD5828"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <path
          d="M29.0049 18.9999L40.002 18.9999V29.997"
          stroke="#DD5828"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M18 18H8V34H24"
          stroke="#DD5828"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M40 19L18 41"
          stroke="#DD5828"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="text-xl font-semibold">ImgResizer</span>
    </a>
  );
}
