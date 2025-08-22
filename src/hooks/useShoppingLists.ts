'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Store, Item } from '@/lib/types';
import { Home, ShoppingCart, Store as StoreIcon, Car, Sprout, Shirt, Dumbbell, Wine, Bike, Gift, BookOpen, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { 
  collection, 
  doc, 
  onSnapshot, 
  writeBatch,
  query,
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';

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

export const useShoppingLists = () => {
  const { user, firebaseServices } = useAuth();
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const db = firebaseServices?.db;

  useEffect(() => {
    // If we have a user and a database connection, set up the listener.
    if (user && db) {
      const storesCollectionRef = collection(db, 'users', user.uid, 'stores');
      const q = query(storesCollectionRef, orderBy('order', 'asc'));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const storesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Store));
        setStores(storesData);
        setIsLoaded(true);
      }, (error) => {
        console.error("Error fetching stores:", error);
        setIsLoaded(true); // Still finish loading even if there's an error
      });

      // Cleanup the listener when the component unmounts or user changes.
      return () => unsubscribe();
    } else if (!user) {
      // If there's no user, we are not loading data from the server.
      // We can consider the "loading" phase complete.
      setStores([]); // Clear any previous user's data
      setIsLoaded(true);
    }
    // Note: If there's a user but no db, we wait. `isLoaded` remains false.
  }, [user, db]);

  const updateStoreLists = useCallback(async (storeId: string, newLists: { regular: Item[], oneOff: Item[] }) => {
      if (!user || !db) return;
      const storeRef = doc(db, 'users', user.uid, 'stores', storeId);
      await updateDoc(storeRef, { lists: newLists });
  }, [user, db]);

  const addStore = useCallback(async (name: string, icon: string) => {
    if (!user || !db) return;
    const newOrder = stores.length;
    await addDoc(collection(db, 'users', user.uid, 'stores'), {
      name,
      icon: icon || icons[0],
      lists: { regular: [], oneOff: [] },
      order: newOrder,
    });
  }, [user, db, stores.length]);
  
  const editStore = useCallback(async (storeId: string, newName: string, newIcon: string) => {
    if (!user || !db) return;
    const storeRef = doc(db, 'users', user.uid, 'stores', storeId);
    await updateDoc(storeRef, { name: newName, icon: newIcon });
  }, [user, db]);

  const deleteStore = useCallback(async (storeId: string) => {
    if (!user || !db) return;
    const storeRef = doc(db, 'users', user.uid, 'stores', storeId);
    await deleteDoc(storeRef);
    // Note: The onSnapshot listener will automatically update the UI.
    // We may want to re-order the remaining items if order is important after a delete.
    const remainingStores = stores.filter(s => s.id !== storeId);
    const batch = writeBatch(db);
    remainingStores.forEach((store, index) => {
        if (store.order !== index) {
            const storeRef = doc(db, 'users', user.uid, 'stores', store.id);
            batch.update(storeRef, { order: index });
        }
    });
    await batch.commit();

  }, [user, db, stores]);

  const reorderStores = useCallback(async (dragIndex: number, hoverIndex: number) => {
    if (!user || !db) return;
    
    const newStores = [...stores];
    const [draggedItem] = newStores.splice(dragIndex, 1);
    newStores.splice(hoverIndex, 0, draggedItem);
    
    const batch = writeBatch(db);
    newStores.forEach((store, index) => {
      const storeRef = doc(db, 'users', user.uid, 'stores', store.id);
      batch.update(storeRef, { order: index });
    });
    
    await batch.commit();
  }, [user, db, stores]);
  
  const moveStoreOrder = useCallback(async (storeId: string, direction: 'up' | 'down') => {
    if (!user || !db) return;
    const storeIndex = stores.findIndex(s => s.id === storeId);
    if (storeIndex === -1) return;

    const newIndex = direction === 'up' ? storeIndex - 1 : storeIndex + 1;
    if (newIndex < 0 || newIndex >= stores.length) return;

    await reorderStores(storeIndex, newIndex);
  }, [user, db, stores, reorderStores]);
  
  const addItem = useCallback((storeId: string, listType: 'regular' | 'oneOff', text: string) => {
    const store = stores.find(s => s.id === storeId);
    if (!store) return;
    const newItem: Item = { id: crypto.randomUUID(), text, completed: false };
    const newLists = {
      ...store.lists,
      [listType]: [newItem, ...store.lists[listType]],
    };
    updateStoreLists(storeId, newLists);
  }, [stores, updateStoreLists]);

  const toggleItem = useCallback((storeId: string, listType: 'regular' | 'oneOff', itemId: string) => {
    const store = stores.find(s => s.id === storeId);
    if (!store) return;

    const newLists = { ...store.lists };
    if (listType === 'oneOff') {
      newLists.oneOff = newLists.oneOff.filter(item => item.id !== itemId);
    } else {
      newLists.regular = newLists.regular.map(item =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      );
    }
    updateStoreLists(storeId, newLists);
  }, [stores, updateStoreLists]);

  const restoreOneOffItem = useCallback((storeId: string, item: Item) => {
    const store = stores.find(s => s.id === storeId);
    if (!store) return;
    const newLists = { ...store.lists };
    const itemExists = newLists.oneOff.some(i => i.id === item.id);
    if (!itemExists) {
      newLists.oneOff = [item, ...newLists.oneOff];
    }
    updateStoreLists(storeId, newLists);
  }, [stores, updateStoreLists]);
  
  const deleteItem = useCallback((storeId: string, listType: 'regular' | 'oneOff', itemId: string) => {
    const store = stores.find(s => s.id === storeId);
    if (!store) return;

    const list = store.lists[listType].filter(item => item.id !== itemId);
    const newLists = {
      ...store.lists,
      [listType]: list,
    };
    updateStoreLists(storeId, newLists);
  }, [stores, updateStoreLists]);

  const renameItem = useCallback((storeId: string, listType: 'regular' | 'oneOff', itemId: string, newText: string) => {
    const store = stores.find(s => s.id === storeId);
    if (!store) return;
    const list = store.lists[listType].map(item => 
      item.id === itemId ? { ...item, text: newText } : item
    );
    const newLists = {
      ...store.lists,
      [listType]: list,
    };
    updateStoreLists(storeId, newLists);
  }, [stores, updateStoreLists]);

  const moveItem = useCallback((storeId: string, itemId: string) => {
    const store = stores.find(s => s.id === storeId);
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
    itemToMove = { ...itemToMove, completed: false };

    const updatedSourceList = store.lists[sourceList].filter(i => i.id !== itemId);
    const updatedDestinationList = [itemToMove, ...store.lists[destinationList]];
    
    const newLists = {
      ...store.lists,
      [sourceList]: updatedSourceList,
      [destinationList]: updatedDestinationList,
    };
    updateStoreLists(storeId, newLists);
  }, [stores, updateStoreLists]);

  const reorderList = (list: Item[], dragIndex: number, hoverIndex: number) => {
    const reorderedList = [...list];
    const [draggedItem] = reorderedList.splice(dragIndex, 1);
    reorderedList.splice(hoverIndex, 0, draggedItem);
    return reorderedList;
  };
  
  const moveItemOrder = useCallback((storeId: string, itemId: string, direction: 'up' | 'down') => {
    const store = stores.find(s => s.id === storeId);
    if (!store) return;

    let listType: 'regular' | 'oneOff' | null = null;
    let isCompleted = false;

    let regularItem = store.lists.regular.find(i => i.id === itemId);
    if (regularItem) {
        listType = 'regular';
        isCompleted = regularItem.completed;
    } else if (store.lists.oneOff.some(i => i.id === itemId)) {
        listType = 'oneOff';
    } else {
        return;
    }

    let newLists: { regular: Item[], oneOff: Item[] };
    if (listType === 'oneOff') {
        const itemIndex = store.lists.oneOff.findIndex(i => i.id === itemId);
        const newIndex = direction === 'up' ? itemIndex - 1 : itemIndex + 1;
        if (newIndex < 0 || newIndex >= store.lists.oneOff.length) return;
        newLists = {...store.lists, oneOff: reorderList(store.lists.oneOff, itemIndex, newIndex)};
    } else {
        const activeItems = store.lists.regular.filter(i => !i.completed);
        const completedItems = store.lists.regular.filter(i => i.completed);
        const listToReorder = isCompleted ? completedItems : activeItems;
        const itemIndex = listToReorder.findIndex(i => i.id === itemId);
        const newIndex = direction === 'up' ? itemIndex - 1 : itemIndex + 1;
        if (newIndex < 0 || newIndex >= listToReorder.length) return;
        const reorderedSubList = reorderList(listToReorder, itemIndex, newIndex);
        const finalRegularList = isCompleted ? [...activeItems, ...reorderedSubList] : [...reorderedSubList, ...completedItems];
        newLists = {...store.lists, regular: finalRegularList};
    }
    updateStoreLists(storeId, newLists);
  }, [stores, updateStoreLists]);

  const reorderItems = useCallback((storeId: string, listType: 'regular' | 'oneOff', isCompletedList: boolean, dragIndex: number, hoverIndex: number) => {
    const store = stores.find(s => s.id === storeId);
    if (!store) return;

    if (listType === 'oneOff') {
      const newOneOffList = reorderList(store.lists.oneOff, dragIndex, hoverIndex);
      updateStoreLists(storeId, { ...store.lists, oneOff: newOneOffList });
      return;
    }
    
    const activeItems = store.lists.regular.filter(i => !i.completed);
    const completedItems = store.lists.regular.filter(i => i.completed);
    
    let newList: Item[];
    if (isCompletedList) {
        const reorderedCompleted = reorderList(completedItems, dragIndex, hoverIndex);
        newList = [...activeItems, ...reorderedCompleted];
    } else {
        const reorderedActive = reorderList(activeItems, dragIndex, hoverIndex);
        newList = [...reorderedActive, ...completedItems];
    }
    updateStoreLists(storeId, { ...store.lists, regular: newList });
  }, [stores, updateStoreLists]);

  return { stores, addStore, editStore, deleteStore, reorderStores, moveStoreOrder, addItem, toggleItem, deleteItem, renameItem, moveItem, moveItemOrder, reorderItems, isLoaded, iconComponents, icons, restoreOneOffItem };
};
