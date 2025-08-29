import { Routes } from '@angular/router';
import { Products } from './pages/products/products';
import { Accueil } from './pages/accueil/accueil';
// import { Contact } from './pages/contact/contact';
import { Account } from './pages/account/account';
import { CartComponent } from './pages/cart/cart';

export const routes: Routes = [
  { path: '', component: Accueil },
  { path: 'products', component: Products },
  { path: 'cart', component: CartComponent },
  // { path: 'contact', component: Contact },
  { path: 'account', component: Account },
];
