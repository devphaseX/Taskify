import { Button } from '@/components/ui/button';
import { Medal } from 'lucide-react';
import Link from 'next/link';
import { headingFont, textFont } from './fonts';
import { cn } from '@/lib/utils';

export default function LandingPage() {
  return (
    <div className="flex justify-center items-center flex-col">
      <div
        className={cn(
          'flex items-center justify-center flex-col',
          headingFont.className
        )}
      >
        <div className="mb-4 flex items-center border shadow-sm p-4 rounded-full bg-amber-100 text-amber-700 uppercase">
          <Medal className="h-6 w-6 mr-2" />
          No 1 task management
        </div>
        <h1 className="text-3xl md:text-6xl text-center text-neutral-800 mb-6">
          Taskify helps team move
        </h1>
        <div className="text-3xl md:text-6xl text-white bg-gradient-to-r from-fuchsia-600 to-pink-600 px-4 p-2 rounded-md pb-4 w-fit">
          work forward.
        </div>
      </div>
      <div
        className={cn(
          `text-sm md:text-xl text-neutral-400 mt-4
      max-w-xs md:max-w-2xl text-center mx-auto`,
          textFont.className
        )}
      >
        Collaborate, manage projects, and reach new productivity peeks. From
        high rises to the home office, the way your team works in unique -
        accomplish it all with Taskify
      </div>
      <Button className="mt-6" size="lg" asChild>
        <Link href="/sign-up">Get Taskify for free</Link>
      </Button>
    </div>
  );
}
