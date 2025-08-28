import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface OrderItem {
  id: number;
  productId: number;
  productName?: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: number;
  userId: string;
  createdAt: string;
  total: number;
  status: OrderStatus;
  shippingAddress: string;
  items: OrderItem[];
}

export enum OrderStatus {
  Pending = 0,
  Confirmed = 1,
  Shipped = 2,
  Delivered = 3,
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'http://localhost:5147/api/Order';

  constructor(private http: HttpClient) {}

  getUserOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}`);
  }

  getOrderById(orderId: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${orderId}`);
  }

  // Méthode utilitaire pour obtenir le libellé du statut
  getStatusLabel(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.Pending:
        return 'En attente';
      case OrderStatus.Confirmed:
        return 'En cours de traitement';
      case OrderStatus.Shipped:
        return 'Expédiée';
      case OrderStatus.Delivered:
        return 'Livrée';
      default:
        return 'Statut inconnu';
    }
  }

  // Méthode utilitaire pour obtenir la couleur du statut
  getStatusColor(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.Pending:
        return 'text-yellow-600 bg-yellow-50';
      case OrderStatus.Confirmed:
        return 'text-blue-600 bg-blue-50';
      case OrderStatus.Shipped:
        return 'text-purple-600 bg-purple-50';
      case OrderStatus.Delivered:
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  }
}