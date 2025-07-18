import type { LucideIcon } from 'lucide-react';

export interface Item {
  id: string;
  text: string;
  completed: boolean;
}

export interface Store {
  id: string;
  name: string;
  icon: string; // Storing icon name from lucide-react
  order: number;
  lists: {
    regular: Item[];
    oneOff: Item[];
  };
}
