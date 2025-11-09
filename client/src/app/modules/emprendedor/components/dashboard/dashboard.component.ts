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
    { title: 'Solicitudes Activas', value: '3', icon: '📋' },
    { title: 'En Evaluación', value: '1', icon: '⏳' },
    { title: 'Aprobadas', value: '2', icon: '✅' },
    { title: 'Rechazadas', value: '0', icon: '❌' }
  ];
}
