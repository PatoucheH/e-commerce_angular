import { Component, Input } from '@angular/core';
import { Product } from '../../models/product.model';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProductService } from '../../services/product.service';
import { Products } from '../../pages/products/products';

@Component({
  selector: 'app-product-modal',
  imports: [FormsModule, MatSnackBarModule],
  templateUrl: './detail-product-component.html',
})
export class DetailProductComponent {
  @Input() product!: Product;
  @Input() parent!: Products;
  isVisible: boolean = false;

  ratingVisible: boolean = false;
  ratingValue: number = 0;
  ratingComment: string = '';

  quantity: number = 1;

  userId: string = '';
  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private productService: ProductService
  ) {}

  open(product: Product) {
    this.product = product;
    this.quantity = 1;
    this.isVisible = true;
    this.userId = this.authService.getCurrentUser()!.id;
  }

  close() {
    this.isVisible = false;
  }

  addToCart() {
    if (this.quantity < 1 || this.quantity > this.product.stock) return;
    const user = this.authService.getCurrentUser();
    if (user) {
      this.cartService
        .addItem(this.product.id, this.product.name, this.quantity)
        .subscribe(
          (updatedCart) => {
            this.cartService.updateCartState(updatedCart);
            this.snackBar.open(
              `✅ Produit ajouté : ${this.product.name} x${this.quantity}`,
              'Fermer',
              { duration: 3000 }
            );
            this.close();
          },
          (error) => {
            this.snackBar.open("❌ Erreur lors de l'ajout", 'Fermer', {
              duration: 3000,
            });
          }
        );
    } else {
      this.snackBar.open('⚠️ Utilisateur non connecté', 'Se connecter', {
        duration: 4000,
      });
    }
  }
  deleteProduct() {
    if (!this.product) return;

    const confirmDelete = confirm(
      `Voulez-vous vraiment supprimer le produit "${this.product.name}" ?`
    );

    if (!confirmDelete) return;

    this.productService.deleteProduct(this.product.id).subscribe({
      next: () => {
        this.snackBar.open('Produit supprimé ✅', 'Fermer', { duration: 3000 });
        this.close();

        if (this.parent) {
          this.parent.products = this.parent.products.filter(
            (p) => p.id !== this.product.id
          );
        }
      },
      error: (err) => {
        console.error(err);
        this.snackBar.open('Erreur lors de la suppression ❌', 'Fermer', {
          duration: 3000,
        });
      },
    });
  }

  openRatingModal() {
    this.ratingVisible = true;
    this.ratingValue = 0;
    this.ratingComment = '';
  }

  closeRatingModal() {
    this.ratingVisible = false;
  }

  submitRating() {
    if (this.ratingValue < 1 || this.ratingValue > 5) return;

    this.productService
      .rateProduct(this.product.id, this.ratingValue, this.ratingComment)
      .subscribe({
        next: () => {
          this.snackBar.open(
            `Merci pour votre note : ${this.ratingValue} ⭐`,
            'Fermer',
            { duration: 3000 }
          );
          this.closeRatingModal();
          this.parent?.chargerProducts();
        },
        error: (error) => {
          console.log(error);
          this.snackBar.open("Erreur lors de l'envoi de la note ❌", 'Fermer', {
            duration: 3000,
          });
        },
      });
  }
}
