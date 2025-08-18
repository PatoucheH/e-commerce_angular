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
    { nom: 'T-shirt', prix: 9.99, image: '/logo/logo_name.jpg' },
    { nom: 'Jean', prix: 50, image: '/logo/logo_name.jpg' },
    { nom: 'Basket', prix: 100, image: '/logo/logo_name.jpg' },
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
