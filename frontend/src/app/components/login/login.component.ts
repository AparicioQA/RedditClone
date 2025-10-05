import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginData = {
    email: '',
    password: ''
  };
  error = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.error = '';
    this.loading = true;

    this.authService.login(this.loginData.email, this.loginData.password).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading = false;
        // Firebase error messages
        if (err.code === 'auth/invalid-credential') {
          this.error = 'Correo electrónico o contraseña no válidos';
        } else if (err.code === 'auth/user-not-found') {
          this.error = 'No se encontró ningún usuario con este correo electrónico';
        } else if (err.code === 'auth/wrong-password') {
          this.error = 'Contraseña incorrecta';
        } else if (err.code === 'auth/too-many-requests') {
          this.error = 'Demasiados intentos fallidos. Por favor, inténtalo de nuevo más tarde';
        } else {
          this.error = err.message || 'Falló el inicio de sesión';
        }
      }
    });
  }
}
