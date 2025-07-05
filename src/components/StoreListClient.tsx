
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, MoreHorizontal, Pencil, Trash2, GripVertical, ShoppingBasket, MoveUp, MoveDown, LogIn } from 'lucide-react';
import Header from '@/components/Header';
import { Skeleton } from '@/components/ui/skeleton';
import { Store } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/context/AuthContext';

const IconPicker = ({
  allIcons,
  selectedIcon,
  onSelect,
  iconComponents,
}: {
  allIcons: string[];
  selectedIcon: string;
  onSelect: (iconName: string) => void;
  iconComponents: { [key: string]: React.ComponentType<{ className?: string }> };
}) => (
  <div className="grid grid-cols-4 gap-4 pt-1">
    {allIcons.map((iconName) => {
      const Icon = iconComponents[iconName];
      return (
        <Button
          key={iconName}
          variant="outline"
          size="icon"
          className={cn(
            "h-12 w-12",
            selectedIcon === iconName && "ring-2 ring-primary border-primary"
          )}
          onClick={() => onSelect(iconName)}
        >
          <Icon className="h-6 w-6" />
        </Button>
      );
    })}
  </div>
);

export default function StoreListClient() {
  const { user, signInWithGoogle, isAuthLoaded } = useAuth();
  const { stores, addStore, editStore, deleteStore, reorderStores, moveStoreOrder, isLoaded, iconComponents, icons } = useShoppingLists();
  const isMobile = useIsMobile();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  
  const [activeStore, setActiveStore] = React.useState<Store | null>(null);

  const [storeName, setStoreName] = React.useState('');
  const [storeIcon, setStoreIcon] = React.useState(icons[0]);

  const dragItem = React.useRef<number | null>(null);
  const dragOverItem = React.useRef<number | null>(null);

  const openAddDialog = () => {
    setStoreName('');
    setStoreIcon(icons[0]);
    setIsAddDialogOpen(true);
  };

  const openEditDialog = (store: Store) => {
    setActiveStore(store);
    setStoreName(store.name);
    setStoreIcon(store.icon);
    setIsEditDialogOpen(true);
  };
  
  const openDeleteDialog = (store: Store) => {
    setActiveStore(store);
    setIsDeleteDialogOpen(true);
  };

  const handleAddStore = () => {
    if (storeName.trim()) {
      addStore(storeName.trim(), storeIcon);
      setIsAddDialogOpen(false);
    }
  };

  const handleEditStore = () => {
    if (activeStore && storeName.trim()) {
      editStore(activeStore.id, storeName.trim(), storeIcon);
      setIsEditDialogOpen(false);
      setActiveStore(null);
    }
  };

  const handleDeleteStore = () => {
    if (activeStore) {
      deleteStore(activeStore.id);
      setIsDeleteDialogOpen(false);
      setActiveStore(null);
    }
  };

  const handleDragSort = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    if (dragItem.current !== dragOverItem.current) {
        reorderStores(dragItem.current, dragOverItem.current);
    }
    dragItem.current = null;
    dragOverItem.current = null;
  };

  const renderContent = () => {
    if (!isLoaded) {
       return (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i}><CardHeader className="flex flex-row items-center gap-4"><Skeleton className="h-8 w-8 rounded-full" /><Skeleton className="h-6 w-3/4" /></CardHeader><CardContent><Skeleton className="h-4 w-1/2" /></CardContent></Card>
            ))}
          </div>
        );
    }

    if (stores.length > 0) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {stores.map((store, index) => {
            const Icon = iconComponents[store.icon];
            const totalItems = store.lists.regular.length + store.lists.oneOff.length;
            const canMoveUp = index > 0;
            const canMoveDown = index < stores.length - 1;
            return (
               <div
                  key={store.id}
                  draggable={!isMobile}
                  onDragStart={() => (dragItem.current = index)}
                  onDragEnter={() => (dragOverItem.current = index)}
                  onDragEnd={handleDragSort}
                  onDragOver={(e) => e.preventDefault()}
                  className={cn(!isMobile && "cursor-grab active:cursor-grabbing")}
                >
                <Card className="shadow-lg transition-transform transform hover:-translate-y-1 h-full flex flex-col hover:border-primary relative">
                   <Link href={`/list/${store.id}`} className="focus:outline-none focus:ring-2 focus:ring-primary rounded-lg flex-grow flex flex-col">
                      <CardHeader className="flex flex-row items-center gap-4">
                          {Icon && <Icon className="h-8 w-8 text-primary" />}
                          <CardTitle className="font-headline text-xl">{store.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="flex-grow">
                          <p className="text-sm text-muted-foreground">{totalItems} items</p>
                      </CardContent>
                  </Link>

                  <div className="absolute top-2 right-2 flex items-center gap-1">
                      {!isMobile && <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />}
                      <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                              </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => moveStoreOrder(store.id, 'up')} disabled={!canMoveUp}>
                                  <MoveUp className="mr-2 h-4 w-4" />
                                  <span>Move Up</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => moveStoreOrder(store.id, 'down')} disabled={!canMoveDown}>
                                  <MoveDown className="mr-2 h-4 w-4" />
                                  <span>Move Down</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => openEditDialog(store)}>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  <span>Edit</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openDeleteDialog(store)} className="text-destructive focus:text-destructive">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  <span>Delete</span>
                              </DropdownMenuItem>
                          </DropdownMenuContent>
                      </DropdownMenu>
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      );
    } else {
      return (
        <div className="text-center py-20 bg-card rounded-lg shadow-sm border border-dashed">
          <div className="flex justify-center mb-4">
              <ShoppingBasket className="h-16 w-16 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-700">Your shopping world is empty!</h2>
          <p className="text-muted-foreground mt-2 mb-6">Get started by creating your first store list.</p>
          <Button onClick={openAddDialog}>
            <Plus className="mr-2 h-4 w-4" /> Add Your First Store
          </Button>
        </div>
      );
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold font-headline text-gray-800">My Stores</h1>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                    <Button onClick={openAddDialog}>
                        <Plus className="mr-2 h-4 w-4" /> Add Store
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] p-4">
                    <DialogHeader>
                        <DialogTitle>Add a new store</DialogTitle>
                        <DialogDescription>Enter a name and choose an icon for your new shopping list.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-2 py-2">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Name</Label>
                            <Input id="name" value={storeName} onChange={(e) => setStoreName(e.target.value)} className="col-span-3" autoFocus />
                        </div>
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label className="text-right pt-2">Icon</Label>
                            <div className="col-span-3">
                                <IconPicker allIcons={icons} selectedIcon={storeIcon} onSelect={setStoreIcon} iconComponents={iconComponents} />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleAddStore}>Create Store</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>

        {/* Edit Store Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[425px] p-4">
                <DialogHeader>
                    <DialogTitle>Edit store</DialogTitle>
                    <DialogDescription>Update the name and icon for this store.</DialogDescription>
                </DialogHeader>
                 <div className="grid gap-2 py-2">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-name" className="text-right">Name</Label>
                        <Input id="edit-name" value={storeName} onChange={(e) => setStoreName(e.target.value)} className="col-span-3" autoFocus />
                    </div>
                    <div className="grid grid-cols-4 items-start gap-4">
                        <Label className="text-right pt-2">Icon</Label>
                        <div className="col-span-3">
                            <IconPicker allIcons={icons} selectedIcon={storeIcon} onSelect={setStoreIcon} iconComponents={iconComponents} />
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleEditStore}>Save Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        {/* Delete Store Alert Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the "{activeStore?.name}" store and all of its items.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteStore} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        
        {renderContent()}

      </main>
    </div>
  );
}
