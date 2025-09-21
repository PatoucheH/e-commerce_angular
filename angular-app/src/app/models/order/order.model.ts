import { OrderItem } from './orderItem.model';
import { OrderStatus } from './orderStatus.model';

export interface Order {
  id: number;
  userId: string;
  createdAt: string;
  totalPrice: number;
  status: OrderStatus;
  shippingAddress: string;
  itemList: OrderItem[];
  newStatus?: OrderStatus;
}
