import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';
import { DetailProductComponent } from '../../components/detail-product/detail-product-component';

@Component({
  selector: 'app-products',
  imports: [CommonModule, FormsModule, DetailProductComponent],
  templateUrl: './products.html',
  styleUrls: ['./products.scss'],
  providers: [ProductService],
})
export class Products implements OnInit {
  private FilterTimeout: any;

  search = '';
  selectedType = '';

  // Limites globales
  minPrice = 0;
  maxPrice = 500;

  // Valeurs sélectionnées
  minPriceSelect = 0;
  maxPriceSelect = 500;

  // État d'affichage des Filters
  visibleFilters = true;

  // Données de l'API
  products: Product[] = [];
  loading = false;
  error = '';

  constructor(private productService: ProductService) {}

  @ViewChild(DetailProductComponent)
  detailProductComponent?: DetailProductComponent;

  openModal(product: Product) {
    console.log('open');
    this.detailProductComponent?.open(product);
  }

  ngOnInit() {
    this.chargerproducts();
  }

  chargerproducts() {
    this.loading = true;
    this.error = '';

    const Filters = {
      search: this.search || undefined,
      minPrice: this.minPriceSelect,
      maxPrice: this.maxPriceSelect,
      type: this.selectedType || undefined,
    };

    this.productService.getProducts(Filters).subscribe({
      next: (products) => {
        this.products = products;
        this.loading = false;
        console.log('products charged:', products);
      },
      error: (error) => {
        console.error('Erreur API:', error);
        this.error = 'Error when loading products';
        this.loading = false;
        this.products = [];
      },
    });
  }

  // Calcul des pourcentages pour l'affichage du slider
  getLeftPercent(): number {
    return (
      ((this.minPriceSelect - this.minPrice) /
        (this.maxPrice - this.minPrice)) *
      100
    );
  }

  getWidthPercent(): number {
    return (
      ((this.maxPriceSelect - this.minPriceSelect) /
        (this.maxPrice - this.minPrice)) *
      100
    );
  }

  // Gestion des changements de valeur sur les sliders
  onMinChange(event: any): void {
    const value = parseInt(event.target.value);
    if (value < this.maxPriceSelect) {
      this.minPriceSelect = value;
    }
    // Recharger quand on change les Filters
    this.onFilterChange();
  }

  onMaxChange(event: any): void {
    const value = parseInt(event.target.value);
    if (value > this.minPriceSelect) {
      this.maxPriceSelect = value;
    }
    // Recharger quand on change les Filters
    this.onFilterChange();
  }

  // Validation des inputs texte
  validateMinPrice(): void {
    const value = parseInt(this.minPriceSelect.toString()) || this.minPrice;
    if (value < this.minPrice) {
      this.minPriceSelect = this.minPrice;
    } else if (value >= this.maxPriceSelect) {
      this.minPriceSelect = this.maxPriceSelect - 1;
    } else {
      this.minPriceSelect = value;
    }
    this.onFilterChange();
  }

  validateMaxPrice(): void {
    const value = parseInt(this.maxPriceSelect.toString()) || this.maxPrice;
    if (value > this.maxPrice) {
      this.maxPriceSelect = this.maxPrice;
    } else if (value <= this.minPriceSelect) {
      this.maxPriceSelect = this.minPriceSelect + 1;
    } else {
      this.maxPriceSelect = value;
    }
    this.onFilterChange();
  }

  // Basculer l'affichage des Filters
  toggleFilters(): void {
    this.visibleFilters = !this.visibleFilters;
  }

  // Méthode appelée quand les Filters changent
  onFilterChange(): void {
    // Petite temporisation pour éviter trop d'appels API
    clearTimeout(this.FilterTimeout);
    this.FilterTimeout = setTimeout(() => {
      this.chargerproducts();
    }, 300);
  }

  // Permettre seulement les chiffres dans les inputs
  allowOnlyNumbers(event: KeyboardEvent): void {
    const charCode = event.which ? event.which : event.keyCode;
    if (
      [8, 9, 27, 13, 46].indexOf(charCode) !== -1 ||
      (charCode === 65 && event.ctrlKey === true) ||
      (charCode === 67 && event.ctrlKey === true) ||
      (charCode === 86 && event.ctrlKey === true) ||
      (charCode === 88 && event.ctrlKey === true)
    ) {
      return;
    }
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  // Pour optimiser le rendu de la liste
  trackByProductId(index: number, product: Product): number {
    return product.id;
  }

  // Gestion des erreurs d'images
  onImageError(event: any): void {
    event.target.src = '/assets/images/no-image.jpg';
  }

  // Génère un tableau d'étoiles pour l'affichage des notes
  getStarsArray(rating: number): string[] {
    const stars: string[] = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    // Étoiles pleines
    for (let i = 0; i < fullStars; i++) {
      stars.push('full');
    }

    // Étoile à moitié
    if (hasHalfStar) {
      stars.push('half');
    }

    while (stars.length < 5) {
      stars.push('empty');
    }

    return stars;
  }

  // Action d'ajout au panier
  addToCart(product: Product): void {
    if (product.stock > 0) {
      console.log('Produit ajouté au panier:', product);
    } else {
      alert("The product's stock is empty");
    }
  }

  // Effacer tous les filtres
  clearFilters(): void {
    this.search = '';
    this.selectedType = '';
    this.minPriceSelect = this.minPrice;
    this.maxPriceSelect = this.maxPrice;
    this.chargerproducts();
  }
}
