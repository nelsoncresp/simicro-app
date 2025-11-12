// controllers/emprendimientoController.js
import { Emprendimiento } from '../models/Emprendedor.js';
import { EmprendimientoService } from '../services/emprendedorService.js';

export class EmprendimientoController {
  static async crear(req, res) {
    try {
      const { id_usuario, rol } = req.user;

      if (rol !== 'emprendedor') {
        return res.status(403).json({ message: 'Solo los usuarios con rol emprendedor pueden crear su emprendimiento.' });
      }

      // Política: un emprendimiento por usuario
      const existente = await Emprendimiento.findByUserId(id_usuario);
      if (existente) {
        return res.status(400).json({ message: 'El usuario ya tiene un emprendimiento registrado.' });
      }

      // Validar + normalizar + sanear payload
      const validados = EmprendimientoService.validarPayload({
        id_usuario,
        ...req.body,
      });
      const limpio = EmprendimientoService.sanitizeForInsert(validados);

      const nuevo = await Emprendimiento.create(limpio);
      return res.status(201).json(nuevo);
    } catch (error) {
      console.error('Error creando emprendimiento:', error);
      return res.status(400).json({ message: error.message || 'Error al crear emprendimiento' });
    }
  }

  static async listar(req, res) {
    try {
      const list = await Emprendimiento.findAll();
      return res.json(list);
    } catch (error) {
      console.error('Error listando emprendimientos:', error);
      return res.status(500).json({ message: 'Error al obtener los emprendimientos' });
    }
  }

  static async obtener(req, res) {
    try {
      const { id } = req.params;
      const item = await Emprendimiento.findById(id);
      if (!item) return res.status(404).json({ message: 'Emprendimiento no encontrado' });
      return res.json(item);
    } catch (error) {
      console.error('Error obteniendo emprendimiento:', error);
      return res.status(500).json({ message: 'Error al obtener el emprendimiento' });
    }
  }

  static async actualizar(req, res) {
    try {
      // 🔒 Política: solo admin/analista se controla en la ruta (middleware)
      const { id } = req.params;

      // Sanitizar update: no aceptar utilidad_neta ni id_emprendimiento
      const limpio = EmprendimientoService.sanitizeForUpdate(req.body);
      const actualizado = await Emprendimiento.update(id, limpio);
      return res.json(actualizado);
    } catch (error) {
      console.error('Error actualizando emprendimiento:', error);
      return res.status(500).json({ message: 'Error al actualizar el emprendimiento' });
    }
  }
}
