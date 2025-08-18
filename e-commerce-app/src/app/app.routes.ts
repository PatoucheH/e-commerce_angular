import { Routes } from '@angular/router';
import { Produits } from './produits/produits';
import { Accueil } from './accueil/accueil';
import { Contact } from './contact/contact';

export const routes: Routes = [
  { path: '', component: Accueil },
  { path: 'produits', component: Produits },
  { path: 'contact', component: Contact },
];
