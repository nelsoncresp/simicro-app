import { Credito } from '../models/Credito.js';
import { Cuota } from '../models/Cuota.js';
import { success, error } from '../utils/responses.js';

export class CreditoController {
  // Obtener todos los créditos activos
  static async obtenerCreditosActivos(req, res) {
    try {
      const creditos = await Credito.findActive();
      success(res, creditos, 'Créditos activos obtenidos');
    } catch (err) {
      console.error('Error obteniendo créditos:', err);
      error(res, 'Error obteniendo créditos', 500);
    }
  }

  // Obtener crédito por ID
  static async obtenerCredito(req, res) {
    try {
      const { id } = req.params;
      const credito = await Credito.findById(id);

      if (!credito) {
        return error(res, 'Crédito no encontrado', 404);
      }

      // Obtener cuotas del crédito
      const cuotas = await Cuota.findByCredito(id);
      credito.cuotas = cuotas;

      success(res, credito, 'Crédito obtenido');
    } catch (err) {
      console.error('Error obteniendo crédito:', err);
      error(res, 'Error obteniendo crédito', 500);
    }
  }

  // Obtener créditos del emprendedor autenticado
  static async obtenerMisCreditos(req, res) {
    try {
      // Para emprendedores, obtener su ID de emprendedor
      const { Emprendedor } = await import('../models/Emprendedor.js');
      const emprendedor = await Emprendedor.findByUserId(req.user.id_usuario);

      if (!emprendedor) {
        return error(res, 'Perfil de emprendedor no encontrado', 404);
      }

      const creditos = await Credito.findByEmprendedor(emprendedor.id_emprendedor);
      
      // Para cada crédito, obtener las cuotas
      for (let credito of creditos) {
        credito.cuotas = await Cuota.findByCredito(credito.id_credito);
      }

      success(res, creditos, 'Mis créditos obtenidos');
    } catch (err) {
      console.error('Error obteniendo mis créditos:', err);
      error(res, 'Error obteniendo mis créditos', 500);
    }
  }
}