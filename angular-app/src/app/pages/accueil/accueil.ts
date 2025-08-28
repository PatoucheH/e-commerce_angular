import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-accueil',
  imports: [CommonModule, RouterLink],
  templateUrl: './accueil.html',
})
export class Accueil {
  currentSlide = 0;

  produits = [
    {
      name: 'T-shirt',
      price: 9.99,
      image:
        'http://localhost:5147/Images/Products/00b8cbdd-885e-49d3-9173-0e3e9d0966ac.jpg',
    },
    {
      name: 'Jean',
      price: 50,
      image:
        'http://localhost:5147/Images/Products/00b8cbdd-885e-49d3-9173-0e3e9d0966ac.jpg',
    },
    {
      name: 'Basket',
      price: 100,
      image:
        'http://localhost:5147/Images/Products/00b8cbdd-885e-49d3-9173-0e3e9d0966ac.jpg',
    },
  ];

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.produits.length;
  }

  prevSlide() {
    this.currentSlide =
      this.currentSlide === 0
        ? this.produits.length - 1
        : this.currentSlide - 1;
  }

  getPrevIndex(): number {
    return this.currentSlide === 0
      ? this.produits.length - 1
      : this.currentSlide - 1;
  }

  getNextIndex(): number {
    return (this.currentSlide + 1) % this.produits.length;
  }
}
