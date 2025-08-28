import { Routes } from '@angular/router';
import { Products } from './pages/products/products';
import { Accueil } from './pages/accueil/accueil';
// import { Contact } from './pages/contact/contact';
import { Account } from './pages/account/account';

export const routes: Routes = [
  { path: '', component: Accueil },
  { path: 'products', component: Products },
  // { path: 'contact', component: Contact },
  { path: 'account', component: Account },
];
