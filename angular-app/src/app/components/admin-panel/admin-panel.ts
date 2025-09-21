import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { OrderStatistics } from '../../models/order/orderStatistics.model';
import { Order } from '../../models/order/order.model';
import { OrderStatus } from '../../models/order/orderStatus.model';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: 'admin-panel.html',
})
export class AdminPanelComponent implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  stats: OrderStatistics | null = null;
  selectedStatus: OrderStatus | undefined = undefined;
  selectedOrderId: number | null = null;
  loading = false;
  successMessage = '';
  errorMessage = '';
  OrderStatus = OrderStatus;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadOrders();
    this.loadStatistics();
  }

  loadOrders(): void {
    this.loading = true;
    this.clearMessages();

    this.adminService.getAllOrders().subscribe({
      next: (orders) => {
        this.orders = orders.map((order) => ({
          ...order,
          newStatus: order.status,
        }));
        this.filterOrders(); // Applique le filtre après le chargement
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des commandes:', error);
        this.errorMessage = 'Erreur lors du chargement des commandes';
        this.loading = false;
      },
    });
  }

  loadStatistics(): void {
    this.adminService.getOrderStatistics().subscribe({
      next: (stats) => {
        this.stats = stats;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des statistiques:', error);
      },
    });
  }

  filterOrders(): void {
    if (this.selectedStatus === undefined || this.selectedStatus === null) {
      // Si aucun statut n'est sélectionné, afficher toutes les commandes
      this.filteredOrders = [...this.orders];
    } else {
      // Filtrer par statut sélectionné
      this.filteredOrders = this.orders.filter(
        (order) => order.status === this.selectedStatus
      );
    }

    console.log('Filtrage appliqué:', {
      selectedStatus: this.selectedStatus,
      totalOrders: this.orders.length,
      filteredOrders: this.filteredOrders.length,
    });
  }

  // Nouvelle méthode pour gérer le changement de statut dans le select
  onStatusFilterChange(): void {
    console.log('Changement de filtre:', this.selectedStatus);
    this.filterOrders();
    // Fermer les détails ouverts lors du changement de filtre
    this.selectedOrderId = null;
  }

  updateOrderStatus(order: Order): void {
    if (order.newStatus === undefined || order.newStatus === order.status) {
      return;
    }

    this.clearMessages();

    this.adminService.updateOrderStatus(order.id, order.newStatus).subscribe({
      next: (response) => {
        // Mettre à jour le statut dans l'objet order
        order.status = order.newStatus!;
        this.successMessage = `Statut de la commande #${order.id} mis à jour avec succès`;
        this.loadStatistics(); // Recharger les statistiques

        // Réappliquer le filtre au cas où la commande ne correspond plus au filtre actuel
        this.filterOrders();

        // Effacer le message après 3 secondes
        setTimeout(() => (this.successMessage = ''), 3000);
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour du statut:', error);
        this.errorMessage = `Erreur lors de la mise à jour du statut de la commande #${order.id}`;

        // Remettre l'ancien statut en cas d'erreur
        order.newStatus = order.status;

        setTimeout(() => (this.errorMessage = ''), 5000);
      },
    });
  }

  toggleOrderDetails(order: Order): void {
    this.selectedOrderId = this.selectedOrderId === order.id ? null : order.id;
  }

  getStatusLabel(status: OrderStatus): string {
    return this.adminService.getStatusLabel(status);
  }

  getStatusColor(status: OrderStatus): string {
    return this.adminService.getStatusColor(status);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  private clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }
}
