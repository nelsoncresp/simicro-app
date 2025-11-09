// src/app/modules/emprendedor/components/perfil/perfil.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent {
  private fb = new FormBuilder();

  profileForm = this.fb.group({
    name: ['Nombre del Emprendedor', Validators.required],
    email: ['emprendedor@ejemplo.com', [Validators.required, Validators.email]],
    phone: ['+1234567890'],
    business: ['Mi Empresa S.A.'],
    sector: ['Tecnología']
  });

  saveProfile() {
    if (this.profileForm.valid) {
      console.log('Guardando perfil:', this.profileForm.value);
    }
  }
}