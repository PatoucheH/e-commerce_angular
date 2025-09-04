import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = 'http://localhost:5147/api/Products';

  constructor(private http: HttpClient) {}

  getProducts(filters?: any): Observable<Product[]> {
    let params = new HttpParams();

    if (filters?.search) {
      params = params.set('search', filters.search);
    }
    if (filters?.minPrice) {
      params = params.set('minPrice', filters.minPrice.toString());
    }
    if (filters?.maxPrice) {
      params = params.set('maxPrice', filters.maxPrice.toString());
    }
    if (filters?.type) {
      params = params.set('type', filters.type);
    }

    return this.http.get<Product[]>(this.apiUrl, { params });
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  addProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}`, product);
  }

  updateProduct(id: number, product: Product): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, product);
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  uploadProductImage(formData: FormData): Observable<any> {
    return this.http.post('http://localhost:5147/api/Upload', formData);
  }

  rateProduct(productId: number, rating: number, comment?: string) {
    return this.http.post(
      `http://localhost:5147/api/Rating`,
      {
        productId,
        rating,
        comment: comment || '',
      },
      { withCredentials: true }
    );
  }
}
