import { Component } from '@angular/core';

@Component({
  selector: 'app-emprendedores',
  standalone: true,
  imports: [],
  templateUrl: './emprendedores.component.html',
  styleUrl: './emprendedores.component.css'
})
export class EmprendedoresComponent {
   emprendedores = [
    { id: 1, nombre: 'Juan Pérez', email: 'juan@empresa.com', estado: 'Activo', fechaRegistro: '2024-01-10' },
    { id: 2, nombre: 'María García', email: 'maria@negocio.com', estado: 'Inactivo', fechaRegistro: '2024-01-08' }
  ];
}
