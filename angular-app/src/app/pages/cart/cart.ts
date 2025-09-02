import { Component, OnInit } from '@angular/core';
import { Cart } from '../../models/cart.model';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.html',
  imports: [RouterLink],
})
export class CartComponent implements OnInit {
  cart: Cart | null = null;
  private cartSubscription?: Subscription;

  constructor(
    private cartService: CartService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (!user) {
      console.error('Utilisateur non connecté');
      return;
    }
    this.cartService.getCart(user.id).subscribe({
      next: (cart) => {
        console.log('Panier chargé:', cart);
        this.cart = cart;
        this.cartService.updateCartState(cart);
      },
      error: (error) => {
        console.error('Error lros du chargement du panier:', error);
      },
    });

    this.cartSubscription = this.cartService.cart$.subscribe((cart) => {
      console.log('Panier mis à jour', cart);
      this.cart = cart;
    });
  }
  removeItem(productId: number) {
    if (!this.cart) return;

    const user = this.authService.getCurrentUser();
    if (!user) return;

    this.cartService.removeItem(this.cart.userId, productId).subscribe({
      next: () => {
        this.cartService.getCart(user.id).subscribe({
          next: (cart) => {
            this.cart = cart;
            this.cartService.updateCartState(cart);
          },
          error: (error) => {
            console.error('Erreur lors du rechargement du panier:', error);
          },
        });
      },
      error: (error) => {
        console.error('Erreur lors de la suppression:', error);
      },
    });
  }
}
