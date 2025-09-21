import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../models/request-profile/loginRequest.model';
import { RegisterRequest } from '../../models/request-profile/registerRequest.model';

@Component({
  selector: 'app-auth-form',
  imports: [CommonModule, FormsModule],
  templateUrl: './account-form.html',
})
export class AuthFormComponent {
  @Output() loginSuccess = new EventEmitter<void>();
  @Output() registerSuccess = new EventEmitter<void>();

  authMode: 'login' | 'register' = 'login';
  loading = false;
  error = '';
  successMessage = '';

  formData = {
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  };

  constructor(private authService: AuthService) {}

  switchAuthMode(newMode: 'login' | 'register'): void {
    this.authMode = newMode;
    this.clearMessages();
    this.formData.password = '';
    if (newMode === 'login') {
      this.formData.firstName = '';
      this.formData.lastName = '';
    }
  }

  onAuthSubmit(): void {
    this.clearMessages();

    if (!this.isFormValid()) {
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
        this.loginSuccess.emit();
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

        this.registerSuccess.emit();
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

  private isFormValid(): boolean {
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

  private clearMessages(): void {
    this.error = '';
    this.successMessage = '';
  }

  get isLoginMode(): boolean {
    return this.authMode === 'login';
  }

  get isRegisterMode(): boolean {
    return this.authMode === 'register';
  }
}
