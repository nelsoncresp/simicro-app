import { Notificacion } from '../models/Notificacion.js';
import { success, error } from '../utils/responses.js';

export class NotificacionController {
  // Obtener notificaciones del usuario
  static async obtenerMisNotificaciones(req, res) {
    try {
      const id_usuario = req.user?.id_usuario;
      if (!id_usuario) return error(res, 'Usuario no autenticado', 401);

      const notificaciones = await Notificacion.findByUsuario(id_usuario);
      success(res, notificaciones, 'Notificaciones obtenidas');
    } catch (err) {
      console.error('Error obteniendo notificaciones:', err);
      error(res, 'Error interno al obtener notificaciones', 500);
    }
  }

  // Obtener notificaciones no leídas
  static async obtenerNoLeidas(req, res) {
    try {
      const id_usuario = req.user?.id_usuario;
      if (!id_usuario) return error(res, 'Usuario no autenticado', 401);

      const notificaciones = await Notificacion.findNoLeidas(id_usuario);
      success(res, notificaciones, `${notificaciones.length} notificaciones no leídas`);
    } catch (err) {
      console.error('Error obteniendo no leídas:', err);
      error(res, 'Error interno', 500);
    }
  }

  // Marcar notificación como leída
  static async marcarComoLeida(req, res) {
    try {
      const { id } = req.params;
      const id_usuario = req.user?.id_usuario;
      if (!id_usuario) return error(res, 'Usuario no autenticado', 401);

      const notificacion = await Notificacion.findById(id);
      if (!notificacion) return error(res, 'Notificación no encontrada', 404);

      if (notificacion.id_usuario !== id_usuario) {
        return error(res, 'No autorizado', 403);
      }

      const actualizada = await Notificacion.marcarComoLeida(id);
      success(res, actualizada, 'Notificación marcada como leída');
    } catch (err) {
      console.error('Error marcando como leída:', err);
      error(res, 'Error interno', 500);
    }
  }

  // Obtener notificaciones por solicitud (solo admin/analista)
  static async obtenerPorSolicitud(req, res) {
    try {
      const { id_solicitud } = req.params;
      const notificaciones = await Notificacion.findBySolicitud(id_solicitud);
      success(res, notificaciones, 'Notificaciones obtenidas');
    } catch (err) {
      console.error('Error:', err);
      error(res, 'Error interno', 500);
    }
  }
}
