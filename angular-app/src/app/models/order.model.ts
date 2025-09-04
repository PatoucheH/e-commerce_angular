import { OrderItem } from './orderItem.model';

export interface order {
  id: number;
  userId: string;
  itemList: OrderItem[];
  totalPrice: number;
}
