import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';
import { DetailProductComponent } from '../../components/detail-product/detail-product-component';

@Component({
  selector: 'app-accueil',
  imports: [CommonModule, RouterLink, DetailProductComponent],
  templateUrl: './accueil.html',
})
export class Accueil {
  currentSlide = 0;
  products: Product[] = [];
  constructor(private productService: ProductService) {}
  @ViewChild(DetailProductComponent)
  detailProductComponent?: DetailProductComponent;

  ngOnInit(): void {
    this.productService.getProductsByRating(3).subscribe({
      next: (data) => {
        console.log(data);
        this.products = data.map((p) => ({
          ...p,
          imageUrl: p.imageUrl
            ? `http://localhost:5147${p.imageUrl}`
            : `logo/logo_name.jpg`,
        }));
      },
      error: (err) => {
        console.error('Erreur lors du chargement des produits', err);
      },
    });
  }

  openModal(product: Product) {
    console.log('open');
    this.detailProductComponent?.open(product);
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.products.length;
  }

  prevSlide() {
    this.currentSlide =
      this.currentSlide === 0
        ? this.products.length - 1
        : this.currentSlide - 1;
  }

  getPrevIndex(): number {
    return this.currentSlide === 0
      ? this.products.length - 1
      : this.currentSlide - 1;
  }

  getNextIndex(): number {
    return (this.currentSlide + 1) % this.products.length;
  }
}
