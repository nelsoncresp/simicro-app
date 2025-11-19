import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SolicitudService } from '../../../../core/services/solicitud.service';
import { UtilidadesService } from '../../../../core/services/utilidades.service';
import { Solicitud } from '../../../../interfaces/solicitudes/respMisSolicitudes.interface';
import { HttpErrorResponse } from '@angular/common/http';


@Component({
  selector: 'app-solicitudes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './solicitudes.component.html',
  styleUrl: './solicitudes.component.css'
})
export class SolicitudesComponent implements OnInit {
  solicitudForm!: FormGroup;
  solicitudes: Solicitud[] = [];
  tieneSolicitudes: boolean = false;
  cargando: boolean = true;

  private fb = inject(FormBuilder);
  private solicitudServie = inject(SolicitudService);
  private utilidadesService = inject(UtilidadesService);

  ngOnInit(): void {
    this.formulario();
    this.misSolicitudes();
  }

  formulario() {
    this.solicitudForm = this.fb.group({
      monto_solicitado: ['', [Validators.required, Validators.min(1), Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      motivo_prestamo: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      plazo_meses: ['', [Validators.required, Validators.min(1), Validators.max(120), Validators.pattern(/^\d+$/)]]
    });
  }

  async misSolicitudes() {
    try {
      this.cargando = true;
      const response: any = await this.solicitudServie.getMisSolicitudes();
      console.log('Respuesta de mis solicitudes:', response);

      if (response && response.data && response.data.length > 0) {
        this.solicitudes = response.data;
        this.tieneSolicitudes = true;
      } else {
        this.solicitudes = [];
        this.tieneSolicitudes = false;
      }
    } catch (error) {
      console.error('Error al obtener solicitudes:', error);
      this.solicitudes = [];
      this.tieneSolicitudes = false;
    } finally {
      this.cargando = false;
    }
  }

  async onSubmit() {
    if (this.solicitudForm.valid) {
      const formData = {
        monto_solicitado: parseFloat(this.solicitudForm.value.monto_solicitado),
        motivo_prestamo: this.solicitudForm.value.motivo_prestamo,
        plazo_meses: parseInt(this.solicitudForm.value.plazo_meses, 10)
      };
      console.log('Datos del formulario:', formData);
      try {
        const result = await this.solicitudServie.createSolicitud(formData);
        console.log('respuesta despues de crear la solicitud: ', result);
        await this.misSolicitudes();
        this.resetForm();
      } catch (err) {
        console.error('error al crear la solicitud: ', err);
        if (err instanceof HttpErrorResponse) {
          this.utilidadesService.toastError(err.error.message);
        }
      }
    } else {
      this.markFormGroupTouched(this.solicitudForm);
    }
  }

  formatearFecha(fecha: string | null): string {
    if (!fecha) return 'aún no disponible';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatearMoneda(monto: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'COP'
    }).format(monto);
  }

  getEstadoClass(estado: string): string {
    const estados: { [key: string]: string } = {
      'Aprobada': 'estado-aprobada',
      'Rechazada': 'estado-rechazada',
      'En revisión': 'estado-revision',
      'Pendiente': 'estado-pendiente',
      'Completada': 'estado-completada'
    };
    return estados[estado] || 'estado-default';
  }

  getRiesgoClass(calificacion: string): string {
    const riesgos: { [key: string]: string } = {
      'Bajo': 'riesgo-bajo',
      'Medio': 'riesgo-medio',
      'Alto': 'riesgo-alto'
    };
    return riesgos[calificacion] || 'riesgo-default';
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  get monto_solicitado() {
    return this.solicitudForm.get('monto_solicitado');
  }

  get motivo_prestamo() {
    return this.solicitudForm.get('motivo_prestamo');
  }

  get plazo_meses() {
    return this.solicitudForm.get('plazo_meses');
  }

  resetForm(): void {
    this.solicitudForm.reset();
  }
}
