// src/app/modules/emprendedor/components/perfil/perfil.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { PerfilService } from '../../../../core/services/perfil.service';
import { RespApiDetalleUsuario } from '../../../../interfaces/mi-detalle-usuario/respApiDetalleUsuario.interface';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {
  ngOnInit(): void {
    this.getDetalleUsuario();
  }
  private fb = new FormBuilder();

  private perfilService = inject(PerfilService);

  tiposDocumento = [{ descripcion: 'Cédula de Ciudadanía', descAbrv: 'CC' },
  { descripcion: 'Pasaporte', descAbrv: 'Pasaporte' },
  { descripcion: 'Cédula de Extranjería', descAbrv: 'CE' }];
  generosOptions = ['Masculino', 'Femenino', 'Otro'];
  estadosCiviles = [{ descripcion: 'Soltero(a)', descAbrv: 'soltero' },
  { descripcion: 'Casado(a)', descAbrv: 'casado' }, { descripcion: 'Divorciado(a)', descAbrv: 'divorciado' },
  { descripcion: 'Viudo(a)', descAbrv: 'viudo' }, { descripcion: 'Unión Libre', descAbrv: 'union_libre' }];
  detallesUsuario: RespApiDetalleUsuario[] = [];
  tieneDetalleUsuario: boolean = false;

  perfilForm = this.fb.group({
    tipo_documento: ['', Validators.required],
    numero_documento: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
    fecha_nacimiento: ['', Validators.required],
    genero: ['', Validators.required],
    telefono: ['', [Validators.required, Validators.pattern(/^\d{7,15}$/)]],
    direccion: ['', Validators.required],
    municipio: ['', Validators.required],
    departamento: ['', Validators.required],
    estado_civil: ['', Validators.required]
  });


  async getDetalleUsuario() {
    try {
      const response = await this.perfilService.getMiDetalleUsuario();
      console.log('Respuesta de detalle usuario:', response);
      if (response && response.data) {
        // Si response.data es un objeto, convertirlo a array
        this.detallesUsuario = Array.isArray(response.data) ? response.data : [response.data];
        this.tieneDetalleUsuario = true;
        console.log('Detalle del usuario obtenido:', this.detallesUsuario);
      } else {
        this.detallesUsuario = [];
        this.tieneDetalleUsuario = false;
      }
    } catch (error) {
      console.error('Error al obtener el detalle del usuario:', error);
      this.detallesUsuario = [];
      this.tieneDetalleUsuario = false;
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.perfilForm.get(fieldName);
    return field ? field.invalid && field.touched : false;
  }

  getFieldError(fieldName: string): string {
    const field = this.perfilForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) return 'Este campo es requerido';
    if (field.errors['pattern']) {
      if (fieldName === 'numero_documento') return 'Solo se permiten números';
      if (fieldName === 'telefono') return 'Solo se permiten números (7-15 dígitos)';
    }
    if (field.errors['email']) return 'Ingrese un email válido';

    return 'Campo inválido';
  }

  async saveProfile() {
    if (this.perfilForm.valid) {
      console.log('Guardando perfil:', JSON.stringify(this.perfilForm.value));
      try {
        const response = await this.perfilService.createPerfil(this.perfilForm.value);
        console.log('Perfil guardado exitosamente:', response);
        this.resetForm();
        await this.getDetalleUsuario();
      } catch (error) {
        console.error('Error al guardar el perfil:', error);
      }
    }
  }

  resetForm() {
    this.perfilForm.reset();
  }
  limpiarNumeros(campo: string) {
    const control = this.perfilForm.get(campo);
    if (control) {
      control.setValue(control.value.replace(/[^0-9]/g, ''), { emitEvent: false });
    }
  }

  onEditarPerfil() {
    this.tieneDetalleUsuario = false;
  }
}