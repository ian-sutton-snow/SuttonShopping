'use client';

import Link from 'next/link';
import { Logo } from './Icons';

export default function Header() {
  return (
    <header className="bg-card/80 backdrop-blur-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold font-headline text-gray-800">
            <Logo className="h-8 w-8 text-primary" />
            <span>Sutton Shopping</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
