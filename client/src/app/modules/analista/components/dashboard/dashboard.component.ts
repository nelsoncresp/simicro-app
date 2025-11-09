import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  stats = [
    { title: 'Solicitudes Pendientes', value: '12', icon: '📥' },
    { title: 'En Evaluación', value: '5', icon: '🔍' },
    { title: 'Aprobadas Hoy', value: '3', icon: '✅' },
    { title: 'Rechazadas Hoy', value: '2', icon: '❌' }
  ];
}
