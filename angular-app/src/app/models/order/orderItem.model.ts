export interface OrderItem {
  id: number;
  productId: number;
  productName?: string;
  quantity: number;
  unitPrice: number;
  orderId: number;
}
