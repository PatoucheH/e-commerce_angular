import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Order } from '../models/order/order.model';
import { OrderStatus } from '../models/order/orderStatus.model';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private apiUrl = 'http://localhost:5147/api/Order';

  constructor(private http: HttpClient) {}

  getUserOrders(): Observable<Order[]> {
    return this.http
      .get<Order[]>(`${this.apiUrl}`, { withCredentials: true })
      .pipe(catchError(this.handleError));
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

  private handleError(error: HttpErrorResponse) {
    let errorMessage = '';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 401:
          errorMessage = 'Vous devez vous connecter';
          break;
        case 403:
          errorMessage = 'accès réfuse';
          break;
        case 404:
          errorMessage = 'Not find ';
          break;
        case 500:
          errorMessage = 'erreur serveur interne';
          break;
        default:
          errorMessage = `Error: ${error.status} - ${error.message}`;
      }
    }

    console.error('Erreur détaillée:', error);
    return throwError(() => new Error(errorMessage));
  }
}
