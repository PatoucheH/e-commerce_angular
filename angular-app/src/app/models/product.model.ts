export interface Product {
  id: number;
  name: string;
  sellerId: string;
  price: number;
  type?: string;
  description?: string;
  imageUrl?: string;
  averageRating: number;
  totalRatings: number;
  stock: number;
}
