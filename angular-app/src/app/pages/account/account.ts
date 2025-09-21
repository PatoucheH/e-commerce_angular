import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AuthFormComponent } from '../../components/account-form/account-form';
import { UserProfileComponent } from '../../components/account-profile/account-profile';
import { AdminPanelComponent } from '../../components/admin-panel/admin-panel';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [
    CommonModule,
    AuthFormComponent,
    UserProfileComponent,
    AdminPanelComponent,
  ],
  templateUrl: './account.html',
})
export class Account implements OnInit {
  pageMode: 'auth' | 'profile' = 'auth';
  user: User | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.checkAuthStatus();

    this.authService.currentUser$.subscribe((user) => {
      this.user = user;
      this.pageMode = user ? 'profile' : 'auth';
    });
  }

  private checkAuthStatus(): void {
    if (this.authService.isAuthenticated()) {
      this.user = this.authService.getCurrentUser();
      this.pageMode = this.user ? 'profile' : 'auth';
    }
  }

  onLoginSuccess(): void {
    setTimeout(() => {
      this.router.navigate(['/']);
    }, 1000);
  }

  onRegisterSuccess(): void {
    console.log('User successfully registered');
    // Le composant auth-form gère déjà le switch vers login
  }

  onLogoutRequested(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Erreur lors de la déconnexion:', error);
        this.router.navigate(['/']);
      },
    });
  }

  get isAuthMode(): boolean {
    return this.pageMode === 'auth';
  }

  get isProfileMode(): boolean {
    return this.pageMode === 'profile';
  }
  get isAdmin(): boolean {
    return this.user?.roles?.includes('Admin') ?? false;
  }
}
