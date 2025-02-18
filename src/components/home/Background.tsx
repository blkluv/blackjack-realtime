import useMounted from '@/hooks/useMounted';
import { useWindowSize } from '@/hooks/useWindowSize';
import Image from 'next/image';

const MOBILE_BREAKPOINT = 768;

const Background = () => {
  const { q, width } = useWindowSize();
  const isMobile = width < MOBILE_BREAKPOINT;
  const isMounted = useMounted();
  if (!isMounted) return null;
  return (
    <>
      <Image
        alt=""
        quality={100}
        src="/bg.png"
        width={1000}
        height={1000}
        className="absolute top-0 left-0 w-full h-full object-cover"
      />
      <div
        style={{
          width: q / 2.3,
          top: -q / 4.6,
          outlineWidth: isMobile ? 0 : q / 24,
          outlineColor: '#18181b',
        }}
        className="absolute rounded-full aspect-square outline md:border-4 border-zinc-300"
      />
      <div
        style={{
          width: q / 2.7,
          top: -q / 5.4,
        }}
        className="absolute overflow-hidden bg-emerald-950 rounded-full aspect-square border-4 border-zinc-300"
      >
        <Image
          priority
          src={'/green-noise.png'}
          alt=""
          height={1000}
          width={1000}
          quality={100}
          className="object-cover h-full w-full opacity-30"
        />
      </div>
      <div
        style={{
          width: q / 3,
          top: -q / 6,
          left: '50%',
          transform: 'translateX(-50%)',
        }}
        className="absolute flex justify-center items-center overflow-hidden rounded-full aspect-square border border-zinc-300"
      />
    </>
  );
};

export { Background };
