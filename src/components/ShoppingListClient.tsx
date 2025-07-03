'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useShoppingLists } from '@/hooks/useShoppingLists';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/Header';
import ShoppingList from '@/components/ShoppingList';
import type { Store } from '@/lib/types';
import { Skeleton } from './ui/skeleton';

export default function ShoppingListClient({ storeId }: { storeId: string }) {
  const { getStore, addItem, toggleItem, reorderItems, isLoaded, iconComponents } = useShoppingLists();
  const [store, setStore] = useState<Store | undefined>(undefined);
  const router = useRouter();

  useEffect(() => {
    if (isLoaded) {
      const currentStore = getStore(storeId);
      if (currentStore) {
        setStore(currentStore);
      } else {
        // Redirect if store not found, maybe after a delay or check
        // For now, we'll just show not found
      }
    }
  }, [storeId, isLoaded, getStore]);

  if (!isLoaded) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 container mx-auto p-4 md:p-8">
          <div className="flex items-center gap-4 mb-6">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="h-9 w-48" />
          </div>
          <Skeleton className="h-10 w-64 mb-4" />
          <div className="space-y-4">
             <Skeleton className="h-24 w-full" />
             <Skeleton className="h-24 w-full" />
          </div>
        </main>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 container mx-auto p-4 md:p-8 text-center">
            <h1 className="text-3xl font-bold font-headline text-red-600">Store not found</h1>
            <p className="text-muted-foreground mt-4">The store you are looking for does not exist.</p>
             <Button asChild variant="link" className="mt-4">
                <Link href="/">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to all stores
                </Link>
            </Button>
        </main>
      </div>
    );
  }

  const Icon = iconComponents[store.icon];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <div className="flex items-center justify-between mb-6">
            <div className='flex items-center gap-4'>
                 <Button asChild variant="outline" size="icon">
                    <Link href="/">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Back to stores</span>
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold font-headline text-gray-800 flex items-center gap-3">
                {Icon && <Icon className="h-8 w-8 text-primary" />}
                {store.name}
                </h1>
            </div>
        </div>
        
        <Tabs defaultValue="regular" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:w-96">
            <TabsTrigger value="regular">Regular Items</TabsTrigger>
            <TabsTrigger value="oneOff">One-Off Items</TabsTrigger>
          </TabsList>
          <TabsContent value="regular">
            <ShoppingList
              listType="regular"
              items={store.lists.regular}
              onAddItem={(text) => addItem(store.id, 'regular', text)}
              onToggleItem={(itemId) => toggleItem(store.id, 'regular', itemId)}
              onReorder={(startIndex, endIndex) => reorderItems(store.id, 'regular', startIndex, endIndex)}
            />
          </TabsContent>
          <TabsContent value="oneOff">
            <ShoppingList
              listType="oneOff"
              items={store.lists.oneOff}
              onAddItem={(text) => addItem(store.id, 'oneOff', text)}
              onToggleItem={(itemId) => toggleItem(store.id, 'oneOff', itemId)}
              onReorder={(startIndex, endIndex) => reorderItems(store.id, 'oneOff', startIndex, endIndex)}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
