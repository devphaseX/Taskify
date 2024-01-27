import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { headingFont } from '@/app/(marketing)/fonts';

type LogoProps = {
  className?: string;
};

export const Logo: React.FC<LogoProps> = ({ className }) => {
  return (
    <Link href="/">
      <div
        className={cn(
          `hover:opacity-75 
          transition items-center gap-x-2 hidden md:flex`
        )}
      >
        <div className={cn('w-8 h-8 relative', className)}>
          <Image src="/logo.svg" alt="Logo" fill />
        </div>

        <p className={cn('text-lg text-neutral-700 ', headingFont.className)}>
          Taskify
        </p>
      </div>
    </Link>
  );
};
