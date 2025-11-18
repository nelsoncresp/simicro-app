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

  // DASHBOARD DATA
  dashboard: any = null;

  // SOLICITUDES
  solicitudes: any[] = [];
  filtered: any[] = [];
  search = '';
  tab: string = 'pendientes';

  pendientesCount = 0;
  aprobadasCount = 0;

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

  // ===========================
  // DASHBOARD
  // ===========================
  loadDashboard() {
    const token = localStorage.getItem('token');

   this.http.get(this.apiDashboard, {
  headers: { Authorization: `Bearer ${token}` }
}).subscribe({
  next: (res: any) => this.dashboard = res.data || res,
  error: () => this.dashboard = { error: true }
});

  }

  // ===========================
  // SOLICITUDES
  // ===========================
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

  actualizarContadores() {
    this.pendientesCount = this.solicitudes.filter(s => s.estado !== 'activo').length;
    this.aprobadasCount = this.solicitudes.filter(s => s.estado === 'activo').length;
  }

  // ===========================
  // DETALLE
  // ===========================
verDetalle(s: any) {
  console.log("ABRIENDO MODAL PARA:", s);

  this.showModal = true;
  this.detalle = null;

  const token = localStorage.getItem('token');
  const url = `${this.apiEmp}/${s.id_emprendedor}`;

  console.log("URL CONSULTADA:", url);

  this.http.get(url, {
    headers: { Authorization: `Bearer ${token}` }
  }).subscribe({
    next: (res: any) => {
      console.log("RESPUESTA DETALLE RAW:", res);
      this.detalle = res.data || res;
      this.detalle.id_solicitud = s.id_solicitud;
    },
    error: err => {
      console.error("ERROR DETALLE:", err);
    }
  });
}

  cerrarModal() {
    this.showModal = false;
  }

  // ===========================
  // APROBAR / DENEGAR
  // ===========================
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
      { accion: 'rechazado' },
      { headers: { Authorization: `Bearer ${token}` } }
    ).subscribe(() => {
      this.cerrarModal();
      this.loadSolicitudes();
      this.loadDashboard();
    });
  }

  isPendiente(s: any) { return s.estado !== 'activo'; }
  isAprobada(s: any) { return s.estado === 'activo'; }

  page = 1;
itemsPerPage = 5;

get paginatedList() {
  const start = (this.page - 1) * this.itemsPerPage;
  return this.filtered.slice(start, start + this.itemsPerPage);
}

totalPages() {
  return Math.ceil(this.filtered.length / this.itemsPerPage);
}

nextPage() {
  if (this.page < this.totalPages()) this.page++;
}

prevPage() {
  if (this.page > 1) this.page--;
}


}
