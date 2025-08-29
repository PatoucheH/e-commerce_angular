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

  getCart(userId: string): Observable<Cart> {
    return this.http.get<Cart>(`${this.apiUrl}/${userId}`);
  }

  addItem(
    userId: string,
    productId: number,
    quantity: number
  ): Observable<Cart> {
    return this.http.post<Cart>(`${this.apiUrl}/add-item`, {
      userId,
      productId,
      quantity,
    });
  }

  removeItem(userId: string, productId: number): Observable<Cart> {
    return this.http.delete<Cart>(
      `${this.apiUrl}/${userId}/items/${productId}`
    );
  }

  updateCartState(cart: Cart) {
    this.cartSubject.next(cart);
  }
}
