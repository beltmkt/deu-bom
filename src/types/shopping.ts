export interface ShoppingListItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  estimatedPrice: number | null;
  checked: boolean;
  createdAt: string;
  updatedAt: string;
}
