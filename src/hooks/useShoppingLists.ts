'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Store, Item } from '@/lib/types';
import { Home, ShoppingBasket, ShoppingCart, Store as StoreIcon } from 'lucide-react';

const STORE_KEY = 'shopsphere-stores';

const icons = ['ShoppingCart', 'Store', 'Home', 'ShoppingBasket'];
const iconComponents: { [key: string]: React.ComponentType<{ className?: string }> } = {
  ShoppingCart,
  Store: StoreIcon,
  Home,
  ShoppingBasket,
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
    setStores(getInitialStores());
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        window.localStorage.setItem(STORE_KEY, JSON.stringify(stores));
      } catch (error) {
        console.error(error);
      }
    }
  }, [stores, isLoaded]);

  const addStore = useCallback((name: string) => {
    setStores((prevStores) => {
      const newStore: Store = {
        id: crypto.randomUUID(),
        name,
        icon: icons[prevStores.length % icons.length],
        lists: { regular: [], oneOff: [] },
      };
      return [...prevStores, newStore];
    });
  }, []);

  const getStore = useCallback((storeId: string) => {
    return stores.find((s) => s.id === storeId);
  }, [stores]);

  const updateStore = useCallback((updatedStore: Store) => {
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
      updateStore({ ...store, lists: updatedLists });
    }
  }, [getStore, updateStore]);

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
    updateStore({ ...store, lists: updatedLists });
  }, [getStore, updateStore]);

  const reorderItems = useCallback((storeId: string, listType: 'regular' | 'oneOff', startIndex: number, endIndex: number) => {
    const store = getStore(storeId);
    if (!store) return;

    const list = [...store.lists[listType]];
    const [removed] = list.splice(startIndex, 1);
    list.splice(endIndex, 0, removed);

    const updatedLists = { ...store.lists, [listType]: list };
    updateStore({ ...store, lists: updatedLists });
  }, [getStore, updateStore]);

  return { stores, addStore, getStore, addItem, toggleItem, reorderItems, isLoaded, iconComponents };
};
