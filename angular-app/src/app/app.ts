import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { AuthService } from './services/auth.service';
import { Observable } from 'rxjs';
import { User } from './services/auth.service';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('e-commerce-app');
  currentUser$: Observable<User | null>;

  constructor(private authService: AuthService) {
    this.currentUser$ = this.authService.currentUser$;
  }

  // Méthode utilitaire pour vérifier si l'utilisateur est connecté
  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }
}
