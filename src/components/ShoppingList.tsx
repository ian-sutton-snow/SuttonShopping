'use client';

import * as React from 'react';
import { Item } from '@/lib/types';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Plus, GripVertical, MoreHorizontal, Pencil, Trash2, ArrowRightLeft } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { cn } from '@/lib/utils';
import { Separator } from './ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';

interface ShoppingListProps {
  listType: 'regular' | 'oneOff';
  items: Item[];
  onAddItem: (text: string) => void;
  onToggleItem: (itemId: string) => void;
  onReorder: (startIndex: number, endIndex: number) => void;
  onDeleteItem: (itemId: string) => void;
  onRenameItem: (itemId: string, newText: string) => void;
  onMoveItem: (itemId: string) => void;
}

export default function ShoppingList({
  listType,
  items,
  onAddItem,
  onToggleItem,
  onReorder,
  onDeleteItem,
  onRenameItem,
  onMoveItem,
}: ShoppingListProps) {
  const [newItemText, setNewItemText] = React.useState('');
  const [removingItems, setRemovingItems] = React.useState<string[]>([]);
  const dragItem = React.useRef<number | null>(null);
  const dragOverItem = React.useRef<number | null>(null);

  const [isRenameDialogOpen, setIsRenameDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [activeItem, setActiveItem] = React.useState<Item | null>(null);
  const [itemNewName, setItemNewName] = React.useState('');

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItemText.trim()) {
      onAddItem(newItemText.trim());
      setNewItemText('');
    }
  };

  const handleToggleItem = (itemId: string) => {
    if (listType === 'oneOff') {
      setRemovingItems(prev => [...prev, itemId]);
      setTimeout(() => {
        onToggleItem(itemId);
        setRemovingItems(prev => prev.filter(id => id !== itemId));
      }, 300);
    } else {
      onToggleItem(itemId);
    }
  };

  const handleDragSort = () => {
    if (dragItem.current === null || dragOverItem.current === null || dragItem.current === dragOverItem.current) return;
    onReorder(dragItem.current, dragOverItem.current);
    dragItem.current = null;
    dragOverItem.current = null;
  };

  const openRenameDialog = (item: Item) => {
    setActiveItem(item);
    setItemNewName(item.text);
    setIsRenameDialogOpen(true);
  };

  const handleRenameItem = () => {
    if (activeItem && itemNewName.trim()) {
      onRenameItem(activeItem.id, itemNewName.trim());
      setIsRenameDialogOpen(false);
      setActiveItem(null);
    }
  };

  const openDeleteDialog = (item: Item) => {
    setActiveItem(item);
    setIsDeleteDialogOpen(true);
  };
  
  const handleDeleteItem = () => {
    if (activeItem) {
      onDeleteItem(activeItem.id);
      setIsDeleteDialogOpen(false);
      setActiveItem(null);
    }
  };

  const activeItems = listType === 'regular' ? items.filter(item => !item.completed) : items;
  const completedItems = listType === 'regular' ? items.filter(item => item.completed) : [];

  const renderItemList = (list: Item[], isCompletedList = false) => (
    <div className="space-y-2">
      {list.map((item, index) => {
        const isRemoving = removingItems.includes(item.id);
        const originalIndex = items.findIndex(i => i.id === item.id);

        return (
          <div
            key={item.id}
            draggable
            onDragStart={() => (dragItem.current = originalIndex)}
            onDragEnter={() => (dragOverItem.current = originalIndex)}
            onDragEnd={handleDragSort}
            onDragOver={(e) => e.preventDefault()}
            className={cn(
              "flex items-center gap-2 p-2 pr-1 rounded-lg bg-white/80 shadow-sm transition-all duration-300 group",
              isRemoving ? 'animate-item-remove' : 'animate-item-add',
              'cursor-grab active:cursor-grabbing'
            )}
          >
            <GripVertical className="h-5 w-5 text-muted-foreground" />
            <Checkbox
              id={`item-${item.id}`}
              checked={item.completed}
              onCheckedChange={() => handleToggleItem(item.id)}
            />
            <label
              htmlFor={`item-${item.id}`}
              className={cn(
                "flex-1 text-gray-800 transition-all duration-300 relative",
                item.completed && 'text-muted-foreground strikethrough-line',
                item.completed && 'strikethrough-active'
              )}
            >
              {item.text}
            </label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => openRenameDialog(item)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  <span>Rename</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onMoveItem(item.id)}>
                  <ArrowRightLeft className="mr-2 h-4 w-4" />
                  <span>Move to {listType === 'regular' ? 'One-Offs' : 'Regulars'}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => openDeleteDialog(item)} className="text-destructive focus:text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      })}
    </div>
  );

  return (
    <>
      {/* Dialogs for item actions */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Item</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Label htmlFor="item-name">Item Name</Label>
            <Input id="item-name" value={itemNewName} onChange={(e) => setItemNewName(e.target.value)} autoFocus />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenameDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleRenameItem}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the item "{activeItem?.text}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteItem} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card>
        <CardContent className="p-4 md:p-6">
          <form onSubmit={handleAddItem} className="flex gap-2 mb-6">
            <Input
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              placeholder={listType === 'regular' ? "Add a regular item..." : "Add a one-off item..."}
            />
            <Button type="submit" variant="secondary" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Plus className="h-4 w-4" />
            </Button>
          </form>

          {activeItems.length === 0 && (listType === 'regular' || completedItems.length === 0) ? (
            <p className="text-center text-muted-foreground py-8">
              {listType === 'regular' ? "No active items. Add one above!" : "All clear! Add a one-off item."}
            </p>
          ) : (
            renderItemList(activeItems)
          )}
          
          {listType === 'regular' && completedItems.length > 0 && (
            <>
              <Separator className="my-6" />
              <h3 className="text-sm font-medium text-muted-foreground mb-4">Completed ({completedItems.length})</h3>
              {renderItemList(completedItems, true)}
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
}
