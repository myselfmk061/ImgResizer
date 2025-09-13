import Image from 'next/image';

export function Logo() {
  return (
    <div className="flex items-center gap-2 group cursor-pointer">
      <Image
        src="https://i.imghippo.com/files/oRi4335cO.png"
        alt="ImgResizer Logo"
        width={36}
        height={36}
        className="transition-all duration-300 group-hover:scale-110 group-hover:rotate-12"
      />
      <h1 className="text-xl font-bold font-headline tracking-tight transition-all duration-300 group-hover:text-primary">
        ImgResizer - Smart Photo resizer
      </h1>
    </div>
  );
}
