import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "app-produits",
  imports: [CommonModule, FormsModule],
  templateUrl: "./produits.html",
  styleUrls: ["./produits.scss"],
})
export class Produits {
  recherche = "";
  typeSelectionne = "";
  // Limites globales
  minPrice = 0;
  maxPrice = 500;

  prixMinSelect = 0;
  prixMaxSelect = 500;

  filtresVisibles = true;

  produits = [
    { nom: "T-shirt", prix: 9.99, imageUrl: "/logo/logo_name.jpg", type: "T-shirt" },
    { nom: "Jean", prix: 50, imageUrl: "/logo/logo_name.jpg", type: "Pantalon" },
    { nom: "Basket", prix: 80, imageUrl: "/logo/logo_name.jpg", type: "Chaussures" },
    { nom: "T-shirt Premium", prix: 12.99, imageUrl: "/logo/logo_name.jpg", type: "T-shirt" },
    { nom: "Jean Slim", prix: 70, imageUrl: "/logo/logo_name.jpg", type: "Pantalon" },
    { nom: "Basket Sport", prix: 99.99, imageUrl: "/logo/logo_name.jpg", type: "Chaussures" },
    { nom: "T-shirt Designer", prix: 14.99, imageUrl: "/logo/logo_name.jpg", type: "T-shirt" },
    { nom: "Jean Vintage", prix: 50, imageUrl: "/logo/logo_name.jpg", type: "Pantalon" },
    { nom: "Basket Running", prix: 100, imageUrl: "/logo/logo_name.jpg", type: "Chaussures" },
    { nom: "T-shirt Luxury", prix: 25, imageUrl: "/logo/logo_name.jpg", type: "T-shirt" },
    { nom: "Jean Classic", prix: 39.99, imageUrl: "/logo/logo_name.jpg", type: "Pantalon" },
    { nom: "Basket Limited", prix: 149.99, imageUrl: "/logo/logo_name.jpg", type: "Chaussures" },
  ];

  get produitsFiltres() {
    return this.produits.filter(
      (produit) =>
        produit.nom.toLowerCase().includes(this.recherche.toLowerCase()) &&
        produit.prix >= this.prixMinSelect &&
        produit.prix <= this.prixMaxSelect &&
        (this.typeSelectionne === "" || produit.type === this.typeSelectionne)
    );
  }

  // Calcul des pourcentages pour l"affichage du slider
  getLeftPercent(): number {
    return (
      ((this.prixMinSelect - this.minPrice) / (this.maxPrice - this.minPrice)) *
      100
    );
  }

  getWidthPercent(): number {
    return (
      ((this.prixMaxSelect - this.prixMinSelect) /
        (this.maxPrice - this.minPrice)) *
      100
    );
  }

  // Gestion des changements de valeur sur les sliders
  onMinChange(event: any): void {
    const value = parseInt(event.target.value);
    if (value < this.prixMaxSelect) {
      this.prixMinSelect = value;
    }
  }

  onMaxChange(event: any): void {
    const value = parseInt(event.target.value);
    if (value > this.prixMinSelect) {
      this.prixMaxSelect = value;
    }
  }

  // Validation des inputs texte
  validateMinPrice(): void {
    const value = parseInt(this.prixMinSelect.toString()) || this.minPrice;
    if (value < this.minPrice) {
      this.prixMinSelect = this.minPrice;
    } else if (value >= this.prixMaxSelect) {
      this.prixMinSelect = this.prixMaxSelect - 1;
    } else {
      this.prixMinSelect = value;
    }
  }

  validateMaxPrice(): void {
    const value = parseInt(this.prixMaxSelect.toString()) || this.maxPrice;

    if (value > this.maxPrice) {
      this.prixMaxSelect = this.maxPrice;
    } else if (value <= this.prixMinSelect) {
      this.prixMaxSelect = this.prixMinSelect + 1;
    } else {
      this.prixMaxSelect = value;
    }
  }

  // Basculer l"affichage des filtres
  toggleFiltres(): void {
    this.filtresVisibles = !this.filtresVisibles;
  }

  // Permettre seulement les chiffres dans les inputs
  allowOnlyNumbers(event: KeyboardEvent): void {
    const charCode = event.which ? event.which : event.keyCode;
    // Permettre: backspace, delete, tab, escape, enter
    if (
      [8, 9, 27, 13, 46].indexOf(charCode) !== -1 ||
      // Permettre: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
      (charCode === 65 && event.ctrlKey === true) ||
      (charCode === 67 && event.ctrlKey === true) ||
      (charCode === 86 && event.ctrlKey === true) ||
      (charCode === 88 && event.ctrlKey === true)
    ) {
      return;
    }
    // S"assurer que c"est un chiffre et arrêter les autres caractères
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }
}
