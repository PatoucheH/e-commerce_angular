import { Component, OnInit, OnDestroy } from '@angular/core';
import { Cart } from '../../models/cart.model';
import { CartService } from '../../services/cart.service';
import { Subscription } from 'rxjs';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { loadStripe, Stripe } from '@stripe/stripe-js';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.html',
  imports: [RouterLink],
})
export class CartComponent implements OnInit, OnDestroy {
  cart: Cart | null = null;
  private cartSubscription?: Subscription;
  private stripePromise!: Promise<Stripe | null>;

  constructor(private cartService: CartService, private http: HttpClient) {
    this.http
      .get<{ key: string }>(
        'http://localhost:5147/api/Payment/stripe-public-key'
      )
      .subscribe((res) => {
        this.stripePromise = loadStripe(res.key);
      });
  }

  ngOnInit(): void {
    // Charger le panier de l'utilisateur connecté
    this.cartService.getCart().subscribe({
      next: (cart) => {
        console.log('Panier chargé:', cart);
        this.cart = cart;
        this.cartService.updateCartState(cart);
      },
      error: (error) => {
        console.error('Erreur lors du chargement du panier:', error);
      },
    });

    // Écouter les mises à jour du panier
    this.cartSubscription = this.cartService.cart$.subscribe((cart) => {
      this.cart = cart;
    });
  }

  removeItem(productId: number) {
    this.cartService.removeItem(productId).subscribe({
      next: (updatedCart) => {
        console.log('Panier mis à jour après suppression:', updatedCart);
        this.cart = updatedCart;
        this.cartService.updateCartState(updatedCart);
      },
      error: (error) => {
        console.error('Erreur lors de la suppression:', error);
      },
    });
  }

  ngOnDestroy(): void {
    this.cartSubscription?.unsubscribe();
  }

  checkout() {
    if (!this.cart || this.cart.itemList.length === 0) return;

    const cart = {
      userId: this.cart.userId,
      Items: this.cart.itemList.map((item) => ({
        ProductName: item.productName,
        UnitPrice: item.unitPrice,
        Quantity: item.quantity,
      })),
    };

    this.http
      .post<{ sessionId: string }>(
        'http://localhost:5147/api/Payment/create-checkout-session',
        cart
      )
      .subscribe(async (res) => {
        const stripe = await this.stripePromise;
        if (stripe) stripe.redirectToCheckout({ sessionId: res.sessionId });
      });
  }
}
