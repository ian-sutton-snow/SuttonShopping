'use client';

import ShoppingListClient from '@/components/ShoppingListClient';
import { useParams } from 'next/navigation';

export default function ListPage() {
  const params = useParams();
  const storeId = typeof params.storeId === 'string' ? params.storeId : '';

  return <ShoppingListClient storeId={storeId} />;
}
