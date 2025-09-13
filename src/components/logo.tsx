import Image from 'next/image';

export function Logo() {
  return (
    <Image
      src="https://i.imghippo.com/files/oRi4335cO.png"
      alt="ImgResizer Logo"
      width={120}
      height={28}
      priority
    />
  );
}
