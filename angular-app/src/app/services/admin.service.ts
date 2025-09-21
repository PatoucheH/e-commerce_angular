import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order } from '../models/order/order.model';
import { OrderStatus } from '../models/order/orderStatus.model';
import { OrderStatistics } from '../models/order/orderStatistics.model';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private apiUrl = 'http://localhost:5147/api/Order';

  constructor(private http: HttpClient) {}

  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/admin/all`, {
      withCredentials: true,
    });
  }

  getOrderStatistics(): Observable<OrderStatistics> {
    return this.http.get<OrderStatistics>(`${this.apiUrl}/admin/stats`, {
      withCredentials: true,
    });
  }

  updateOrderStatus(orderId: number, newStatus: OrderStatus): Observable<any> {
    return this.http.post(`${this.apiUrl}/${orderId}/status`, newStatus, {
      withCredentials: true,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Méthode utilitaire pour filtrer les commandes par statut
  filterOrdersByStatus(orders: Order[], status?: OrderStatus): Order[] {
    if (status === undefined) return orders;
    return orders.filter((order) => order.status === status);
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
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case OrderStatus.Confirmed:
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case OrderStatus.Shipped:
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case OrderStatus.Delivered:
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  }
}
