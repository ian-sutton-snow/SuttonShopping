'use client';

import * as React from 'react';
import { Item } from '@/lib/types';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Plus, GripVertical } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { cn } from '@/lib/utils';
import { Separator } from './ui/separator';

interface ShoppingListProps {
  listType: 'regular' | 'oneOff';
  items: Item[];
  onAddItem: (text: string) => void;
  onToggleItem: (itemId: string) => void;
  onReorder: (startIndex: number, endIndex: number) => void;
}

export default function ShoppingList({ listType, items, onAddItem, onToggleItem, onReorder }: ShoppingListProps) {
  const [newItemText, setNewItemText] = React.useState('');
  const [removingItems, setRemovingItems] = React.useState<string[]>([]);
  const dragItem = React.useRef<number | null>(null);
  const dragOverItem = React.useRef<number | null>(null);

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
    if (dragItem.current === null || dragOverItem.current === null) return;
    onReorder(dragItem.current, dragOverItem.current);
    dragItem.current = null;
    dragOverItem.current = null;
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
            draggable={!isCompletedList}
            onDragStart={() => (dragItem.current = originalIndex)}
            onDragEnter={() => (dragOverItem.current = originalIndex)}
            onDragEnd={handleDragSort}
            onDragOver={(e) => e.preventDefault()}
            className={cn(
              "flex items-center gap-2 p-3 rounded-lg bg-white/80 shadow-sm transition-all duration-300",
              isRemoving ? 'animate-item-remove' : 'animate-item-add',
              !isCompletedList && 'cursor-grab active:cursor-grabbing'
            )}
          >
            {!isCompletedList && <GripVertical className="h-5 w-5 text-muted-foreground" />}
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
          </div>
        );
      })}
    </div>
  );

  return (
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
  );
}
