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
    { id: 1, emprendedor: 'Juan Pérez', tipo: 'Financiamiento', fecha: '2024-01-15', estado: 'Pendiente' },
    { id: 2, emprendedor: 'María García', tipo: 'Asesoría', fecha: '2024-01-14', estado: 'En evaluación' }
  ];

  evaluarSolicitud(solicitud: any) {
    console.log('Evaluar solicitud:', solicitud);
  }

}
