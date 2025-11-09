import { Cuota } from '../models/Cuota.js';
import { Mora } from '../models/Mora.js';

export class MoraService {
  // Verificar y actualizar moras automáticamente
  static async verificarYActualizarMoras() {
    try {
      const cuotasVencidas = await Cuota.findVencidas();
      const resultados = [];

      for (const cuota of cuotasVencidas) {
        const diasMora = this.calcularDiasMora(cuota.fecha_vencimiento);
        
        if (diasMora > 0) {
          const penalidad = this.calcularPenalidad(cuota.monto_esperado, diasMora);
          const resultado = await this.actualizarMoraCuota(cuota.id_cuota, diasMora, penalidad);
          resultados.push(resultado);
        }
      }

      return {
        procesadas: resultados.length,
        resultados: resultados
      };

    } catch (error) {
      console.error('Error en verificación de moras:', error);
      throw error;
    }
  }

  // Calcular días de mora
  static calcularDiasMora(fechaVencimiento) {
    const hoy = new Date();
    const vencimiento = new Date(fechaVencimiento);
    const diferenciaTiempo = hoy.getTime() - vencimiento.getTime();
    return Math.max(0, Math.floor(diferenciaTiempo / (1000 * 60 * 60 * 24)));
  }

  // Calcular penalidad por mora
  static calcularPenalidad(montoCuota, diasMora, tasaPenalidad = 0.02) {
    const semanasMora = Math.ceil(diasMora / 7);
    return montoCuota * tasaPenalidad * semanasMora;
  }

  // Actualizar o crear registro de mora
  static async actualizarMoraCuota(idCuota, diasMora, penalidad) {
    // Buscar mora activa existente
    const moraExistente = await Mora.findActivaByCuota(idCuota);

    if (moraExistente) {
      // Actualizar mora existente
      const moraActualizada = await Mora.actualizarMora(
        moraExistente.id_mora,
        diasMora,
        penalidad
      );
      
      return {
        accion: 'actualizada',
        cuota: idCuota,
        mora: moraActualizada
      };
    } else {
      // Crear nueva mora
      const nuevaMora = await Mora.create({
        id_cuota: idCuota,
        dias_mora: diasMora,
        monto_penalidad_acumulado: penalidad
      });

      // Marcar cuota como vencida
      await Cuota.marcarComoVencida(idCuota);

      return {
        accion: 'creada',
        cuota: idCuota,
        mora: nuevaMora
      };
    }
  }

  // Liquidar mora cuando se paga la penalidad
  static async liquidarMora(idMora, montoPagado) {
    const mora = await Mora.findById(idMora);
    
    if (!mora) {
      throw new Error('Registro de mora no encontrado');
    }

    if (mora.estado === 'liquidada') {
      throw new Error('La mora ya fue liquidada');
    }

    if (montoPagado < mora.monto_penalidad_acumulado) {
      throw new Error(`Monto insuficiente. Se requiere: ${mora.monto_penalidad_acumulado}`);
    }

    return await Mora.liquidar(idMora);
  }

  // Obtener resumen de moras
  static async obtenerResumenMoras() {
    const morasActivas = await Mora.findActivas();
    
    const totalMora = morasActivas.reduce((sum, mora) => 
      sum + parseFloat(mora.monto_penalidad_acumulado), 0
    );
    
    const totalCuotasMora = morasActivas.length;
    const promedioDiasMora = morasActivas.length > 0 
      ? morasActivas.reduce((sum, mora) => sum + mora.dias_mora, 0) / morasActivas.length
      : 0;

    return {
      totalMora: Number(totalMora.toFixed(2)),
      totalCuotasMora,
      promedioDiasMora: Math.round(promedioDiasMora),
      morasActivas: morasActivas.length
    };
  }
}