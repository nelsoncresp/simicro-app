import { Emprendedor } from '../models/Emprendedor.js';
import { EmprendedorService } from '../services/emprendedorService.js';

export class EmprendedorController {
  static async crearEmprendedor(req, res) {
    try {
      const { id_usuario, rol } = req.user;
      console.log(req.user)

      if (rol !== 'emprendedor') {
        return res.status(403).json({ message: 'Solo los usuarios con rol emprendedor pueden crear su perfil.' });
      }

      const existente = await Emprendedor.findByUserId(id_usuario);
      if (existente) {
        return res.status(400).json({ message: 'El usuario ya tiene un perfil de emprendedor.' });
      }

      // 🔹 Validar y normalizar datos
      const datosValidados = EmprendedorService.validarDatosEmprendedor({
        id_usuario,
        ...req.body
      });

      const nuevo = await Emprendedor.create(datosValidados);
      res.status(201).json(nuevo);

    } catch (error) {
      console.error('Error creando emprendedor:', error.message);
      res.status(400).json({ message: error.message });
    }
  }

  static async obtenerEmprendedores(req, res) {
    try {
      const emprendedores = await Emprendedor.findAll();
      res.json(emprendedores);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener los emprendedores' });
    }
  }

  static async obtenerEmprendedor(req, res) {
    try {
      const { id } = req.params;
      const emprendedor = await Emprendedor.findById(id);
      if (!emprendedor) {
        return res.status(404).json({ message: 'Emprendedor no encontrado' });
      }
      res.json(emprendedor);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener emprendedor' });
    }
  }

  static async actualizarEmprendedor(req, res) {
    try {
      const { id } = req.params;
      const actualizado = await Emprendedor.update(id, req.body);
      res.json(actualizado);
    } catch (error) {
      res.status(500).json({ message: 'Error al actualizar emprendedor' });
    }
  }
}
