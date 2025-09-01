import { Component, Input } from '@angular/core';
import { Product } from '../../models/product.model';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-product-modal',
  imports: [FormsModule],
  templateUrl: './detail-product-component.html',
})
export class DetailProductComponent {
  @Input() product!: Product;
  isVisible: boolean = false;

  quantity: number = 1;

  constructor(
    private cartService: CartService,
    private authService: AuthService
  ) {}

  open(product: Product) {
    this.product = product;
    this.quantity = 1;
    this.isVisible = true;
  }

  close() {
    this.isVisible = false;
  }

  addToCart() {
    if (this.quantity < 1 || this.quantity > this.product.stock) return;
    const user = this.authService.getCurrentUser();
    console.log(user);
    console.log(this.quantity);
    if (user) {
      this.cartService
        .addItem(user.id, this.product.id, this.quantity)
        .subscribe(
          (updatedCart) => {
            this.cartService.updateCartState(updatedCart);
            console.log('Panier à jour');
            this.close();
          },
          (error) => {
            console.log("Error lors de l'ajout", error);
          }
        );
      console.log(`Ajout au panier: ${this.product.name} x${this.quantity}`);
      alert(`Produit ajouté au panier: ${this.product.name} x${this.quantity}`);
      this.close();
    } else {
      console.log('Utilisateur non connecté');
      alert('Utilisateur non connecté ');
    }
  }
}
