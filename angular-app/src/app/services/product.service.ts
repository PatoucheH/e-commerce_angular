import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Product {
  id: number;
  name: string;
  price: number;
  type: string;
  description?: string;
  imageUrl: string;
  stock: number;
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = 'http://localhost:5147/api/product';

  constructor(private http: HttpClient) {}

  getproducts(filtres?: {
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    type?: string;
  }): Observable<Product[]> {
    let params = new HttpParams();

    if (filtres?.search) params = params.set('search', filtres.search);
    if (filtres?.minPrice)
      params = params.set('minPrice', filtres.minPrice.toString());
    if (filtres?.maxPrice)
      params = params.set('maxprice', filtres.maxPrice.toString());
    if (filtres?.type) params = params.set('type', filtres.type);

    return this.http.get<Product[]>(this.apiUrl, { params });
  }

  getproduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  createproduct(
    product: Omit<Product, 'id' | 'createdAt'>
  ): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product);
  }

  updateproduct(id: number, product: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, product);
  }

  deleteproduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
