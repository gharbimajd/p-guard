import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

export interface User {
  id: number;
  username: string;
  // Ajoutez d'autres champs si nécessaire (email, etc.)
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: User; // CORRECTION : On renomme 'user' en 'data' pour matcher PHP
  token?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost/angular-auth-api';
  private loggedIn = new BehaviorSubject<boolean>(false);
  private currentUser = new BehaviorSubject<User | null>(null);

  constructor(private http: HttpClient, private router: Router) {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.loggedIn.next(true);
      this.currentUser.next(JSON.parse(storedUser));
    }
  }

  get isLoggedIn(): Observable<boolean> {
    return this.loggedIn.asObservable();
  }

  get currentUser$(): Observable<User | null> {
    return this.currentUser.asObservable();
  }

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.apiUrl}/login.php`,
      { username, password },
      { withCredentials: true }
    ).pipe(
      tap(res => {
        // CORRECTION ICI : On vérifie res.data au lieu de res.user
        if (res.success && res.data) {
          this.loggedIn.next(true);
          this.currentUser.next(res.data);
          localStorage.setItem('user', JSON.stringify(res.data));
          
          // Note : Puisque vous redirigez déjà dans le composant (login.ts),
          // on peut laisser cette ligne, mais c'est mieux de laisser le composant gérer la navigation.
          // this.router.navigate(['/dashboard']); 
        }
      })
    );
  }

  logout(): void {
    // On appelle le logout PHP (optionnel si vous n'utilisez pas de session PHP)
    // this.http.get(`${this.apiUrl}/logout.php`, { withCredentials: true }).subscribe();
    
    this.loggedIn.next(false);
    this.currentUser.next(null);
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  getUser(): User | null {
    return this.currentUser.value;
  }

  register(username: string, password: string, immatricule: string, adressgmail: string) {
    // Attention : Vérifiez que votre PHP attend bien "adressgmail" et pas "email"
    return this.http.post<{ success: boolean; message: string }>(
      `${this.apiUrl}/register.php`,
      { username, password, immatricule, adressgmail },
      { withCredentials: true }
    );
  }
}