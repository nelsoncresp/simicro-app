import { Notificacion } from '../models/Notificacion.js';
import pool from '../config/database.js';

export class NotificacionService {
  /**
   * Enviar SMS de aprobación de solicitud (sin Twilio - solo guarda en BD)
   */
  static async enviarSmsAprobacion(id_usuario, id_solicitud, nombreUsuario, nombreNegocio, monto, plazo) {
    try {
      // Obtener teléfono del usuario
      const telefono = await this.obtenerTelefonoUsuario(id_usuario);

      const mensaje = `¡Felicidades ${nombreUsuario}! Tu solicitud de crédito por $${monto.toLocaleString('es-CO')} para "${nombreNegocio}" ha sido APROBADA. Plazo: ${plazo} semanas. 🎉`;

      // 💾 Registrar notificación en BD
      const notificacion = await Notificacion.create({
        id_usuario,
        id_solicitud,
        tipo: 'aprobado',
        mensaje,
        estado_envio: 'pendiente', // Será 'enviado' cuando configures Twilio
        telefono: telefono || 'No registrado'
      });

      console.log('✓ Notificación de APROBACIÓN guardada en BD:', notificacion.id_notificacion);
      return notificacion;
    } catch (err) {
      console.error('Error guardando notificación de aprobación:', err);
      return null;
    }
  }

  /**
   * Enviar SMS de rechazo de solicitud (sin Twilio - solo guarda en BD)
   */
  static async enviarSmsRechazo(id_usuario, id_solicitud, nombreUsuario, nombreNegocio, motivo) {
    try {
      // Obtener teléfono del usuario
      const telefono = await this.obtenerTelefonoUsuario(id_usuario);

      const mensaje = `Hola ${nombreUsuario}, tu solicitud de crédito para "${nombreNegocio}" ha sido RECHAZADA. Motivo: ${motivo}. Contáctanos para más información. 📞`;

      // 💾 Registrar notificación en BD
      const notificacion = await Notificacion.create({
        id_usuario,
        id_solicitud,
        tipo: 'rechazado',
        mensaje,
        estado_envio: 'pendiente',
        telefono: telefono || 'No registrado'
      });

      console.log('✓ Notificación de RECHAZO guardada en BD:', notificacion.id_notificacion);
      return notificacion;
    } catch (err) {
      console.error('Error guardando notificación de rechazo:', err);
      return null;
    }
  }

  /**
   * Notificación de pago recibido
   */
  static async enviarSmsPagoRecibido(id_usuario, numeroCuota, monto, saldoPendiente) {
    try {
      const telefono = await this.obtenerTelefonoUsuario(id_usuario);

      const mensaje = `Pago recibido: $${monto.toLocaleString('es-CO')} por cuota #${numeroCuota}. Saldo pendiente: $${saldoPendiente.toLocaleString('es-CO')}. Gracias por tu puntualidad. ✓`;

      await Notificacion.create({
        id_usuario,
        id_solicitud: null,
        tipo: 'pago_recibido',
        mensaje,
        estado_envio: 'pendiente',
        telefono: telefono || 'No registrado'
      });

      console.log('✓ Notificación de PAGO guardada en BD');
      return true;
    } catch (err) {
      console.error('Error guardando notificación de pago:', err);
      return null;
    }
  }

  /**
   * Notificación de mora
   */
  static async enviarSmsMora(id_usuario, numeroCuota, diasMora, monto, multaMora) {
    try {
      const telefono = await this.obtenerTelefonoUsuario(id_usuario);

      const mensaje = `⚠️ Cuota #${numeroCuota} en MORA: ${diasMora} días vencida. Deuda: $${monto.toLocaleString('es-CO')}. Multa por mora: $${multaMora.toLocaleString('es-CO')}. Paga ya para evitar problemas. 📞`;

      await Notificacion.create({
        id_usuario,
        id_solicitud: null,
        tipo: 'mora',
        mensaje,
        estado_envio: 'pendiente',
        telefono: telefono || 'No registrado'
      });

      console.log('✓ Notificación de MORA guardada en BD');
      return true;
    } catch (err) {
      console.error('Error guardando notificación de mora:', err);
      return null;
    }
  }

  /**
   * Obtener teléfono del usuario desde detalle_usuarios
   */
  static async obtenerTelefonoUsuario(id_usuario) {
    try {
      const [rows] = await pool.execute(
        `SELECT telefono FROM detalle_usuarios WHERE id_usuario = ?`,
        [id_usuario]
      );
      return rows[0]?.telefono || null;
    } catch (err) {
      console.error('Error obteniendo teléfono:', err);
      return null;
    }
  }
}
