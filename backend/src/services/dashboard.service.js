import pool from '../config/database.js';

export class DashboardService {

  static async getMetricasGenerales() {
    try {

      // 1️⃣ Total usuarios
      const [users] = await pool.execute(`SELECT COUNT(*) AS total FROM usuarios`);
      const totalUsuarios = users[0].total;

      // 2️⃣ Usuarios activos: campo activo = 1
      const [activos] = await pool.execute(`
        SELECT COUNT(*) AS total 
        FROM usuarios 
        WHERE activo = 1
      `);
      const usuariosActivos = activos[0].total;

      // 3️⃣ Solicitudes estados
      const [sPend] = await pool.execute(`SELECT COUNT(*) AS total FROM solicitudes WHERE estado = 'pendiente'`);
      const [sPre]  = await pool.execute(`SELECT COUNT(*) AS total FROM solicitudes WHERE estado = 'pre-aprobado'`);
      const [sApr]  = await pool.execute(`SELECT COUNT(*) AS total FROM solicitudes WHERE estado = 'activo'`);

      const solicitudesPendientes = sPend[0].total;
      const solicitudesPreAprobadas = sPre[0].total;
      const solicitudesAprobadas = sApr[0].total;

      const totalSolicitudes = solicitudesPendientes + solicitudesPreAprobadas + solicitudesAprobadas;

      // 4️⃣ Créditos
      const [creditos] = await pool.execute(`SELECT * FROM creditos`);
      const [creditosActivosRows] = await pool.execute(`SELECT * FROM creditos WHERE estado = 'activo'`);

      const totalCreditos = creditos.length;
      const creditosActivos = creditosActivosRows.length;

      // 5️⃣ Cartera activa
      const montoTotal = creditosActivosRows.reduce(
        (sum, cr) => sum + Number(cr.saldo_pendiente_total), 0
      );

      // 6️⃣ Pagos vencidos → cuotas vencidas
      const [vencidas] = await pool.execute(`
        SELECT COUNT(*) AS total 
        FROM cuotas 
        WHERE estado = 'vencida'
      `);
      const pagosVencidos = vencidas[0].total;

      // 7️⃣ Ingresos del mes → pagos
      const [pagosMes] = await pool.execute(`
        SELECT SUM(monto_recibido) AS total
        FROM pagos
        WHERE MONTH(fecha_pago) = MONTH(NOW())
        AND YEAR(fecha_pago) = YEAR(NOW())
      `);
      const ingresosMensuales = pagosMes[0].total || 0;

      // 8️⃣ Actividad reciente → NOTIFICACIONES
      const [notifs] = await pool.execute(`
        SELECT 
          n.id_notificacion,
          n.id_solicitud,
          n.tipo,
          n.fecha_creacion,
          u.nombre AS usuario
        FROM notificaciones n
        INNER JOIN usuarios u ON n.id_usuario = u.id_usuario
        ORDER BY n.fecha_creacion DESC
        LIMIT 7
      `);

      const actividadReciente = notifs.map(n => {
        let accion = 'tiene una notificación';

        switch (n.tipo) {
          case 'aprobado':
            accion = 'ha sido aprobada';
            break;
          case 'rechazado':
            accion = 'ha sido rechazada';
            break;
          case 'pago_recibido':
            accion = 'ha registrado un pago';
            break;
          case 'mora':
            accion = 'ha entrado en mora';
            break;
        }

        return {
          descripcion: `La solicitud #${n.id_solicitud} del usuario ${n.usuario} ${accion}`,
          timestamp: n.fecha_creacion
        };
      });

      // 9️⃣ Tasa de aprobación
      const tasaAprobacion = totalSolicitudes > 0
        ? Number(((solicitudesAprobadas / totalSolicitudes) * 100).toFixed(1))
        : 0;

      // 🔟 Alertas
      const alertas = [];

      if (solicitudesPreAprobadas > 0) {
        alertas.push({
          tipo: "warning",
          mensaje: `${solicitudesPreAprobadas} solicitudes pendientes`
        });
      }

      if (pagosVencidos > 0) {
        alertas.push({
          tipo: "danger",
          mensaje: `${pagosVencidos} pagos vencidos`
        });
      }

      return {
        totalUsuarios,
        usuariosActivos,
        totalCreditos,
        creditosActivos,
        montoTotal,
        actividadReciente,
        solicitudesPreAprobadas,
        pagosVencidos,
        tasaAprobacion,
        ingresosMensuales,
        alertas
      };

    } catch (err) {
      console.error("Error en DashboardService:", err);
      throw err;
    }
  }

  static getMetricasAnalista() {
    return this.getMetricasGenerales();
  }
}
