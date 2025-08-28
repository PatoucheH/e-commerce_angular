// password-change.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, ChangePasswordRequest } from '../../services/auth.service';

@Component({
  selector: 'app-password-change',
  imports: [CommonModule, FormsModule],
  templateUrl: "account-password-change.html" ,
})
export class PasswordChangeComponent {
  passwordLoading = false;
  passwordError = '';
  passwordSuccess = '';

  passwordData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  };

  constructor(private authService: AuthService) {}

  onPasswordChange(): void {
    this.clearMessages();

    if (!this.isFormValid()) {
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
        this.resetForm();
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

  private isFormValid(): boolean {
    return !!(
      this.passwordData.currentPassword &&
      this.passwordData.newPassword &&
      this.passwordData.confirmPassword
    );
  }

  private clearMessages(): void {
    this.passwordError = '';
    this.passwordSuccess = '';
  }

  private resetForm(): void {
    this.passwordData = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    };
  }
}