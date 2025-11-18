import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CreditoService } from '../../../../core/services/credito.service';
import { respApiCreditos } from '../../../../interfaces/creditos/respApiCreditos.interface';
import { CommonModule } from '@angular/common';
import { CuotaService } from '../../../../core/services/cuotas.service';
import { RespApiCuotas } from '../../../../interfaces/cuotas/respApiCuotas.interface';
import { PagoService } from '../../../../core/services/pago.service';
import { FormBuilder, Validators } from '@angular/forms';
import { UtilidadesService } from '../../../../core/services/utilidades.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from "@angular/router";

@Component({
  selector: 'app-mi-estado-de-cuenta',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './mi-estado-de-cuenta.component.html',
  styleUrl: './mi-estado-de-cuenta.component.css'
})
export class MiEstadoDeCuentaComponent implements OnInit {

  private creditosService = inject(CreditoService);
  private cuotaService = inject(CuotaService);
  private pagoService = inject(PagoService);
  private utilidadesService = inject(UtilidadesService);
  private router = inject(Router);
  private fb = new FormBuilder();

  dataCreditos: respApiCreditos[] = [];
  dataCuotas: RespApiCuotas[] = [];
  tieneCreditos = signal(false);
  respCreditos = signal("");
  tieneCuotas = signal(false);
  respCuotas = signal("");
  // Modal y cuota seleccionada
  modalVisible = signal(false);
  selectedCuota = signal<RespApiCuotas | null>(null);
  // Paginación para cuotas
  pageSize = 10;
  currentPage = signal(1);


  pagarCuotaForm = this.fb.group({
    id_cuota: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
    monto_recibido: ['', [Validators.required, Validators.pattern(/^\d{0,13}(\.\d{1,2})?$/)]],
    metodo_pago: ['', Validators.required],
    referencia_pago: ['', Validators.required],
    observaciones: [''],
  });

  ngOnInit(): void {
    this.cargarCreditos();
    this.cargarCuotas();
  }

  async cargarCreditos() {
    try {
      const response = await this.creditosService.getMisCreditos();
      if (response && response.data.length > 0) {
        this.dataCreditos = response.data;
        this.tieneCreditos.set(false);
        // console.log('Créditos obtenidos:', response.data);
        // console.log('Desde dataCreditos:', this.dataCreditos);
      } else {
        this.tieneCreditos.set(true);
        this.respCreditos.set("No se encontraron créditos asociados al usuario.");
      }
    } catch (error) {
      if (error instanceof HttpErrorResponse) {
        this.utilidadesService.toastError(error.message);
      }
    }
  }

  async cargarCuotas() {
    try {
      const response = await this.cuotaService.getCuotas();

      if (response && response.data.length > 0) {
        this.dataCuotas = response.data;
        this.tieneCuotas.set(true);
        // resetear paginado al cargar
        this.currentPage.set(1);
        // console.log('Cuotas obtenidas desde data cuotas:', this.dataCuotas);
      } else {
        this.dataCuotas = [];
        this.respCuotas.set("No se encontraron cuotas asociadas al usuario.");
      }

    } catch (error) {
      console.error('Error al cargar las cuotas:', error);
      if (error instanceof HttpErrorResponse) {
        this.utilidadesService.toastError(error.message);
      }
    }
  }

  // Abre el modal para pagar una cuota
  openPagarModal(cuota: RespApiCuotas) {
    this.selectedCuota.set(cuota);
    // precargar el id de la cuota en el formulario (convertir a string porque el control espera texto)
    this.pagarCuotaForm.patchValue({ id_cuota: String(cuota.id_cuota), monto_recibido: cuota.monto_esperado });
    this.modalVisible.set(true);
  }

  closePagarModal() {
    this.modalVisible.set(false);
    this.selectedCuota.set(null);
    this.pagarCuotaForm.reset();
  }

  // Enviar pago desde el modal
  async registrarPago() {
    if (this.pagarCuotaForm.invalid) {
      this.pagarCuotaForm.markAllAsTouched();
      return;
    }

    try {
      const pagoData = this.pagarCuotaForm.value;
      const response = await this.pagoService.registrarPago(pagoData);
      // console.log('Pago registrado exitosamente:', response);
      this.utilidadesService.toastExito(response.message);
      // cerrar modal y recargar cuotas
      this.closePagarModal();
      await this.cargarCuotas();
      await this.cargarCreditos();
    } catch (error) {
      if (error instanceof HttpErrorResponse) {
        this.utilidadesService.toastError(error.message);
      }
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

  // Paginación helpers
  get totalCuotas(): number {
    return this.dataCuotas.length;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalCuotas / this.pageSize));
  }

  getPagedCuotas(): RespApiCuotas[] {
    const page = this.currentPage();
    const start = (page - 1) * this.pageSize;
    return this.dataCuotas.slice(start, start + this.pageSize);
  }

  prevPage() {
    const page = this.currentPage();
    if (page > 1) this.currentPage.set(page - 1);
  }

  nextPage() {
    const page = this.currentPage();
    if (page < this.totalPages) this.currentPage.set(page + 1);
  }

  setPage(n: number) {
    if (n >= 1 && n <= this.totalPages) this.currentPage.set(n);
  }

  pagesArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  irAmisSolicitudes() {
    // Navegar a la página de solicitudes de crédito
    this.router.navigate(['/emprendedor/solicitudes']);
  }

}
