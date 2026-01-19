import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientModule,RouterLink]
})
export class Register implements OnInit {
  registerForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(private fb: FormBuilder, private http: HttpClient) {}

  ngOnInit() {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      immatricule: ['', Validators.required],
      adresse: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    this.registerForm.markAllAsTouched();
    if (!this.registerForm.valid || this.isLoading) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formData = this.registerForm.value;

    this.http.post('http://localhost/angular-auth-api/register.php', formData).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res.success) {
          this.successMessage = 'Registration successful ✅';
          this.registerForm.reset();
        } else {
          this.errorMessage = res.message || 'Registration failed ❌';
        }
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Error: Could not connect to backend 🚨';
      }
    });
  }
}
