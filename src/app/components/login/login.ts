import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { RouterModule, Router } from '@angular/router'; // 1. AJOUT DE ROUTER ICI
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'], 
})
export class Login implements OnInit {
  loginForm: FormGroup;
  errorMessage: string = '';
  isLoading = false;

  // 2. INJECTION DU ROUTER DANS LE CONSTRUCTEUR
  constructor(
    private fb: FormBuilder, 
    private authService: AuthService,
    private router: Router 
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {}

  submit(): void {
    this.loginForm.markAllAsTouched();
    if (!this.loginForm.valid || this.isLoading) return;

    this.isLoading = true;
    this.errorMessage = '';

    const { username, password } = this.loginForm.value;

    this.authService.login(username, password).subscribe({
      next: (res: any) => { // J'ai ajouté ': any' pour éviter les erreurs de typage rapide
        this.isLoading = false;
        
        // 3. LOGIQUE DE SUCCÈS (C'est ce qui manquait)
        if (res.success) {
            // A. On sauvegarde l'utilisateur dans le navigateur
            // Note: 'res.data' vient de votre PHP modifié tout à l'heure
            localStorage.setItem('user', JSON.stringify(res.data)); 
            localStorage.setItem('token', res.token); // Si vous gérez des tokens

            // B. On redirige vers la page d'accueil (ou dashboard)
            this.router.navigate(['/dashboard']); 
        } else {
            // C. Si le mot de passe est faux
            this.errorMessage = res.message;
        }
      },
      error: (err) => {
        this.isLoading = false;
        // On affiche l'erreur technique si le serveur plante
        this.errorMessage = err.error?.message || 'Problème de connexion au serveur';
        console.error(err);
      }
    });
  }
}