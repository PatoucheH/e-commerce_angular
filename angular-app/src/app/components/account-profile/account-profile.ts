import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User } from '../../services/auth.service';
import { AccountInfoComponent } from '../account-info/account-info';
import { PasswordChangeComponent } from '../account-password-change/account-password-change';
import { OrdersListComponent } from '../account-order-list/account-order-list';
import { Product } from '../../models/product.model';
import { ProductFormModalComponent } from '../add-product/add-product';

@Component({
  selector: 'app-user-profile',
  imports: [
    CommonModule,
    AccountInfoComponent,
    PasswordChangeComponent,
    OrdersListComponent,
    ProductFormModalComponent,
  ],
  templateUrl: './account-profile.html',
})
export class UserProfileComponent implements OnInit {
  @Input() user: User | null = null;
  @Output() logoutRequested = new EventEmitter<void>();

  isProductModalOpen = false;
  selectedProduct: Product | null = null;

  ngOnInit(): void {
    // Composant initialisé
  }

  onLogout(): void {
    this.logoutRequested.emit();
  }

  openAddProductModal() {
    this.selectedProduct = null; // Pour le mode création
    this.isProductModalOpen = true;
  }

  openEditProductModal(product: Product) {
    this.selectedProduct = product; // Pour le mode édition
    this.isProductModalOpen = true;
  }

  closeProductModal() {
    this.isProductModalOpen = false;
    this.selectedProduct = null;
  }

  onProductSaved(product: Product) {
    // Ici vous pouvez ajouter la logique pour rafraîchir la liste des produits
    // ou afficher une notification de succès
    console.log('Produit sauvegardé:', product);

    // Exemple : rafraîchir une liste de produits si vous en avez une
    // this.loadProducts();

    // Exemple : afficher une notification
    // this.showSuccessMessage(this.selectedProduct ? 'Produit modifié avec succès' : 'Produit ajouté avec succès');
  }
}
