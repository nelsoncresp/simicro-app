import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-emprendedores',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './emprendedores.component.html',
  styleUrls: ['./emprendedores.component.css']
})
export class EmprendedoresComponent implements OnInit {

  emprendedores: any[] = [];
  filtered: any[] = [];
  filtro: string = '';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.cargarEmprendedores();
  }

  cargarEmprendedores() {
    this.http
      .get('http://localhost:3000/api/emprendedores', this.authService.getAuthHeaders())
      .subscribe({
        next: (res: any) => {
          this.emprendedores = res.data || res; 
          this.filtered = [...this.emprendedores];
        },
        error: (err) => console.error("Error cargando emprendedores:", err)
      });
  }

  filtrar() {
    const term = this.filtro.toLowerCase().trim();

    this.filtered = this.emprendedores.filter(e =>
      e.nombre_emprendimiento.toLowerCase().includes(term) ||
      e.nombre_completo.toLowerCase().includes(term) ||
      e.email.toLowerCase().includes(term)
    );
  }

  totalIngresos() {
    return this.filtered.reduce((s, e) => s + Number(e.ingresos_mensuales), 0);
  }

  totalUtilidad() {
    return this.filtered.reduce((s, e) => s + Number(e.utilidad_neta), 0);
  }
}
