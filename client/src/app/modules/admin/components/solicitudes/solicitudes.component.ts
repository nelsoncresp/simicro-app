import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-solicitudes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './solicitudes.component.html',
  styleUrls: ['./solicitudes.component.css']
})
export class SolicitudesComponent implements OnInit {

  solicitudes: any[] = [];
  filtered: any[] = [];
  search = "";

  resumen = {
    total: 0,
    activas: 0,
    preAprobadas: 0,
    rechazadas: 0
  };

  private apiUrl = 'http://localhost:3000/api/solicitudes';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadSolicitudes();
  }

  loadSolicitudes() {
    const token = localStorage.getItem('token');

    this.http.get(this.apiUrl, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (res: any) => {
        this.solicitudes = res.data;
        this.filtered = [...this.solicitudes];

        this.resumen.total = this.solicitudes.length;
        this.resumen.activas = this.solicitudes.filter(s => s.estado === 'activo').length;
        this.resumen.preAprobadas = this.solicitudes.filter(s => s.estado === 'pre-aprobado').length;
        this.resumen.rechazadas = this.solicitudes.filter(s => s.estado === 'rechazado').length;
      },
      error: (err) => console.error("Error cargando solicitudes:", err)
    });
  }

  filtrar() {
    const term = this.search.toLowerCase();
    this.filtered = this.solicitudes.filter(s =>
      s.nombre_emprendedor.toLowerCase().includes(term) ||
      s.nombre_negocio.toLowerCase().includes(term) ||
      s.estado.toLowerCase().includes(term)
    );
  }

  editar(id: number) {
    console.log("Editar solicitud: ", id);
  }

  eliminar(id: number) {
    console.log("Eliminar solicitud: ", id);
  }

  getEstadoClass(estado: string) {
    switch (estado) {
      case 'activo': return 'bg-green-100 text-green-700';
      case 'pre-aprobado': return 'bg-yellow-100 text-yellow-700';
      case 'rechazado': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }
}
