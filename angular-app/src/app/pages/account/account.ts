import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  AuthService,
  LoginRequest,
  RegisterRequest,
  UpdateProfileRequest,
  ChangePasswordRequest,
  User,
} from '../../services/auth.service';
import { OrderService, Order, OrderStatus } from '../../services/order.service';

@Component({
  selector: 'app-account',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './account.html',
})
export class Account implements OnInit {
  // Mode de la page : 'auth' pour login/register, 'profile' pour le profil utilisateur
  pageMode: 'auth' | 'profile' = 'auth';
  authMode: 'login' | 'register' = 'login';

  // États de chargement
  loading = false;
  updateLoading = false;
  passwordLoading = false;
  ordersLoading = false;

  // Messages
  error = '';
  successMessage = '';
  profileError = '';
  profileSuccess = '';
  passwordError = '';
  passwordSuccess = '';
  ordersError = '';

  // Données utilisateur connecté
  user: User | null = null;
  orders: Order[] = [];
  selectedOrder: Order | null = null;

  // Formulaires
  formData = {
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  };

  profileData = {
    firstName: '',
    lastName: '',
    email: '',
  };

  passwordData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  };

  constructor(
    private authService: AuthService,
    private router: Router,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    // Vérifier si l'utilisateur est connecté
    this.checkAuthStatus();

    // S'abonner aux changements d'utilisateur
    this.authService.currentUser$.subscribe((user) => {
      this.user = user;
      if (user) {
        this.pageMode = 'profile';
        this.loadUserProfile();
      } else {
        this.pageMode = 'auth';
      }
    });
  }

  private checkAuthStatus(): void {
    if (this.authService.isAuthenticated()) {
      this.user = this.authService.getCurrentUser();
      if (this.user) {
        this.pageMode = 'profile';
        this.loadUserProfile();
      }
    } else {
      this.pageMode = 'auth';
    }
  }

  private loadUserProfile(): void {
    if (this.user) {
      this.profileData = {
        firstName: this.user.firstName || '',
        lastName: this.user.lastName || '',
        email: this.user.email || '',
      };
      // Charger les commandes quand on charge le profil
      this.loadUserOrders();
    }
  }

  //  AUTH METHODS

  switchAuthMode(newMode: 'login' | 'register'): void {
    this.authMode = newMode;
    this.clearAuthMessages();
    this.formData.password = '';
    if (newMode === 'login') {
      this.formData.firstName = '';
      this.formData.lastName = '';
    }
  }

  onAuthSubmit(): void {
    this.clearAuthMessages();

    if (!this.isAuthFormValid()) {
      this.error = 'Veuillez remplir tous les champs requis';
      return;
    }

    this.loading = true;

    if (this.authMode === 'login') {
      this.handleLogin();
    } else {
      this.handleRegister();
    }
  }

  private handleLogin(): void {
    const loginData: LoginRequest = {
      email: this.formData.email,
      password: this.formData.password,
    };

    this.authService.login(loginData).subscribe({
      next: (response) => {
        this.loading = false;
        this.successMessage = 'Connexion réussie';
        console.log('Utilisateur connecté:', response.user);

        // Le changement de mode se fera automatiquement via l'observable currentUser$
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 1000);
      },
      error: (error) => {
        this.loading = false;
        console.error('Erreur de connexion:', error);

        if (error.status === 401) {
          this.error = 'Email ou mot de passe incorrect';
        } else {
          this.error = 'Erreur de connexion. Veuillez réessayer';
        }
      },
    });
  }

  private handleRegister(): void {
    const registerData: RegisterRequest = {
      email: this.formData.email,
      password: this.formData.password,
      firstName: this.formData.firstName,
      lastName: this.formData.lastName,
    };

    this.authService.register(registerData).subscribe({
      next: (response) => {
        this.loading = false;
        this.successMessage =
          'Compte créé avec succès ! Vous pouvez maintenant vous connecter';

        setTimeout(() => {
          this.switchAuthMode('login');
          this.formData.password = '';
        }, 2000);
      },
      error: (error) => {
        this.loading = false;
        console.error("Erreur d'inscription:", error);

        if (error.error && error.error.errors) {
          this.error =
            'Erreur de validation : ' +
            Object.values(error.error.errors).flat().join(', ');
        } else if (error.error && error.error.message) {
          this.error = error.error.message;
        } else {
          this.error =
            'Erreur lors de la création du compte. Veuillez réessayer';
        }
      },
    });
  }

  //  ORDERS METHODS

  loadUserOrders(): void {
    this.ordersLoading = true;
    this.ordersError = '';

    this.orderService.getUserOrders().subscribe({
      next: (orders) => {
        this.ordersLoading = false;
        this.orders = orders.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      },
      error: (error) => {
        this.ordersLoading = false;
        console.error('Erreur chargement commandes:', error);
        this.ordersError = 'Erreur lors du chargement des commandes';
      },
    });
  }

  viewOrderDetails(order: Order): void {
    this.selectedOrder = this.selectedOrder?.id === order.id ? null : order;
  }

  getStatusLabel(status: OrderStatus): string {
    return this.orderService.getStatusLabel(status);
  }

  getStatusColor(status: OrderStatus): string {
    return this.orderService.getStatusColor(status);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  //  PROFILE METHODS

  onProfileUpdate(): void {
    this.clearProfileMessages();

    if (!this.isProfileFormValid()) {
      this.profileError = 'Veuillez remplir tous les champs';
      return;
    }

    this.updateLoading = true;

    const updateData: UpdateProfileRequest = {
      firstName: this.profileData.firstName,
      lastName: this.profileData.lastName,
      email: this.profileData.email,
    };

    this.authService.updateProfile(updateData).subscribe({
      next: (updatedUser) => {
        this.updateLoading = false;
        this.profileSuccess = 'Profil mis à jour avec succès';
        // L'utilisateur sera automatiquement mis à jour via l'observable
      },
      error: (error) => {
        this.updateLoading = false;
        console.error('Erreur mise à jour profil:', error);
        this.profileError = 'Erreur lors de la mise à jour du profil';
      },
    });
  }

  onPasswordChange(): void {
    this.clearPasswordMessages();

    if (!this.isPasswordFormValid()) {
      this.passwordError = 'Veuillez remplir tous les champs';
      return;
    }

    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      this.passwordError = 'Les mots de passe ne correspondent pas';
      return;
    }

    this.passwordLoading = true;

    const passwordChangeData: ChangePasswordRequest = {
      currentPassword: this.passwordData.currentPassword,
      newPassword: this.passwordData.newPassword,
    };

    this.authService.changePassword(passwordChangeData).subscribe({
      next: (response) => {
        this.passwordLoading = false;
        this.passwordSuccess = 'Mot de passe modifié avec succès';
        this.resetPasswordForm();
      },
      error: (error) => {
        this.passwordLoading = false;
        console.error('Erreur changement mot de passe:', error);

        if (error.status === 400) {
          this.passwordError = 'Mot de passe actuel incorrect';
        } else {
          this.passwordError = 'Erreur lors du changement de mot de passe';
        }
      },
    });
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        // La déconnexion sera gérée automatiquement par l'observable
        this.authMode = 'login';
        this.resetAllForms();
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Erreur lors de la déconnexion:', error);
        // Même en cas d'erreur, on peut forcer la déconnexion côté client
        // Utiliser la méthode clearAuth() à la place
        this.router.navigate(['/']);
      },
    });
  }

  //  VALIDATION METHODS

  private isAuthFormValid(): boolean {
    if (!this.formData.email || !this.formData.password) {
      return false;
    }

    if (this.authMode === 'register') {
      if (!this.formData.firstName || !this.formData.lastName) {
        return false;
      }
    }

    return true;
  }

  private isProfileFormValid(): boolean {
    return !!(
      this.profileData.firstName &&
      this.profileData.lastName &&
      this.profileData.email
    );
  }

  private isPasswordFormValid(): boolean {
    return !!(
      this.passwordData.currentPassword &&
      this.passwordData.newPassword &&
      this.passwordData.confirmPassword
    );
  }

  //  UTILITY METHODS

  private clearAuthMessages(): void {
    this.error = '';
    this.successMessage = '';
  }

  private clearProfileMessages(): void {
    this.profileError = '';
    this.profileSuccess = '';
  }

  private clearPasswordMessages(): void {
    this.passwordError = '';
    this.passwordSuccess = '';
  }

  private resetPasswordForm(): void {
    this.passwordData = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    };
  }

  private resetAllForms(): void {
    this.formData = {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
    };
    this.profileData = {
      firstName: '',
      lastName: '',
      email: '',
    };
    this.resetPasswordForm();
  }

  //  GETTERS

  get isLoginMode(): boolean {
    return this.authMode === 'login';
  }

  get isRegisterMode(): boolean {
    return this.authMode === 'register';
  }

  get isAuthMode(): boolean {
    return this.pageMode === 'auth';
  }

  get isProfileMode(): boolean {
    return this.pageMode === 'profile';
  }
}
