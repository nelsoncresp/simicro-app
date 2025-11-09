import { Component } from '@angular/core';

@Component({
  selector: 'app-solicitudes',
  standalone: true,
  imports: [],
  templateUrl: './solicitudes.component.html',
  styleUrl: './solicitudes.component.css'
})
export class SolicitudesComponent {
  solicitudes = [
    { id: 1, tipo: 'Financiamiento', estado: 'En revisión', fecha: '2024-01-15' },
    { id: 2, tipo: 'Asesoría', estado: 'Aprobada', fecha: '2024-01-10' },
    { id: 3, tipo: 'Capacitación', estado: 'Completada', fecha: '2024-01-05' }
  ];
  nuevaSolicitud() {
    console.log('Crear nueva solicitud');
  }
}
