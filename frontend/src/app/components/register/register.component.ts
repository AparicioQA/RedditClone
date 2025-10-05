import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerData = {
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  };
  error = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.error = '';

    // Validation
    if (this.registerData.password !== this.registerData.confirmPassword) {
      this.error = 'Las contraseñas no coinciden';
      return;
    }

    if (this.registerData.password.length < 6) {
      this.error = 'La contraseña debe tener al menos 6 caracteres';
      return;
    }

    if (!this.registerData.username.trim()) {
      this.error = 'El nombre de usuario es obligatorio';
      return;
    }

    this.loading = true;

    this.authService.register(
      this.registerData.email,
      this.registerData.password,
      this.registerData.username
    ).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading = false;
        // Firebase error messages
        if (err.code === 'auth/email-already-in-use') {
          this.error = 'Este correo electrónico ya está registrado';
        } else if (err.code === 'auth/invalid-email') {
          this.error = 'Dirección de correo electrónico no válida';
        } else if (err.code === 'auth/weak-password') {
          this.error = 'La contraseña es demasiado débil. Usa al menos 6 caracteres';
        } else {
          this.error = err.message || 'Falló el registro';
        }
      }
    });
  }
}
