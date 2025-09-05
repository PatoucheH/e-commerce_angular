import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export interface RatingDto {
  id: number;
  productId: number;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: Date | string;
}

@Injectable({
  providedIn: 'root',
})
export class RateService {
  private apiUrl = `http://localhost:5147/api/Rating`;

  constructor(private http: HttpClient) {}

  rateProduct(
    productId: number,
    rating: number,
    comment?: string
  ): Observable<any> {
    return this.http.post(
      `${this.apiUrl}`,
      {
        productId,
        rating,
        comment: comment || '',
      },
      { withCredentials: true }
    );
  }

  getProductReviews(productId: number): Observable<RatingDto[]> {
    const url = `${this.apiUrl}/product/${productId}`;

    return this.http.get<RatingDto[]>(url, { withCredentials: true }).pipe(
      tap((response) => {
        console.log('✅ RateService: API Response received:', response);
      }),
      catchError((error) => {
        console.error('❌ RateService: API Error:', error);
        return throwError(error);
      })
    );
  }
}
