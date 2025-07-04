
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useShoppingLists } from '@/hooks/useShoppingLists';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/Header';
import ShoppingList from '@/components/ShoppingList';
import type { Item, Store } from '@/lib/types';
import { Skeleton } from './ui/skeleton';
import { TabbedViewIcon, SideBySideViewIcon } from '@/components/Icons';
import { useIsMobile } from '@/hooks/use-mobile';

export default function ShoppingListClient({ storeId }: { storeId: string }) {
  const {
    stores,
    getStore,
    addItem,
    toggleItem,
    reorderItems,
    deleteItem,
    renameItem,
    moveItem,
    moveItemOrder,
    isLoaded,
    iconComponents,
    restoreOneOffItem,
  } = useShoppingLists();
  
  const [store, setStore] = useState<Store | undefined>(undefined);
  const [viewMode, setViewMode] = useState<'tabs' | 'side-by-side'>('tabs');
  const isMobile = useIsMobile();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded) {
      const currentStore = getStore(storeId);
      if (currentStore) {
        setStore(currentStore);
      }
    }
  }, [storeId, isLoaded, getStore, stores]);

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

  const shoppingListProps = (listType: 'regular' | 'oneOff') => ({
    listType,
    items: store.lists[listType],
    onAddItem: (text: string) => addItem(store.id, listType, text),
    onToggleItem: (itemId: string, item: Item) => {
      if (listType === 'oneOff') {
        toggleItem(store.id, listType, itemId);
        return item; // Return the item for the undo toast
      }
      toggleItem(store.id, listType, itemId);
      return null;
    },
    onRestoreItem: (item: Item) => restoreOneOffItem(store.id, item),
    onReorder: (startIndex: number, endIndex: number) => reorderItems(store.id, listType, startIndex, endIndex),
    onDeleteItem: (itemId: string) => deleteItem(store.id, listType, itemId),
    onRenameItem: (itemId: string, newText: string) => renameItem(store.id, listType, itemId, newText),
    onMoveItem: (itemId: string) => moveItem(store.id, itemId),
    onMoveItemOrder: (itemId: string, direction: 'up' | 'down') => moveItemOrder(store.id, itemId, direction),
    isMobile,
    viewMode
  });

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
            <div className='flex items-center gap-1'>
                <Button variant={viewMode === 'tabs' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('tabs')}>
                    <TabbedViewIcon className="h-8 w-8" />
                    <span className="sr-only">Tabbed View</span>
                </Button>
                <Button variant={viewMode === 'side-by-side' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('side-by-side')}>
                    <SideBySideViewIcon className="h-8 w-8" />
                    <span className="sr-only">Side-by-side View</span>
                </Button>
            </div>
        </div>
        
        {viewMode === 'tabs' ? (
            <Tabs defaultValue="regular" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:w-96">
                <TabsTrigger value="regular">Regular Items</TabsTrigger>
                <TabsTrigger value="oneOff">One-Off Items</TabsTrigger>
            </TabsList>
            <TabsContent value="regular">
                <ShoppingList {...shoppingListProps('regular')} />
            </TabsContent>
            <TabsContent value="oneOff">
                <ShoppingList {...shoppingListProps('oneOff')} />
            </TabsContent>
            </Tabs>
        ) : (
            <div className="grid md:grid-cols-2 gap-8 items-start">
                <div>
                    <h2 className="text-xl font-bold font-headline mb-4">Regular Items</h2>
                    <ShoppingList {...shoppingListProps('regular')} />
                </div>
                <div>
                    <h2 className="text-xl font-bold font-headline mb-4">One-Off Items</h2>
                    <ShoppingList {...shoppingListProps('oneOff')} />
                </div>
            </div>
        )}
      </main>
    </div>
  );
}
