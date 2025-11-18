import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-analista-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html'
})
export class AnalistaViewComponent implements OnInit {

  currentUser = signal<any>(null);

  // DASHBOARD
  dashboard: any = null;

  // SOLICITUDES
  solicitudes: any[] = [];
  filtered: any[] = [];
  search = '';
  tab: string = 'pendiente';

  // CONTADORES
  pendientesCount = 0;
  preAprobadasCount = 0;
  activasCount = 0;
  aprobadasCount = 0;
  rechazadasCount = 0;

  // MODAL
  showModal = false;
  detalle: any = null;

  private apiDashboard = 'http://localhost:3000/api/dashboard/general';
  private apiSol = 'http://localhost:3000/api/solicitudes';
  private apiEmp = 'http://localhost:3000/api/emprendedores';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    const u = localStorage.getItem('currentUser');
    if (u) this.currentUser.set(JSON.parse(u));

    this.loadDashboard();
    this.loadSolicitudes();
  }

  // ==========================
  // DASHBOARD
  // ==========================
  loadDashboard() {
    const token = localStorage.getItem('token');

    this.http.get(this.apiDashboard, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (res: any) => this.dashboard = res.data || res,
      error: () => this.dashboard = { error: true }
    });
  }

  // ==========================
  // SOLICITUDES
  // ==========================
  loadSolicitudes() {
    const token = localStorage.getItem('token');

    this.http.get(this.apiSol, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe((res: any) => {
      this.solicitudes = res.data;
      this.filtered = [...this.solicitudes];
      this.actualizarContadores();
    });
  }

  filtrar() {
    const term = this.search.toLowerCase();

    this.filtered = this.solicitudes.filter(s =>
      s.nombre_negocio.toLowerCase().includes(term) ||
      s.nombre_emprendedor.toLowerCase().includes(term) ||
      s.id_solicitud.toString().includes(term)
    );

    this.actualizarContadores();
  }

  // MÉTODO ACTUALIZADO - AHORA USA filtered PARA LOS CONTADORES
  actualizarContadores() {
    this.pendientesCount   = this.filtered.filter(s => s.estado === 'pendiente').length;
    this.preAprobadasCount = this.filtered.filter(s => s.estado === 'pre-aprobado').length;
    this.activasCount      = this.filtered.filter(s => s.estado === 'activo').length;
    this.aprobadasCount    = this.filtered.filter(s => s.estado === 'aprobado').length;
    this.rechazadasCount   = this.filtered.filter(s => s.estado === 'rechazado').length;
  }

  // MÉTODO PARA CAMBIAR DE PESTAÑA
  cambiarTab(nuevaTab: string) {
    this.tab = nuevaTab;
  }

  // ==========================
  // DETALLE - MODAL
  // ==========================
  verDetalle(s: any) {
    this.showModal = true;
    this.detalle = null;

    const token = localStorage.getItem('token');
    const url = `${this.apiEmp}/${s.id_emprendedor}`;

    this.http.get(url, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (res: any) => {
        this.detalle = res.data || res;

        // Pasamos info de la solicitud
        this.detalle.id_solicitud = s.id_solicitud;
        this.detalle.estado = s.estado;     
      },
      error: err => console.error("ERROR DETALLE:", err)
    });
  }

  cerrarModal() {
    this.showModal = false;
  }

  // ==========================
  // BOTONES DEL MODAL
  // ==========================
  mostrarAcciones(): boolean {
    if (!this.detalle?.estado) return false;

    const estado = this.detalle.estado.toLowerCase();

    return estado === 'pendiente' || estado === 'pre-aprobado';
  }

  // ==========================
  // APROBAR / DENEGAR
  // ==========================
  aprobar(id: number) {
    const token = localStorage.getItem('token');

    this.http.patch(
      `${this.apiSol}/${id}/decision`,
      { accion: 'aprobar' },
      { headers: { Authorization: `Bearer ${token}` } }
    ).subscribe(() => {
      this.cerrarModal();
      this.loadSolicitudes();
      this.loadDashboard();
    });
  }

  denegar(id: number) {
    const token = localStorage.getItem('token');

    this.http.patch(
      `${this.apiSol}/${id}/decision`,
      { accion: 'rechazar' },
      { headers: { Authorization: `Bearer ${token}` } }
    ).subscribe(() => {
      this.cerrarModal();
      this.loadSolicitudes();
      this.loadDashboard();
    });
  }

  // ==========================
  // MÉTODOS POR ESTADO
  // ==========================
  isPendiente(s: any)    { return s.estado === 'pendiente'; }
  isPreAprobada(s: any)  { return s.estado === 'pre-aprobado'; }
  isActiva(s: any)       { return s.estado === 'activo'; }
  isAprobada(s: any)     { return s.estado === 'aprobado'; }
  isRechazada(s: any)    { return s.estado === 'rechazado'; }

  // MÉTODO PARA OBTENER SOLICITUDES VISIBLES EN LA PESTAÑA ACTUAL
  getSolicitudesVisibles() {
    return this.filtered.filter(s => {
      switch (this.tab) {
        case 'pendiente': return this.isPendiente(s);
        case 'pre-aprobado': return this.isPreAprobada(s);
        case 'activo': return this.isActiva(s);
        case 'aprobado': return this.isAprobada(s);
        case 'rechazado': return this.isRechazada(s);
        default: return false;
      }
    });
  }
}