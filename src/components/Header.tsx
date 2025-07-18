'use client';

import Link from 'next/link';
import { Logo } from './Icons';
import { useAuth } from '@/context/AuthContext';
import { Button } from './ui/button';
import { LogIn, LogOut } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

export default function Header() {
  const { user, signInWithGoogle, signOut, isAuthLoaded } = useAuth();

  return (
    <header className="bg-card/80 backdrop-blur-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold font-headline text-gray-800">
            <Logo className="h-8 w-8 text-primary" />
            <span>Sutton Shopping</span>
          </Link>

          <div className="flex items-center gap-4">
            {isAuthLoaded && user ? (
              <>
                <Avatar>
                  <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                  <AvatarFallback>{user.displayName?.charAt(0)}</AvatarFallback>
                </Avatar>
                <Button variant="ghost" size="sm" onClick={signOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </>
            ) : isAuthLoaded ? (
              <Button onClick={signInWithGoogle}>
                <LogIn className="mr-2 h-4 w-4" />
                Sign In with Google
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
