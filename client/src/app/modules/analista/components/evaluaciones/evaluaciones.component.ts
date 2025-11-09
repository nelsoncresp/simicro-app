import { Component } from '@angular/core';

@Component({
  selector: 'app-evaluaciones',
  standalone: true,
  imports: [],
  templateUrl: './evaluaciones.component.html',
  styleUrl: './evaluaciones.component.css'
})
export class EvaluacionesComponent {
   evaluaciones = [
    { id: 1, solicitud: 'FIN-001', emprendedor: 'Carlos López', resultado: 'Aprobada', fecha: '2024-01-13' },
    { id: 2, solicitud: 'ASE-002', emprendedor: 'Ana Martínez', resultado: 'Rechazada', fecha: '2024-01-12' }
  ];
}
