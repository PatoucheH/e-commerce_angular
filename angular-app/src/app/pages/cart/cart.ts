import { Component, OnInit, OnDestroy } from '@angular/core';
import { Cart } from '../../models/cart.model';
import { CartService } from '../../services/cart.service';
import { Subscription } from 'rxjs';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.html',
  imports: [RouterLink, FormsModule, CommonModule],
})
export class CartComponent implements OnInit, OnDestroy {
  cart: Cart | null = null;
  private cartSubscription?: Subscription;
  private stripePromise!: Promise<Stripe | null>;

  //  État pour gérer le formulaire d'adresse
  showAddressForm = false;
  isProcessing = false;

  //  Modèle pour l'adresse
  shippingAddress = {
    fullName: '',
    streetAddress: '',
    city: '',
    postalCode: '',
    country: 'France',
  };

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

  //  Afficher le formulaire d'adresse
  proceedToCheckout() {
    if (!this.cart || this.cart.itemList.length === 0) return;
    this.showAddressForm = true;
  }

  //  Retour au panier
  backToCart() {
    this.showAddressForm = false;
  }

  //  Validation du formulaire
  isFormValid(): boolean {
    return (
      this.shippingAddress.fullName.trim() !== '' &&
      this.shippingAddress.streetAddress.trim() !== '' &&
      this.shippingAddress.city.trim() !== '' &&
      this.shippingAddress.postalCode.trim() !== ''
    );
  }

  //  Finaliser le paiement avec l'adresse
  async finalizeOrder() {
    if (!this.cart || this.cart.itemList.length === 0 || !this.isFormValid()) {
      return;
    }

    this.isProcessing = true;

    // Construire l'adresse complète
    const fullAddress = `${this.shippingAddress.fullName}, ${this.shippingAddress.streetAddress}, ${this.shippingAddress.postalCode} ${this.shippingAddress.city}, ${this.shippingAddress.country}`;

    const orderData = {
      userId: this.cart.userId,
      itemList: this.cart.itemList.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
      })),
      shippingAddress: fullAddress,
    };

    console.log(' Envoi des données avec adresse:', orderData);

    this.http
      .post<{ sessionId: string }>(
        'http://localhost:5147/api/Payment/create-checkout-session',
        orderData
      )
      .subscribe({
        next: async (res) => {
          console.log(' Session Stripe créée:', res.sessionId);
          const stripe = await this.stripePromise;
          if (stripe) {
            const result = await stripe.redirectToCheckout({
              sessionId: res.sessionId,
            });
            if (result.error) {
              console.error(' Erreur Stripe:', result.error.message);
              this.isProcessing = false;
            }
          }
        },
        error: (error) => {
          console.log(orderData);
          console.error(' Erreur lors de la création de session:', error);
          this.isProcessing = false;
        },
      });
  }
}
