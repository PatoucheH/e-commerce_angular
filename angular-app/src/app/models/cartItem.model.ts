import { Product } from './product.model';

export interface CartItem {
  id: number;
  productId: number;
  product?: Product;
  productName: string;
  quantity: number;
  unitPrice: number;
  cartId: number;
}
