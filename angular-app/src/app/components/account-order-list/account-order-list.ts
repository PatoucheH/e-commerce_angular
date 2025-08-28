// orders-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService, Order, OrderStatus } from '../../services/order.service';

@Component({
  selector: 'app-orders-list',
  imports: [CommonModule, RouterLink],
  templateUrl: './account-order-list.html',
})
export class OrdersListComponent implements OnInit {
  ordersLoading = false;
  ordersError = '';
  orders: Order[] = [];
  selectedOrder: Order | null = null;

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.loadUserOrders();
  }

  loadUserOrders(): void {
    this.ordersLoading = true;
    this.ordersError = '';

    this.orderService.getUserOrders().subscribe({
      next: (orders) => {
        this.ordersLoading = false;
        this.orders = orders.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      },
      error: (error) => {
        this.ordersLoading = false;
        console.error('Erreur chargement commandes:', error);
        this.ordersError = 'Erreur lors du chargement des commandes';
      },
    });
  }

  viewOrderDetails(order: Order): void {
    this.selectedOrder = this.selectedOrder?.id === order.id ? null : order;
  }

  getStatusLabel(status: OrderStatus): string {
    return this.orderService.getStatusLabel(status);
  }

  getStatusColor(status: OrderStatus): string {
    return this.orderService.getStatusColor(status);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
