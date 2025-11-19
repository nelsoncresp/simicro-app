import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule], 
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent implements OnInit {

  usuarios: any[] = [];
  filtered: any[] = [];
  search: string = "";

  resumen = {
    total: 0,
    admins: 0,
    analistas: 0,
    emprendedores: 0
  };

  private apiUrl = 'http://localhost:3000/api/users';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    const token = localStorage.getItem('token');

    this.http.get(this.apiUrl, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (res: any) => {
        this.usuarios = res.data;
        this.filtered = [...this.usuarios];

        this.resumen.total = this.usuarios.length;
        this.resumen.admins = this.usuarios.filter(u => u.rol === 'admin').length;
        this.resumen.analistas = this.usuarios.filter(u => u.rol === 'analista').length;
        this.resumen.emprendedores = this.usuarios.filter(u => u.rol === 'emprendedor').length;
      },
      error: (err) => console.error('Error cargando usuarios:', err)
    });
  }

  filtrar() {
    const term = this.search.toLowerCase();
    this.filtered = this.usuarios.filter(u =>
      u.nombre.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      u.rol.toLowerCase().includes(term)
    );
  }

  editarUsuario(id: number) {
    console.log("Editar user:", id);
  }

  eliminarUsuario(id: number) {
    const token = localStorage.getItem('token');

    this.http.patch(`${this.apiUrl}/${id}/desactivar`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: () => {
        console.log("Usuario desactivado:", id);
        this.loadUsers();
      },
      error: (err) => console.error('Error desactivando usuario:', err)
    });
  }
}