import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles?: string[];
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

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:5147/api/Auth';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Vérifie si l’utilisateur est déjà connecté grâce au cookie
    this.checkAuth().subscribe();
  }

  login(credentials: LoginRequest): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/login`, credentials, { withCredentials: true })
      .pipe(
        tap((response) => {
          if (response.success) {
            this.currentUserSubject.next(response.user);
            console.log('Login réussi:', response);
          }
        })
      );
  }

  register(userData: RegisterRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, userData, {
      withCredentials: true,
    });
  }

  logout(): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/logout`, {}, { withCredentials: true })
      .pipe(
        tap(() => {
          this.clearAuth();
        })
      );
  }

  updateProfile(profileData: UpdateProfileRequest): Observable<User> {
    return this.http
      .put<User>(`${this.apiUrl}/profile`, profileData, {
        withCredentials: true,
      })
      .pipe(
        tap((updatedUser) => {
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
      passwordData,
      { withCredentials: true }
    );
  }

  checkAuth(): Observable<any> {
    return this.http
      .get<any>(`${this.apiUrl}/check-auth`, { withCredentials: true })
      .pipe(
        tap((res) => {
          if (res.isAuthenticated) {
            this.currentUserSubject.next(res.user);
          } else {
            this.clearAuth();
          }
        })
      );
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  private clearAuth(): void {
    this.currentUserSubject.next(null);
    console.log('Utilisateur déconnecté');
  }
}
