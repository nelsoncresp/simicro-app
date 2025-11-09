import { Emprendedor } from '../models/Emprendedor.js';
import { success, error } from '../utils/responses.js';

export class EmprendedorController {
  // Obtener todos los emprendedores
  static async obtenerEmprendedores(req, res) {
    try {
      const emprendedores = await Emprendedor.findAll();
      success(res, emprendedores, 'Emprendedores obtenidos');
    } catch (err) {
      console.error('Error obteniendo emprendedores:', err);
      error(res, 'Error obteniendo emprendedores', 500);
    }
  }

  // Obtener emprendedor por ID
  static async obtenerEmprendedor(req, res) {
    try {
      const { id } = req.params;
      const emprendedor = await Emprendedor.findById(id);

      if (!emprendedor) {
        return error(res, 'Emprendedor no encontrado', 404);
      }

      success(res, emprendedor, 'Emprendedor obtenido');
    } catch (err) {
      console.error('Error obteniendo emprendedor:', err);
      error(res, 'Error obteniendo emprendedor', 500);
    }
  }

  // Actualizar emprendedor
  static async actualizarEmprendedor(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const emprendedor = await Emprendedor.update(id, updateData);
      success(res, emprendedor, 'Emprendedor actualizado');
    } catch (err) {
      console.error('Error actualizando emprendedor:', err);
      error(res, 'Error actualizando emprendedor', 500);
    }
  }
}