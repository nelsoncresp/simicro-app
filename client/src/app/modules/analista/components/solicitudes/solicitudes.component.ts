import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-solicitudes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './solicitudes.component.html'
})
export class SolicitudesComponent implements OnInit {

  solicitudes: any[] = [];
  filtered: any[] = [];
  search = '';

  showModal = false;
  detalle: any = null;

  tab: string = 'pendientes';

  pendientesCount = 0;
  aprobadasCount = 0;

  private apiSol = 'http://localhost:3000/api/solicitudes';
  private apiEmp = 'http://localhost:3000/api/emprendedores';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadSolicitudes();
  }

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

  verDetalle(s: any) {
    this.showModal = true;
    this.detalle = null;

    const token = localStorage.getItem('token');
    const url = `${this.apiEmp}/${s.id_emprendedor}`;

    this.http.get(url, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe((res: any) => this.detalle = res.data);
  }

  cerrarModal() {
    this.showModal = false;
  }

  aprobar(id: number) { console.log('Aprobar', id); }
  rechazar(id: number) { console.log('Rechazar', id); }

}
