import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
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
