'use client';

import * as React from 'react';
import Link from 'next/link';
import { useShoppingLists } from '@/hooks/useShoppingLists';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Loader2 } from 'lucide-react';
import Header from '@/components/Header';
import { Skeleton } from '@/components/ui/skeleton';

export default function StoreListClient() {
  const { stores, addStore, isLoaded, iconComponents } = useShoppingLists();
  const [newStoreName, setNewStoreName] = React.useState('');
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const handleAddStore = () => {
    if (newStoreName.trim()) {
      addStore(newStoreName.trim());
      setNewStoreName('');
      setIsDialogOpen(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold font-headline text-gray-800">Your Stores</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add Store
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add a new store</DialogTitle>
                <DialogDescription>
                  Enter a name for your new shopping list.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={newStoreName}
                    onChange={(e) => setNewStoreName(e.target.value)}
                    className="col-span-3"
                    autoFocus
                    onKeyPress={(e) => e.key === 'Enter' && handleAddStore()}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddStore}>Create Store</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {!isLoaded ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="shadow-lg transition-transform transform hover:-translate-y-1">
                <CardHeader className="flex flex-row items-center gap-4">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-6 w-3/4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : stores.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {stores.map((store) => {
              const Icon = iconComponents[store.icon];
              const totalItems = store.lists.regular.length + store.lists.oneOff.length;
              return (
                <Link href={`/list/${store.id}`} key={store.id} className="focus:outline-none focus:ring-2 focus:ring-primary rounded-lg">
                  <Card className="shadow-lg transition-transform transform hover:-translate-y-1 h-full flex flex-col hover:border-primary">
                    <CardHeader className="flex flex-row items-center gap-4">
                      {Icon && <Icon className="h-8 w-8 text-primary" />}
                      <CardTitle className="font-headline text-xl">{store.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-sm text-muted-foreground">{totalItems} items</p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-700">No stores yet!</h2>
            <p className="text-muted-foreground mt-2">Click "Add Store" to create your first shopping list.</p>
          </div>
        )}
      </main>
    </div>
  );
}
