import { User } from '../models/User.js';
import { success, error } from '../utils/responses.js';

export class UserController {
  // Obtener todos los usuarios
  static async obtenerUsuarios(req, res) {
    try {
      const users = await User.findAll();
      success(res, users, 'Usuarios obtenidos');
    } catch (err) {
      console.error('Error obteniendo usuarios:', err);
      error(res, 'Error obteniendo usuarios', 500);
    }
  }

  // Obtener usuario por ID
  static async obtenerUsuario(req, res) {
    try {
      const { id } = req.params;
      const user = await User.findById(id);

      if (!user) {
        return error(res, 'Usuario no encontrado', 404);
      }

      success(res, user, 'Usuario obtenido');
    } catch (err) {
      console.error('Error obteniendo usuario:', err);
      error(res, 'Error obteniendo usuario', 500);
    }
  }

  // Desactivar usuario
  static async desactivarUsuario(req, res) {
    try {
      const { id } = req.params;
      await User.deactivate(id);
      success(res, null, 'Usuario desactivado correctamente');
    } catch (err) {
      console.error('Error desactivando usuario:', err);
      error(res, 'Error desactivando usuario', 500);
    }
  }
}