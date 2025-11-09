import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-analista-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
        <div class="px-4 py-6 sm:px-0">
      <h2 class="text-2xl font-bold text-gray-900 mb-6">Dashboard Analista</h2>
      
      <!-- Stats Grid -->
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <dt class="text-sm font-medium text-gray-500 truncate">Solicitudes Pendientes</dt>
            <dd class="mt-1 text-3xl font-semibold text-yellow-600">15</dd>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <dt class="text-sm font-medium text-gray-500 truncate">En Evaluación</dt>
            <dd class="mt-1 text-3xl font-semibold text-blue-600">8</dd>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <dt class="text-sm font-medium text-gray-500 truncate">Aprobadas Hoy</dt>
            <dd class="mt-1 text-3xl font-semibold text-green-600">3</dd>
          </div>
        </div>
      </div>

      <!-- Actividad Reciente -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Solicitudes Recientes</h3>
          <div class="border-t border-gray-200 pt-4">
            <p class="text-gray-500">Lista de solicitudes pendientes de evaluación...</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent { }