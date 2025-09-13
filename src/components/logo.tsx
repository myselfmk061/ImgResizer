import React from 'react';
import Image from 'next/image';

export function Logo() {
  return (
    <a href="/" className="flex items-center gap-2">
      <Image
        src="https://i.imghippo.com/files/oRi4335cO.png"
        alt="ImgResizer Logo"
        width={32}
        height={32}
        className="rounded-md"
      />
      <span className="text-xl font-semibold">ImgResizer</span>
    </a>
  );
}
