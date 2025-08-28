import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  email: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:5147/api/Auth'; // Exactement comme votre backend
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.checkExistingAuth();
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap((response) => {
          console.log('Login réussi:', response);
          this.setCurrentUser(response.user, response.token);
        })
      );
  }

  register(userData: RegisterRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/register`,
      userData
    );
  }

  logout(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => {
        this.clearAuth();
      })
    );
  }

  // NOUVELLES MÉTHODES pour la gestion du profil
  updateProfile(profileData: UpdateProfileRequest): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/profile`, profileData).pipe(
      tap((updatedUser) => {
        // Mettre à jour l'utilisateur actuel avec les nouvelles données
        this.currentUserSubject.next(updatedUser);
        console.log('Profil mis à jour:', updatedUser);
      })
    );
  }

  changePassword(
    passwordData: ChangePasswordRequest
  ): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(
      `${this.apiUrl}/change-password`,
      passwordData
    );
  }

  private setCurrentUser(user: User, token: string): void {
    this.currentUserSubject.next(user);
    (window as any).authToken = token;
  }

  // Nouvelle méthode pour mettre à jour l'utilisateur actuel
  updateCurrentUser(user: User | null): void {
    this.currentUserSubject.next(user);
  }

  private clearAuth(): void {
    this.currentUserSubject.next(null);
    delete (window as any).authToken;
    console.log('Utilisateur déconnecté');
  }

  getToken(): string | null {
    return (window as any).authToken || null;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null && this.getToken() !== null;
  }

  private checkExistingAuth(): void {}
}
