
'use client';

import * as React from 'react';
import { Item } from '@/lib/types';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Plus, GripVertical, MoreHorizontal, Pencil, Trash2, ArrowRightLeft, MoveUp, MoveDown } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { cn } from '@/lib/utils';
import { Separator } from './ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { useToast } from '@/hooks/use-toast';

interface ShoppingListProps {
  listType: 'regular' | 'oneOff';
  items: Item[];
  onAddItem: (text: string) => void;
  onToggleItem: (itemId: string) => void;
  onReorder: (startIndex: number, endIndex: number) => void;
  onDeleteItem: (itemId: string) => void;
  onRenameItem: (itemId: string, newText: string) => void;
  onMoveItem: (itemId: string) => void;
  onMoveItemOrder: (itemId: string, direction: 'up' | 'down') => void;
  isMobile?: boolean;
  viewMode?: 'tabs' | 'side-by-side';
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
  onMoveItemOrder,
  isMobile = false,
  viewMode = 'tabs',
}: ShoppingListProps) {
  const [newItemText, setNewItemText] = React.useState('');
  const [removingItems, setRemovingItems] = React.useState<string[]>([]);
  const dragItem = React.useRef<number | null>(null);
  const dragOverItem = React.useRef<number | null>(null);
  const removalTimeouts = React.useRef(new Map<string, NodeJS.Timeout>());

  const [isRenameDialogOpen, setIsRenameDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [activeItem, setActiveItem] = React.useState<Item | null>(null);
  const [itemNewName, setItemNewName] = React.useState('');

  const { toast, dismiss } = useToast();

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItemText.trim()) {
      onAddItem(newItemText.trim());
      setNewItemText('');
    }
  };

  const handleUndoRemove = (itemId: string) => {
    const timeoutId = removalTimeouts.current.get(itemId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      removalTimeouts.current.delete(itemId);
    }
    setRemovingItems(prev => prev.filter(id => id !== itemId));
    onToggleItem(itemId); // Re-toggles the item to add it back
    dismiss();
  };

  const handleToggleItem = (itemId: string) => {
    if (listType === 'oneOff') {
       const itemToComplete = items.find(i => i.id === itemId);
      if (itemToComplete) {
        toast({
            title: `"${itemToComplete.text}" removed.`,
            action: <Button variant="secondary" size="sm" onClick={() => handleUndoRemove(itemId)}>Undo</Button>
        });
      }
      setRemovingItems(prev => [...prev, itemId]);
      const timeoutId = setTimeout(() => {
        onToggleItem(itemId);
        setRemovingItems(prev => prev.filter(id => id !== itemId));
        removalTimeouts.current.delete(itemId);
      }, 5000); // Wait 5s for undo
      removalTimeouts.current.set(itemId, timeoutId);
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
      {list.filter(item => !removingItems.includes(item.id)).map((item, index) => {
        const isRemoving = removingItems.includes(item.id);
        const originalIndex = items.findIndex(i => i.id === item.id);
        
        const canMoveUp = index > 0;
        const canMoveDown = index < list.length - 1;

        return (
          <div
            key={item.id}
            draggable
            onDragStart={() => (dragItem.current = originalIndex)}
            onDragEnter={() => (dragOverItem.current = originalIndex)}
            onDragEnd={handleDragSort}
            onDragOver={(e) => e.preventDefault()}
            className={cn(
              "flex items-center gap-2 p-2 pr-1 rounded-lg bg-white/80 shadow-sm transition-all duration-300",
              isRemoving ? 'animate-item-remove' : 'animate-item-add',
              'group'
            )}
          >
            <div className="hidden md:block">
              <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab active:cursor-grabbing" />
            </div>
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
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onMoveItemOrder(item.id, 'up')} disabled={!canMoveUp}>
                  <MoveUp className="mr-2 h-4 w-4" />
                  <span>Move Up</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onMoveItemOrder(item.id, 'down')} disabled={!canMoveDown}>
                  <MoveDown className="mr-2 h-4 w-4" />
                  <span>Move Down</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => openRenameDialog(item)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  <span>Rename</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onMoveItem(item.id)}>
                  <ArrowRightLeft className="mr-2 h-4 w-4" />
                  <span>Move to {listType === 'regular' ? 'One-Offs' : 'Regulars'}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
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
            isMobile && viewMode === 'side-by-side' ? (
              <div className="mt-6 p-4 text-center text-muted-foreground border border-dashed rounded-lg">
                Completed items are hidden in this view.
              </div>
            ) : (
              <>
                <Separator className="my-6" />
                <h3 className="text-sm font-medium text-muted-foreground mb-4">Completed ({completedItems.length})</h3>
                {renderItemList(completedItems, true)}
              </>
            )
          )}
        </CardContent>
      </Card>
    </>
  );
}
