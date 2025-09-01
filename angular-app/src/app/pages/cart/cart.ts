import { Component, OnInit } from '@angular/core';
import { Cart } from '../../models/cart.model';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.html',
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
    this.cartService
      .removeItem(this.cart.userId, productId)
      .subscribe((cart) => {
        this.cart = cart;
        this.cartService.updateCartState(cart);
      });
  }
}
