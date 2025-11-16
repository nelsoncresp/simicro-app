import { DetalleUsuario } from '../models/DetalleUsuario.js';
import { success, error } from '../utils/responses.js';

export class DetalleUsuarioController {
  /**
   * Crear detalle de usuario
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async crearDetalleUsuario(req, res) {
    try {
      const id_usuario = req.user?.id_usuario;
      const data = req.body;

      if (!id_usuario) return error(res, 'Usuario no autenticado', 401);

      // Validar que el usuario no tenga ya un detalle
      const existe = await DetalleUsuario.existsByUserId(id_usuario);
      if (existe) return error(res, 'El usuario ya tiene un detalle registrado', 409);

      // Validar campos obligatorios
      if (!data.numero_documento) {
        return error(res, 'Número de documento es obligatorio', 400);
      }

      const detalleUsuario = await DetalleUsuario.create(id_usuario, data);
      success(res, detalleUsuario, 'Detalle de usuario creado exitosamente', 201);
    } catch (err) {
      console.error('Error creando detalle de usuario:', err);
      if (err.code === 'ER_DUP_ENTRY') {
        return error(res, 'El número de documento ya está registrado', 409);
      }
      error(res, 'Error interno al crear detalle de usuario', 500);
    }
  }

  /**
   * Obtener detalle del usuario autenticado
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async obtenerMiDetalle(req, res) {
    try {
      const id_usuario = req.user?.id_usuario;
      if (!id_usuario) return error(res, 'Usuario no autenticado', 401);

      const detalleUsuario = await DetalleUsuario.findByUserId(id_usuario);
      if (!detalleUsuario) return error(res, 'Detalle de usuario no encontrado', 404);

      success(res, detalleUsuario, 'Detalle obtenido exitosamente');
    } catch (err) {
      console.error('Error obteniendo detalle de usuario:', err);
      error(res, 'Error interno al obtener detalle', 500);
    }
  }

  /**
   * Obtener detalle de usuario específico (admin)
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async obtenerDetalleUsuario(req, res) {
    try {
      const { id_detalle_usuario } = req.params;

      const detalleUsuario = await DetalleUsuario.findById(id_detalle_usuario);
      if (!detalleUsuario) return error(res, 'Detalle de usuario no encontrado', 404);

      success(res, detalleUsuario, 'Detalle obtenido exitosamente');
    } catch (err) {
      console.error('Error obteniendo detalle de usuario:', err);
      error(res, 'Error interno al obtener detalle', 500);
    }
  }

  /**
   * Obtener todos los detalles (admin)
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async obtenerTodosDetalles(req, res) {
    try {
      const { limit } = req.query;
      const filters = {};
      if (limit) filters.limit = parseInt(limit);

      const detalles = await DetalleUsuario.findAll(filters);
      success(res, detalles, 'Detalles obtenidos exitosamente');
    } catch (err) {
      console.error('Error obteniendo detalles:', err);
      error(res, 'Error interno al obtener detalles', 500);
    }
  }

  /**
   * Actualizar detalle del usuario autenticado
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async actualizarMiDetalle(req, res) {
    try {
      const id_usuario = req.user?.id_usuario;
      const data = req.body;

      if (!id_usuario) return error(res, 'Usuario no autenticado', 401);

      const detalleActual = await DetalleUsuario.findByUserId(id_usuario);
      if (!detalleActual) return error(res, 'Detalle de usuario no encontrado', 404);

      const detalleActualizado = await DetalleUsuario.update(detalleActual.id_detalle_usuario, data);
      success(res, detalleActualizado, 'Detalle actualizado exitosamente');
    } catch (err) {
      console.error('Error actualizando detalle:', err);
      if (err.code === 'ER_DUP_ENTRY') {
        return error(res, 'El número de documento ya está registrado', 409);
      }
      error(res, 'Error interno al actualizar detalle', 500);
    }
  }

  /**
   * Actualizar detalle específico (admin)
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async actualizarDetalleUsuario(req, res) {
    try {
      const { id_detalle_usuario } = req.params;
      const data = req.body;

      const detalleUsuario = await DetalleUsuario.findById(id_detalle_usuario);
      if (!detalleUsuario) return error(res, 'Detalle de usuario no encontrado', 404);

      const detalleActualizado = await DetalleUsuario.update(id_detalle_usuario, data);
      success(res, detalleActualizado, 'Detalle actualizado exitosamente');
    } catch (err) {
      console.error('Error actualizando detalle:', err);
      if (err.code === 'ER_DUP_ENTRY') {
        return error(res, 'El número de documento ya está registrado', 409);
      }
      error(res, 'Error interno al actualizar detalle', 500);
    }
  }

  /**
   * Eliminar detalle de usuario (admin)
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async eliminarDetalleUsuario(req, res) {
    try {
      const { id_detalle_usuario } = req.params;

      const detalleUsuario = await DetalleUsuario.findById(id_detalle_usuario);
      if (!detalleUsuario) return error(res, 'Detalle de usuario no encontrado', 404);

      const eliminado = await DetalleUsuario.delete(id_detalle_usuario);
      if (!eliminado) return error(res, 'No se pudo eliminar el detalle', 500);

      success(res, { id_detalle_usuario }, 'Detalle eliminado exitosamente');
    } catch (err) {
      console.error('Error eliminando detalle:', err);
      error(res, 'Error interno al eliminar detalle', 500);
    }
  }
}
