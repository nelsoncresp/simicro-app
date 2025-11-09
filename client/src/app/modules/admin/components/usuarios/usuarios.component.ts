import { Component } from '@angular/core';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css'
})
export class UsuariosComponent {
   usuarios = [
    { id: 1, nombre: 'Admin Principal', email: 'admin@simicro.com', rol: 'admin', estado: 'Activo' },
    { id: 2, nombre: 'Analista 1', email: 'analista1@simicro.com', rol: 'analista', estado: 'Activo' }
  ];
}
