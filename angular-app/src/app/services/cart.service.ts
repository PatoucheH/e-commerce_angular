import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Cart } from '../models/cart.model';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private apiUrl = 'http://localhost:5147/api/Cart';
  private cartSubject = new BehaviorSubject<Cart | null>(null);

  cart$ = this.cartSubject.asObservable();

  constructor(private http: HttpClient) {}

  getCart(): Observable<Cart> {
    return this.http.get<Cart>('http://localhost:5147/api/cart', {
      withCredentials: true,
    });
  }

  addItem(
    productId: number,
    productName: string,
    quantity: number
  ): Observable<Cart> {
    return this.http.post<Cart>(
      `http://localhost:5147/api/cart/items?productId=${productId}&productName=${encodeURIComponent(
        productName
      )}&quantity=${quantity}`,
      {},
      { withCredentials: true }
    );
  }

  removeItem(productId: number): Observable<Cart> {
    return this.http.delete<Cart>(
      `http://localhost:5147/api/cart/items/${productId}`,
      { withCredentials: true }
    );
  }

  updateCartState(cart: Cart) {
    this.cartSubject.next(cart);
  }
}
