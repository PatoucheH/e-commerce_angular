import { Component, Input, ViewChild } from '@angular/core';
import { Product } from '../../models/product.model';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProductService } from '../../services/product.service';
import { RateService } from '../../services/rate.service';
import { Products } from '../../pages/products/products';
import { RatingModalComponent } from '../rate-product/rate-product';
import { ReviewsModalComponent } from '../detail-rating/detail-rating';

@Component({
  selector: 'app-product-modal',
  imports: [
    FormsModule,
    MatSnackBarModule,
    RatingModalComponent,
    ReviewsModalComponent,
  ],
  templateUrl: 'detail-product-component.html',
})
export class DetailProductComponent {
  @Input() product!: Product;
  @Input() parent!: Products;
  @ViewChild('ratingModal') ratingModal!: RatingModalComponent;

  isVisible: boolean = false;
  ratingVisible: boolean = false;
  reviewsVisible: boolean = false;
  quantity: number = 1;
  userId: string = '';

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private productService: ProductService,
    private rateService: RateService
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
  }

  closeRatingModal() {
    this.ratingVisible = false;
  }

  openReviewsModal() {
    this.reviewsVisible = true;
  }

  closeReviewsModal() {
    this.reviewsVisible = false;
  }

  onRatingSubmitted(event: { rating: number; comment: string }) {
    this.rateService
      .rateProduct(this.product.id, event.rating, event.comment)
      .subscribe({
        next: () => {
          this.snackBar.open(
            `Merci pour votre note : ${event.rating} ⭐`,
            'Fermer',
            { duration: 3000 }
          );
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
