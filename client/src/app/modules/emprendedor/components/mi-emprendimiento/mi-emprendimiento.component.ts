import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { EmprendedorService } from '../../../../core/services/emprendedor.service';
import { UtilidadesService } from '../../../../core/services/utilidades.service';

@Component({
  selector: 'app-mi-emprendimiento',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './mi-emprendimiento.component.html',
  styleUrl: './mi-emprendimiento.component.css'
})
export class MiEmprendimientoComponent implements OnInit {
  private fb = inject(FormBuilder);

  getEmpredimiento = signal(false);
  tieneEmprendimiento = signal(false);

  private emprendedorService = inject(EmprendedorService);
  private utilidadesService = inject(UtilidadesService);

  activeTab: number = 0;

  emprendimientoForm: FormGroup = this.fb.group({
    nombre_emprendimiento: ['', [Validators.required]],
    sector_economico: ['', [Validators.required]],
    ubicacion_negocio: ['', [Validators.required]],
    tiempo_funcionamiento: ['', [Validators.required]],
    tipo_local: ['', [Validators.required]],
    numero_trabajadores: [0, [Validators.required, Validators.min(0)]],
    ingresos_mensuales: [0, [Validators.required, Validators.min(0)]],
    gastos_mensuales: [0, [Validators.required, Validators.min(0)]],
    productos_servicios: ['', [Validators.required]],
    canales_venta: ['', [Validators.required]],
    frecuencia_ventas: ['', [Validators.required]],
    apoyo_familiar: ['', [Validators.required]],
    nivel_educativo: ['', [Validators.required]]
  });

  // Opciones para los select
  sectoresEconomicos = [
    'Comercio',
    'Servicios',
    'Manufactura',
    'Tecnología',
    'Alimentación',
    'Construcción',
    'Turismo',
    'Salud',
    'Educación',
    'Otro'
  ];

  tiposLocal = [
    'Local propio',
    'Local alquilado',
    'Domicilio',
    'Mercado',
    'Venta ambulante',
    'Online',
    'Otro'
  ];

  canalesVenta = [
    'Presencial',
    'Online',
    'Redes sociales',
    'WhatsApp',
    'Telemarketing',
    'Distribuidores',
    'Otro'
  ];

  frecuenciasVenta = [
    'Diaria',
    'Varias veces por semana',
    'Semanal',
    'Quincenal',
    'Mensual',
    'Ocasional'
  ];

  nivelesApoyo = [
    'Total',
    'Parcial',
    'Ninguno'
  ];

  nivelesEducativos = [
    'Primaria',
    'Secundaria',
    'Técnico',
    'Universitario',
    'Postgrado'
  ];

  ngOnInit(): void {
    this.getEmprendimientoByUser();
    console.log('tiene emprendimiento: ', this.tieneEmprendimiento());
  }

  async getEmprendimientoByUser() {
    try {
      const response = await this.emprendedorService.getEmprendimientoByUser();
      if (response != null && response && response.length > 0) {
        this.emprendimientoForm.patchValue(response[0]);
        console.log(response);
        this.getEmpredimiento.set(true);
        this.tieneEmprendimiento.set(true);
        console.log('tiene empredimiento desde get:', this.tieneEmprendimiento())
      } else {
        this.getEmpredimiento.set(false);
        this.tieneEmprendimiento.set(false);
      }
    } catch (error) {
      console.error('Error al obtener el emprendimiento:', error);
      this.getEmpredimiento.set(false);
      this.tieneEmprendimiento.set(false);
    }
  }

  getFormValue(fieldName: string): any {
    return this.emprendimientoForm.get(fieldName)?.value || 'No especificado';
  }

  getUtilidad(): number {
    const ingresos = this.emprendimientoForm.get('ingresos_mensuales')?.value || 0;
    const gastos = this.emprendimientoForm.get('gastos_mensuales')?.value || 0;
    return ingresos - gastos;
  }

  async createEmprendimiento() {
    console.log('Creando emprendimiento:', this.emprendimientoForm.value);
    try {
      const response = await this.emprendedorService.createEmprendimiento(this.emprendimientoForm.value);
      this.utilidadesService.toastExito('Emprendimiento creado correctamente');
      // this.tieneEmprendimiento.set(true);
      // Recargar los datos después de crear
      await this.getEmprendimientoByUser();
    } catch (error) {
      console.error('Error al crear el emprendimiento:', error);
      this.utilidadesService.toastExito('Error al crear el emprendimiento');
    }
  }

  setActiveTab(index: number): void {
    this.activeTab = index;
  }

  onSubmit(): void {
    if (this.emprendimientoForm.valid) {
      this.createEmprendimiento();
    } else {
      console.log('Formulario inválido');
      this.emprendimientoForm.markAllAsTouched();
    }
  }

  getFieldError(fieldName: string): string {
    const field = this.emprendimientoForm.get(fieldName);
    if (field?.hasError('required') && field?.touched) {
      return 'Este campo es requerido';
    }
    if (field?.hasError('min') && field?.touched) {
      return 'El valor debe ser mayor o igual a 0';
    }
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.emprendimientoForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }
}
