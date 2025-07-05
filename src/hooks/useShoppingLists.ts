
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Store, Item } from '@/lib/types';
import { Home, ShoppingCart, Store as StoreIcon, Car, Sprout, Shirt, Dumbbell, Wine, Bike, Gift, BookOpen, Check } from 'lucide-react';

const STORE_KEY = 'shopsphere-stores';

export const icons = ['ShoppingCart', 'Store', 'Home', 'Car', 'Sprout', 'Shirt', 'Dumbbell', 'Wine', 'Bike', 'Gift', 'BookOpen', 'Check'];
export const iconComponents: { [key: string]: React.ComponentType<{ className?: string }> } = {
  ShoppingCart,
  Store: StoreIcon,
  Home,
  Car,
  Sprout,
  Shirt,
  Dumbbell,
  Wine,
  Bike,
  Gift,
  BookOpen,
  Check,
};

const getInitialStores = (): Store[] => {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const item = window.localStorage.getItem(STORE_KEY);
    return item ? JSON.parse(item) : [];
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const useShoppingLists = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setStores(getInitialStores());
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        window.localStorage.setItem(STORE_KEY, JSON.stringify(stores));
      } catch (error) {
        console.error('Failed to save stores to localStorage:', error);
      }
    }
  }, [stores, isLoaded]);

  const updateStore = useCallback((storeId: string, updateFn: (store: Store) => Store) => {
    setStores(prevStores => prevStores.map(store => store.id === storeId ? updateFn(store) : store));
  }, []);

  const addStore = useCallback((name: string, icon: string) => {
    setStores((prevStores) => {
      const newStore: Store = {
        id: crypto.randomUUID(),
        name,
        icon: icon || icons[0],
        lists: { regular: [], oneOff: [] },
      };
      return [...prevStores, newStore];
    });
  }, []);
  
  const editStore = useCallback((storeId: string, newName: string, newIcon: string) => {
    setStores(prevStores => 
      prevStores.map(store => 
        store.id === storeId ? { ...store, name: newName, icon: newIcon } : store
      )
    );
  }, []);

  const deleteStore = useCallback((storeId: string) => {
    setStores(prevStores => prevStores.filter(store => store.id !== storeId));
  }, []);

  const moveStoreOrder = useCallback((storeId: string, direction: 'up' | 'down') => {
    setStores(prevStores => {
      const storeIndex = prevStores.findIndex(s => s.id === storeId);
      if (storeIndex === -1) return prevStores;

      const newIndex = direction === 'up' ? storeIndex - 1 : storeIndex + 1;
      if (newIndex < 0 || newIndex >= prevStores.length) return prevStores;

      const reorderedStores = [...prevStores];
      const [movedStore] = reorderedStores.splice(storeIndex, 1);
      reorderedStores.splice(newIndex, 0, movedStore);
      return reorderedStores;
    });
  }, []);
  
  const addItem = useCallback((storeId: string, listType: 'regular' | 'oneOff', text: string) => {
    const newItem: Item = { id: crypto.randomUUID(), text, completed: false };
    updateStore(storeId, store => {
      const newLists = {
        ...store.lists,
        [listType]: [newItem, ...store.lists[listType]],
      };
      return { ...store, lists: newLists };
    });
  }, [updateStore]);

  const toggleItem = useCallback((storeId: string, listType: 'regular' | 'oneOff', itemId: string) => {
    updateStore(storeId, store => {
      const newLists = { ...store.lists };
      if (listType === 'oneOff') {
        newLists.oneOff = newLists.oneOff.filter(item => item.id !== itemId);
      } else {
        newLists.regular = newLists.regular.map(item =>
          item.id === itemId ? { ...item, completed: !item.completed } : item
        );
      }
      return { ...store, lists: newLists };
    });
  }, [updateStore]);

  const restoreOneOffItem = useCallback((storeId: string, item: Item) => {
    updateStore(storeId, store => {
      const newLists = { ...store.lists };
      const itemExists = newLists.oneOff.some(i => i.id === item.id);
      if (!itemExists) {
        newLists.oneOff = [item, ...newLists.oneOff];
      }
      return { ...store, lists: newLists };
    });
  }, [updateStore]);
  
  const deleteItem = useCallback((storeId: string, listType: 'regular' | 'oneOff', itemId: string) => {
    updateStore(storeId, store => {
      const list = store.lists[listType].filter(item => item.id !== itemId);
      return {
        ...store,
        lists: {
          ...store.lists,
          [listType]: list,
        }
      };
    });
  }, [updateStore]);

  const renameItem = useCallback((storeId: string, listType: 'regular' | 'oneOff', itemId: string, newText: string) => {
    updateStore(storeId, store => {
      const list = store.lists[listType].map(item => 
        item.id === itemId ? { ...item, text: newText } : item
      );
      return {
        ...store,
        lists: {
          ...store.lists,
          [listType]: list,
        }
      };
    });
  }, [updateStore]);

  const moveItem = useCallback((storeId: string, itemId: string) => {
    updateStore(storeId, store => {
      let itemToMove: Item | undefined;
      let sourceList: 'regular' | 'oneOff' | null = null;
      
      if (store.lists.regular.some(i => i.id === itemId)) {
        sourceList = 'regular';
        itemToMove = store.lists.regular.find(i => i.id === itemId);
      } else if (store.lists.oneOff.some(i => i.id === itemId)) {
        sourceList = 'oneOff';
        itemToMove = store.lists.oneOff.find(i => i.id === itemId);
      }

      if (!itemToMove || !sourceList) return store;

      const destinationList = sourceList === 'regular' ? 'oneOff' : 'regular';
      itemToMove = { ...itemToMove, completed: false };

      const updatedSourceList = store.lists[sourceList].filter(i => i.id !== itemId);
      const updatedDestinationList = [itemToMove, ...store.lists[destinationList]];
      
      return {
        ...store,
        lists: {
          ...store.lists,
          [sourceList]: updatedSourceList,
          [destinationList]: updatedDestinationList,
        }
      };
    });
  }, [updateStore]);

  const moveItemOrder = useCallback((storeId: string, itemId: string, direction: 'up' | 'down') => {
    updateStore(storeId, store => {
        let listType: 'regular' | 'oneOff' | null = null;
        let isCompleted = false;

        let regularItem = store.lists.regular.find(i => i.id === itemId);
        if (regularItem) {
            listType = 'regular';
            isCompleted = regularItem.completed;
        } else if (store.lists.oneOff.some(i => i.id === itemId)) {
            listType = 'oneOff';
        } else {
            return store;
        }

        const listToReorder = listType === 'regular' 
            ? (isCompleted ? store.lists.regular.filter(i => i.completed) : store.lists.regular.filter(i => !i.completed))
            : store.lists.oneOff;
        
        const itemIndex = listToReorder.findIndex(i => i.id === itemId);
        if (itemIndex === -1) return store;

        const newIndex = direction === 'up' ? itemIndex - 1 : itemIndex + 1;
        if (newIndex < 0 || newIndex >= listToReorder.length) return store;

        const reorderedSubList = [...listToReorder];
        const [item] = reorderedSubList.splice(itemIndex, 1);
        reorderedSubList.splice(newIndex, 0, item);
        
        let finalRegularList: Item[];
        if (listType === 'regular') {
          const otherHalf = isCompleted ? store.lists.regular.filter(i => !i.completed) : store.lists.regular.filter(i => i.completed);
          finalRegularList = isCompleted ? [...otherHalf, ...reorderedSubList] : [...reorderedSubList, ...otherHalf];
        } else {
          finalRegularList = store.lists.regular;
        }

        return {
          ...store,
          lists: {
            regular: listType === 'regular' ? finalRegularList : store.lists.regular,
            oneOff: listType === 'oneOff' ? reorderedSubList : store.lists.oneOff,
          }
        };
    });
  }, [updateStore]);

  return { stores, addStore, editStore, deleteStore, moveStoreOrder, addItem, toggleItem, deleteItem, renameItem, moveItem, moveItemOrder, isLoaded, iconComponents, icons, restoreOneOffItem };
};
