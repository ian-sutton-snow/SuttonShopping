'use client';

import * as React from 'react';
import { Item } from '@/lib/types';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Plus, GripVertical, MoreHorizontal, Pencil, Trash2, ArrowRightLeft, MoveUp, MoveDown, SortAsc } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { cn } from '@/lib/utils';
import { Separator } from './ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { useScreenOrientation } from '@/hooks/useScreenOrientation';

interface ShoppingListProps {
  listType: 'regular' | 'oneOff';
  items: Item[];
  onAddItem: (text: string) => void;
  onToggleItem: (itemId: string, item: Item) => void;
  onRestoreItem: (item: Item) => void;
  onDeleteItem: (itemId: string) => void;
  onRenameItem: (itemId: string, newText: string) => void;
  onMoveItem: (itemId: string) => void;
  onMoveItemOrder: (itemId: string, direction: 'up' | 'down') => void;
  onReorderItems: (isCompletedList: boolean, dragIndex: number, hoverIndex: number) => void;
  onSortCompletedItems: () => void;
  isSideBySide?: boolean;
}

export default function ShoppingList({
  listType,
  items,
  onAddItem,
  onToggleItem,
  onRestoreItem,
  onDeleteItem,
  onRenameItem,
  onMoveItem,
  onMoveItemOrder,
  onReorderItems,
  onSortCompletedItems,
  isSideBySide = false,
}: ShoppingListProps) {
  const [newItemText, setNewItemText] = React.useState('');
  const [showInputError, setShowInputError] = React.useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [activeItem, setActiveItem] = React.useState<Item | null>(null);
  const [itemNewName, setItemNewName] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  const { toast, dismiss } = useToast();
  const isMobile = useIsMobile();
  const orientation = useScreenOrientation();
  
  const dragItem = React.useRef<number | null>(null);
  const dragOverItem = React.useRef<number | null>(null);
  
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    const text = newItemText.trim();
    if (text) {
      setShowInputError(false);
      onAddItem(text);
      setNewItemText('');
    } else {
      setShowInputError(true);
      inputRef.current?.focus();
    }
  };

  const handleToggleItem = (itemId: string) => {
    const itemToToggle = items.find(i => i.id === itemId);
    if (!itemToToggle) return;

    onToggleItem(itemId, itemToToggle);
    
    if (listType === 'oneOff') {
      const { id: toastId } = toast({
        title: `"${itemToToggle.text}" removed.`,
        duration: 5000,
        action: (
          <Button variant="secondary" size="sm" onClick={(e) => {
            e.preventDefault();
            onRestoreItem(itemToToggle);
            dismiss(toastId);
          }}>
            Undo
          </Button>
        ),
      });
    }
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

  const handleDragSort = (isCompletedList: boolean) => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    if (dragItem.current !== dragOverItem.current) {
        onReorderItems(isCompletedList, dragItem.current, dragOverItem.current);
    }
    dragItem.current = null;
    dragOverItem.current = null;
  };

  const activeItems = listType === 'regular' ? items.filter(item => !item.completed) : items;
  const completedItems = listType === 'regular' ? items.filter(item => item.completed) : [];

  const renderItemList = (list: Item[], isCompletedList = false) => (
    <div className="space-y-2">
      {list.map((item, index) => {
        const canMoveUp = index > 0;
        const canMoveDown = index < list.length - 1;

        return (
          <div
            key={item.id}
            draggable={!isMobile}
            onDragStart={() => (dragItem.current = index)}
            onDragEnter={() => (dragOverItem.current = index)}
            onDragEnd={() => handleDragSort(isCompletedList)}
            onDragOver={(e) => e.preventDefault()}
            className={cn(
              "group flex items-center gap-2 p-2 pr-1 rounded-lg bg-white/80 shadow-sm transition-all duration-300",
              !isMobile && "cursor-grab active:cursor-grabbing"
            )}
          >
            {!isMobile && <GripVertical className="h-5 w-5 text-muted-foreground" />}
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

  const hideCompleted = isMobile && orientation === 'portrait' && isSideBySide;

  return (
    <>
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent className="sm:top-[25%]">
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
        <AlertDialogContent className="sm:top-[25%]">
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
              ref={inputRef}
              name="newItemText"
              placeholder={listType === 'regular' ? "Add a regular item..." : "Add a one-off item..."}
              value={newItemText}
              onChange={(e) => {
                setNewItemText(e.target.value);
                if (showInputError) {
                    setShowInputError(false);
                }
              }}
              className={cn(showInputError && "border-destructive focus-visible:ring-destructive")}
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
            hideCompleted ? (
              <div className="mt-6 p-4 text-center text-muted-foreground border border-dashed rounded-lg">
                Completed items are hidden in this viewing mode.
              </div>
            ) : (
              <>
                <Separator className="my-6" />
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Completed ({completedItems.length})</h3>
                  <Button variant="ghost" size="sm" onClick={onSortCompletedItems}>
                    <SortAsc className="mr-2 h-4 w-4" />
                    Sort A-Z
                  </Button>
                </div>
                {renderItemList(completedItems, true)}
              </>
            )
          )}
        </CardContent>
      </Card>
    </>
  );
}
