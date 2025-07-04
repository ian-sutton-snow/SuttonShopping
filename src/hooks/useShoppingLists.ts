
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Store, Item } from '@/lib/types';
import { Home, ShoppingBasket, ShoppingCart, Store as StoreIcon, Car, Sprout, Shirt, Dumbbell } from 'lucide-react';

const STORE_KEY = 'shopsphere-stores';

export const icons = ['ShoppingCart', 'Store', 'Home', 'ShoppingBasket', 'Car', 'Sprout', 'Shirt', 'Dumbbell'];
export const iconComponents: { [key: string]: React.ComponentType<{ className?: string }> } = {
  ShoppingCart,
  Store: StoreIcon,
  Home,
  ShoppingBasket,
  Car,
  Sprout,
  Shirt,
  Dumbbell,
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
  const [stores, setStores] = useState<Store[]>(getInitialStores);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // On initial mount, read from localStorage
    if (!isLoaded) {
      setStores(getInitialStores());
      setIsLoaded(true);
    }
  }, [isLoaded]);

  useEffect(() => {
    // Persist to localStorage whenever stores change
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

  const updateStoreUnsafe = useCallback((updatedStore: Store) => {
    setStores((prevStores) =>
      prevStores.map((store) => (store.id === updatedStore.id ? updatedStore : store))
    );
  }, []);

  const addItem = useCallback((storeId: string, listType: 'regular' | 'oneOff', text: string) => {
    const newItem: Item = { id: crypto.randomUUID(), text, completed: false };
    const store = getStore(storeId);
    if (store) {
      const updatedLists = { ...store.lists };
      updatedLists[listType] = [newItem, ...updatedLists[listType]];
      updateStoreUnsafe({ ...store, lists: updatedLists });
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
    updateStoreUnsafe({ ...store, lists: updatedLists });
  }, [getStore, updateStoreUnsafe]);

  const reorderItems = useCallback((storeId: string, listType: 'regular' | 'oneOff', startIndex: number, endIndex: number) => {
    const store = getStore(storeId);
    if (!store) return;

    const list = [...store.lists[listType]];
    const [removed] = list.splice(startIndex, 1);
    list.splice(endIndex, 0, removed);

    const updatedLists = { ...store.lists, [listType]: list };
    updateStoreUnsafe({ ...store, lists: updatedLists });
  }, [getStore, updateStoreUnsafe]);

  return { stores, addStore, editStore, deleteStore, reorderStores, getStore, addItem, toggleItem, reorderItems, isLoaded, iconComponents, icons };
};
