// src/app/modules/auth/components/login/login.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  isLoading = false;
  errorMessage = '';

  demoCredentials = [
    { role: 'Admin', email: 'admin@simicro.com', password: 'admin123' },
    { role: 'Analista', email: 'analista@simicro.com', password: 'analista123' },
    { role: 'Emprendedor', email: 'emprendedor@ejemplo.com', password: 'password123' }
  ];


  login() {

  }


  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    if (this.loginForm.valid && !this.isLoading) {
      this.isLoading = true;
      this.errorMessage = '';

      const { email, password } = this.loginForm.value;
      // console.log('XXXXXXXXXXXXX', JSON.stringify(this.loginForm.value));


      this.authService.login(email!, password!).subscribe({
        next: (response: any) => {
          this.isLoading = false;
          // console.log('Login response:', response);

          if (response.success && response.data?.user) {
            // CORREGIDO: Usar response.data.user.rol
            this.redirectByRole(response.data.user.rol);
          } else {
            this.errorMessage = response.message || 'Error en el login';
          }
        },
        error: (error: any) => {
          this.isLoading = false;
          console.error('Error de login:', error);

          if (error.status === 401) {
            this.errorMessage = 'Email o contraseña incorrectos';
          } else if (error.status === 400) {
            this.errorMessage = 'Datos inválidos';
          } else if (error.status === 0) {
            this.errorMessage = 'No se puede conectar al servidor. Verifica que el backend esté ejecutándose.';
          } else {
            this.errorMessage = 'Error del servidor. Intenta nuevamente.';
          }
        }
      });
    }
  }

  private redirectByRole(rol: string): void {
    console.log('Redirigiendo por rol:', rol);

    switch (rol) {
      case 'admin':
        this.router.navigate(['/admin/dashboard']);
        break;
      case 'analista':
        this.router.navigate(['/analista/dashboard']);
        break;
      case 'emprendedor':
        this.router.navigate(['/emprendedor/dashboard']);
        break;
      default:
        console.warn('Rol no reconocido:', rol);
        this.router.navigate(['/']);
        break;
    }
  }

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }
}