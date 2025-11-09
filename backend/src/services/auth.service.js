import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export class AuthService {
  // Validar credenciales de login
  static async validateCredentials(email, password) {
    const user = await User.findByEmail(email);
    
    if (!user) {
      throw new Error('Credenciales inválidas');
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      throw new Error('Credenciales inválidas');
    }

    return user;
  }

  // Generar token JWT
  static generateToken(user) {
    return jwt.sign(
      { 
        id_usuario: user.id_usuario, 
        email: user.email, 
        rol: user.rol 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
  }

  // Hashear password
  static async hashPassword(password) {
    return await bcrypt.hash(password, 12);
  }

  // Verificar si email existe
  static async emailExists(email) {
    const user = await User.findByEmail(email);
    return !!user;
  }
}