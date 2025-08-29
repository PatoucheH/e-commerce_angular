import { Component, OnInit } from '@angular/core';
import { Cart } from '../../models/cart.model';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.html',
})
export class CartComponent implements OnInit {
  cart: Cart | null = null;

  constructor(
    private cartService: CartService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const userId = this.authService.getCurrentUser()!.id;
    this.cartService.getCart(userId).subscribe((cart) => {
      this.cart = cart;
      this.cartService.updateCartState(cart);
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
