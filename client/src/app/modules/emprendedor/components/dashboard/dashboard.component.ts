import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificacionesService } from '../../../../core/services/notificaciones.service';
import { PerfilService } from '../../../../core/services/perfil.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})

export class DashboardComponent implements OnInit {

  private perfilService = inject(PerfilService);
  private notiService = inject(NotificacionesService);

  nombreUsuario: string = '';
  nombreEmprendimiento: string = '';

  notificaciones: any[] = [];
  loading = true;

  ngOnInit(): void {
    this.cargarPerfil();
    this.cargarNotificaciones();
  }

  cargarPerfil() {
    this.perfilService.getPerfil().subscribe({
      next: (res: any) => {
        this.nombreUsuario = res.data?.nombre || '';
        this.nombreEmprendimiento = res.data?.emprendedor?.nombre_emprendimiento || '';
      }
    });
  }

  cargarNotificaciones() {
    this.notiService.getNotificaciones().subscribe({
      next: (res: any) => {
        this.notificaciones = res.data ?? res;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }
  
}
