// src/app/modules/auth/components/register/register.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { RegisterData } from '../../../../shared/interfaces/registerData.interface';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);

  registerForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: ['emprendedor', Validators.required],
  });

  mapearAObjetoRegisterData(): RegisterData {
    const registerData: RegisterData = {
      nombre: this.registerForm.get('name')?.value || '',
      email: this.registerForm.get('email')?.value || '',
      password: this.registerForm.get('password')?.value || '',
      rol: this.registerForm.get('role')?.value || '',
    };
    return registerData;
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.authService.register(this.registerForm.value).subscribe({
        next: (response: any) => {
          console.log('Registro exitoso:', response);
          this.router.navigate([`/${response.user.role}`]);
        },
        error: (error: any) => {
          console.error('Error de registro:', error);
        },
      });
    }
  }

  async register() {
    if (this.registerForm.valid) {
      const registerData = this.mapearAObjetoRegisterData();
      console.log('Datos de registro mapeados:', JSON.stringify(registerData));
      try {
        const response = await this.authService.postRegister(registerData);
        console.log('Registro exitoso:', response);
        this.router.navigate([`/${response.user.role}`]);
      } catch (error) {
        console.error('Error during registration:', error);
      }
    }
  }
}
