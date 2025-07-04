
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

  const reorderStores = useCallback((startIndex: number, endIndex: number) => {
    setStores(prevStores => {
      const result = Array.from(prevStores);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    });
  }, []);

  const getStore = useCallback((storeId: string) => {
    return stores.find((s) => s.id === storeId);
  }, [stores]);

  const updateStoreUnsafe = useCallback((storeId: string, updatedStoreData: Partial<Store>) => {
    setStores((prevStores) =>
      prevStores.map((store) =>
        store.id === storeId ? { ...store, ...updatedStoreData } : store
      )
    );
  }, []);
  
  const addItem = useCallback((storeId: string, listType: 'regular' | 'oneOff', text: string) => {
    const newItem: Item = { id: crypto.randomUUID(), text, completed: false };
    const store = getStore(storeId);
    if (store) {
      const updatedLists = { ...store.lists };
      updatedLists[listType] = [newItem, ...updatedLists[listType]];
      updateStoreUnsafe(storeId, { lists: updatedLists });
    }
  }, [getStore, updateStoreUnsafe]);

  const toggleItem = useCallback((storeId: string, listType: 'regular' | 'oneOff', itemId: string) => {
    const store = getStore(storeId);
    if (!store) return;

    let updatedLists = { ...store.lists };
    if (listType === 'oneOff') {
      updatedLists.oneOff = updatedLists.oneOff.filter((item) => item.id !== itemId);
    } else {
      updatedLists.regular = updatedLists.regular.map((item) =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      );
    }
    updateStoreUnsafe(storeId, { lists: updatedLists });
  }, [getStore, updateStoreUnsafe]);
  
  const restoreItem = useCallback((storeId: string, listType: 'regular' | 'oneOff', item: Item) => {
    const store = getStore(storeId);
    if (store) {
        const updatedLists = { ...store.lists };
        updatedLists[listType] = [item, ...updatedLists[listType]];
        updateStoreUnsafe(storeId, { lists: updatedLists });
    }
  }, [getStore, updateStoreUnsafe]);

  const reorderItems = useCallback((storeId: string, listType: 'regular' | 'oneOff', startIndex: number, endIndex: number) => {
    const store = getStore(storeId);
    if (!store) return;

    const list = [...store.lists[listType]];
    const [removed] = list.splice(startIndex, 1);
    list.splice(endIndex, 0, removed);

    const updatedLists = { ...store.lists, [listType]: list };
    updateStoreUnsafe(storeId, { lists: updatedLists });
  }, [getStore, updateStoreUnsafe]);

  const deleteItem = useCallback((storeId: string, listType: 'regular' | 'oneOff', itemId: string) => {
    const store = getStore(storeId);
    if (!store) return;

    const list = store.lists[listType].filter(item => item.id !== itemId);
    const updatedLists = { ...store.lists, [listType]: list };
    updateStoreUnsafe(storeId, { lists: updatedLists });
  }, [getStore, updateStoreUnsafe]);

  const renameItem = useCallback((storeId: string, listType: 'regular' | 'oneOff', itemId: string, newText: string) => {
    const store = getStore(storeId);
    if (!store) return;

    const list = store.lists[listType].map(item => 
      item.id === itemId ? { ...item, text: newText } : item
    );
    const updatedLists = { ...store.lists, [listType]: list };
    updateStoreUnsafe(storeId, { lists: updatedLists });
  }, [getStore, updateStoreUnsafe]);

  const moveItem = useCallback((storeId: string, itemId: string) => {
     const store = getStore(storeId);
     if (!store) return;

     let itemToMove: Item | undefined;
     let sourceList: 'regular' | 'oneOff' | null = null;
     
     if (store.lists.regular.some(i => i.id === itemId)) {
       sourceList = 'regular';
       itemToMove = store.lists.regular.find(i => i.id === itemId);
     } else if (store.lists.oneOff.some(i => i.id === itemId)) {
       sourceList = 'oneOff';
       itemToMove = store.lists.oneOff.find(i => i.id === itemId);
     }

     if (!itemToMove || !sourceList) return;

     const destinationList = sourceList === 'regular' ? 'oneOff' : 'regular';
     
     if (destinationList === 'oneOff' || destinationList === 'regular') {
        itemToMove.completed = false;
     }

     const updatedSourceList = store.lists[sourceList].filter(i => i.id !== itemId);
     const updatedDestinationList = [itemToMove, ...store.lists[destinationList]];
     
     const updatedLists = {
       ...store.lists,
       [sourceList]: updatedSourceList,
       [destinationList]: updatedDestinationList,
     };

     updateStoreUnsafe(storeId, { lists: updatedLists });
  }, [getStore, updateStoreUnsafe]);

  return { stores, addStore, editStore, deleteStore, reorderStores, getStore, addItem, toggleItem, reorderItems, deleteItem, renameItem, moveItem, restoreItem, isLoaded, iconComponents, icons };
};
