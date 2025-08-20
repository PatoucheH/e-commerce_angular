import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService, Product } from '../../services/product.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-products',
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './products.html',
  styleUrls: ['./products.scss'],
  providers: [ProductService],
})
export class Products implements OnInit {
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

    this.productService.getproducts(Filters).subscribe({
      next: (products) => {
        this.products = products;
        this.loading = false;
        console.log('products charged:', products);
      },
      error: (error) => {
        console.error('Erreur API:', error);
        this.error = 'Error when loading products';
        this.loading = false;

        // Fallback avec données mockées pour le développement
        this.products = [
          {
            id: 1,
            name: 'T-shirt',
            price: 9.99,
            type: 'T-shirt',
            imageUrl: '/logo/logo_name.jpg',
            stock: 10,
          },
          {
            id: 2,
            name: 'Jean',
            price: 50,
            type: 'Pantalon',
            imageUrl: '/logo/logo_name.jpg',
            stock: 15,
          },
          {
            id: 3,
            name: 'Basket',
            price: 80,
            type: 'Chaussures',
            imageUrl: '/logo/logo_name.jpg',
            stock: 8,
          },
        ];
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

  private FilterTimeout: any;

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
}
