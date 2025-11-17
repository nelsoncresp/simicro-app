import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { DashboardService } from '../../../../core/services/dashboard.service';
import { ChartData, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {

  usuario = "Admin"; 

  dashboardData: any = null;

  // Chart containers
  barHorizontalData!: ChartData<'bar'>;
  pieSemiDonutData!: ChartData<'doughnut'>;
  areaDegradadoData!: ChartData<'line'>;
  barraApiladaData!: ChartData<'bar'>;
  polarChartData!: ChartData<'polarArea'>;

  chartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: "#334155" } }
    }
  };

  constructor(private dashboardService: DashboardService) {}

  ngOnInit() {
    this.loadDashboard();
  }

loadDashboard() {
  this.dashboardService.getGeneralDashboard().subscribe({
    next: (res: any) => {
      
      this.dashboardData = res.data; 

      this.initCharts(
        res.data,          
        res.data.alertas,  
        res.data.actividadReciente
      );
    },
    error: (err) => console.error("Error Dashboard:", err)
  });
}


 initCharts(metricas: any, alertas: any, actividad: any) {

  // 1️⃣ Barras horizontales (solicitudes)
  this.barHorizontalData = {
    labels: ['Pendientes', 'Aprobadas'],
    datasets: [
      {
        label: 'Solicitudes',
        data: [
          metricas.solicitudesPreAprobadas,
          metricas.tasaAprobacion // tasa %
        ],
        backgroundColor: ['#FCA5A5', '#34D399'],
        borderRadius: 8
      }
    ]
  };


  // 2️⃣ Semi Donut de créditos
  const cerrados = metricas.totalCreditos - metricas.creditosActivos;

  this.pieSemiDonutData = {
    labels: ['Activos', 'Cerrados'],
    datasets: [
      {
        data: [metricas.creditosActivos, cerrados],
        backgroundColor: ['#60A5FA', '#94A3B8']
      }
    ]
  };


  // 3️⃣ Área degradado (ingresos mensuales)
  this.areaDegradadoData = {
    labels: ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'],
    datasets: [
      {
        label: 'Ingresos del Mes',
        data: [
          metricas.ingresosMensuales * 0.20,
          metricas.ingresosMensuales * 0.25,
          metricas.ingresosMensuales * 0.30,
          metricas.ingresosMensuales * 0.25
        ],
        fill: true,
        borderColor: '#A78BFA',
        backgroundColor: 'rgba(167,139,250,0.25)',
        tension: 0.35
      }
    ]
  };


  // 4️⃣ Barra apilada (créditos activos vs vencidos)
  this.barraApiladaData = {
    labels: ['Activos', 'Vencidos'],
    datasets: [
      {
        label: 'Activos',
        data: [metricas.creditosActivos, 0],
        backgroundColor: '#34D399'
      },
      {
        label: 'Pagos vencidos',
        data: [0, metricas.pagosVencidos],
        backgroundColor: '#FCA5A5'
      }
    ]
  };


  // 5️⃣ Polar Area
  this.polarChartData = {
    labels: ['Mora', 'Aprobación', 'Ingresos', 'Créditos activos'],
    datasets: [
      {
        data: [
          metricas.pagosVencidos,
          metricas.tasaAprobacion,
          metricas.ingresosMensuales,
          metricas.creditosActivos
        ],
        backgroundColor: [
          '#FCA5A5', '#A78BFA', '#60A5FA', '#34D399'
        ]
      }
    ]
  };

}

}
