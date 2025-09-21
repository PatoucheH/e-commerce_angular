import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import { UpdateProfileRequest } from '../../models/request-profile/updateProfilRequest.model';

@Component({
  selector: 'app-user-info',
  imports: [CommonModule, FormsModule],
  templateUrl: './account-info.html',
})
export class AccountInfoComponent implements OnInit {
  @Input() user: User | null = null;

  updateLoading = false;
  profileError = '';
  profileSuccess = '';

  profileData = {
    firstName: '',
    lastName: '',
    email: '',
  };

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  ngOnChanges(): void {
    this.loadUserProfile();
  }

  private loadUserProfile(): void {
    if (this.user) {
      this.profileData = {
        firstName: this.user.firstName || '',
        lastName: this.user.lastName || '',
        email: this.user.email || '',
      };
    }
  }

  onProfileUpdate(): void {
    this.clearMessages();

    if (!this.isFormValid()) {
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

  private isFormValid(): boolean {
    return !!(
      this.profileData.firstName &&
      this.profileData.lastName &&
      this.profileData.email
    );
  }

  private clearMessages(): void {
    this.profileError = '';
    this.profileSuccess = '';
  }
}
