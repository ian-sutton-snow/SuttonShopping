'use client';

import { useState, useEffect } from 'react';
import { useShoppingLists } from '@/hooks/useShoppingLists';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/Header';
import ShoppingList from '@/components/ShoppingList';
import type { Item } from '@/lib/types';
import { Skeleton } from './ui/skeleton';
import { TabbedViewIcon, SideBySideViewIcon } from '@/components/Icons';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/context/AuthContext';

export default function ShoppingListClient({ storeId }: { storeId: string }) {
  const { user } = useAuth();
  const {
    stores,
    addItem,
    toggleItem,
    deleteItem,
    renameItem,
    moveItem,
    moveItemOrder,
    reorderItems,
    sortCompletedItems,
    isLoaded,
    iconComponents,
    restoreOneOffItem,
  } = useShoppingLists();
  
  const isMobile = useIsMobile();
  const [viewMode, setViewMode] = useState<'tabs' | 'side-by-side' | null>(null);

  useEffect(() => {
    // Set initial view mode based on device, avoids hydration mismatch
    if (viewMode === null) {
      setViewMode(isMobile ? 'side-by-side' : 'tabs');
    }
  }, [isMobile, viewMode]);

  const store = stores.find((s) => s.id === storeId);
  
  // Display loading skeleton until viewMode is determined
  if (!isLoaded || viewMode === null) {
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
  const isSideBySide = viewMode === 'side-by-side';

  const shoppingListProps = (listType: 'regular' | 'oneOff', isSideBySideView: boolean) => ({
    listType,
    items: store.lists[listType],
    onAddItem: (text: string) => addItem(store.id, listType, text),
    onToggleItem: (itemId: string, item: Item) => {
      toggleItem(store.id, listType, itemId);
      return listType === 'oneOff' ? item : null;
    },
    onRestoreItem: (item: Item) => restoreOneOffItem(store.id, item),
    onDeleteItem: (itemId: string) => deleteItem(store.id, listType, itemId),
    onRenameItem: (itemId: string, newText: string) => renameItem(store.id, listType, itemId, newText),
    onMoveItem: (itemId: string) => moveItem(store.id, itemId),
    onMoveItemOrder: (itemId: string, direction: 'up' | 'down') => moveItemOrder(store.id, itemId, direction),
    onReorderItems: (isCompletedList: boolean, dragIndex: number, hoverIndex: number) => reorderItems(store.id, listType, isCompletedList, dragIndex, hoverIndex),
    onSortCompletedItems: () => sortCompletedItems(store.id),
    isSideBySide: isSideBySideView,
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
        
        {!isSideBySide ? (
            <Tabs defaultValue="regular" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:w-96">
                <TabsTrigger value="regular">Regular Items</TabsTrigger>
                <TabsTrigger value="oneOff">One-Off Items</TabsTrigger>
            </TabsList>
            <TabsContent value="regular">
                <ShoppingList {...shoppingListProps('regular', isSideBySide)} />
            </TabsContent>
            <TabsContent value="oneOff">
                <ShoppingList {...shoppingListProps('oneOff', isSideBySide)} />
            </TabsContent>
            </Tabs>
        ) : (
            <div className="grid md:grid-cols-2 gap-8 items-start">
                <div>
                    <h2 className="text-xl font-bold font-headline mb-4">Regular Items</h2>
                    <ShoppingList {...shoppingListProps('regular', isSideBySide)} />
                </div>
                <div>
                    <h2 className="text-xl font-bold font-headline mb-4">One-Off Items</h2>
                    <ShoppingList {...shoppingListProps('oneOff', isSideBySide)} />
                </div>
            </div>
        )}
      </main>
    </div>
  );
}
