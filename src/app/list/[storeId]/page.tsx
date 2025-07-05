'use client';

import ShoppingListClient from '@/components/ShoppingListClient';
import { useAuth } from '@/context/AuthContext';
import { useParams } from 'next/navigation';
import { LogIn, ShoppingBasket } from 'lucide-react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';

export default function ListPage() {
  const params = useParams();
  const { user, signInWithGoogle, isAuthLoaded } = useAuth();
  const storeId = typeof params.storeId === 'string' ? params.storeId : '';

  if (!isAuthLoaded) {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 flex items-center justify-center">
                {/* Optional: Add a loading spinner here */}
            </main>
        </div>
    );
  }

  if (!user) {
     return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 flex items-center justify-center container mx-auto p-4 md:p-8">
                 <div className="text-center py-20 bg-card rounded-lg shadow-sm border border-dashed w-full max-w-md">
                    <div className="flex justify-center mb-4">
                        <ShoppingBasket className="h-16 w-16 text-muted-foreground" />
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-700">Access Your List</h2>
                    <p className="text-muted-foreground mt-2 mb-6">Please sign in to view and edit your shopping list.</p>
                    <Button onClick={signInWithGoogle}>
                      <LogIn className="mr-2 h-4 w-4" /> Sign In with Google
                    </Button>
                  </div>
            </main>
        </div>
    );
  }

  return <ShoppingListClient storeId={storeId} />;
}
