'use client';

import Link from 'next/link';
import { Logo } from './Icons';
import { useAuth } from '@/context/AuthContext';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { LogIn, LogOut } from 'lucide-react';

export default function Header() {
  const { user, signInWithGoogle, signOut: logOut } = useAuth();

  return (
    <header className="bg-card/80 backdrop-blur-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold font-headline text-gray-800">
            <Logo className="h-8 w-8 text-primary" />
            <span>ShopSphere</span>
          </Link>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                  <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <Button variant="ghost" onClick={logOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </>
            ) : (
              <Button onClick={signInWithGoogle}>
                <LogIn className="mr-2 h-4 w-4" />
                Sign In with Google
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
