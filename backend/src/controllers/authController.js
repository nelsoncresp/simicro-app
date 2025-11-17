import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { success, error } from "../utils/responses.js";

export class AuthController {
  // Login
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      console.log(!email,!password)
      // Validaciones básicas
      if (!email || !password) {
        return error(res, "Email y contraseña son requeridos", 400);
      }

      // Buscar usuario
      const user = await User.findByEmail(email);
      if (!user) {
        return error(res, "Credenciales inválidas", 401);
      }

      // Verificar contraseña
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return error(res, "Credenciales inválidas", 401);
      }

      // Generar token
      const token = jwt.sign(
        {
          id_usuario: user.id_usuario,
          email: user.email,
          rol: user.rol,
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      // Respuesta sin password
      const userData = {
        id_usuario: user.id_usuario,
        email: user.email,
        nombre: user.nombre,
        rol: user.rol,
      };

      success(res, { user: userData, token }, "Login exitoso");
    } catch (err) {
      console.error("Error en login:", err);
      error(res, "Error en el servidor", 500);
    }
  }
  // Registro (solo para emprendedores inicialmente)
  static async register(req, res) {
    try {
      const {
        email,
        password,
        nombre,
        nombre_negocio,
        antiguedad_meses,
        ingreso_neto_diario,
        estabilidad_vivienda,
        telefono,
        direccion,
      } = req.body;

      // Validaciones
      if (!email || !password || !nombre) {
        return error(res, "Email, contraseña y nombre son requeridos", 400);
      }

      // Verificar si el usuario ya existe
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return error(res, "El email ya está registrado", 409);
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      const user = await User.create({
        email,
        password: hashedPassword,
        nombre,
        rol: "emprendedor",
      });

      const userData = {
        id_usuario: user.id_usuario,
        email: user.email,
        nombre: user.nombre,
        rol: user.rol,
      };

      success(res, { user: userData }, "Usuario registrado exitosamente", 201);
    } catch (err) {
      console.error("Error en registro:", err);
      error(res, "Error en el servidor", 500);
    }
  }

  // Crear analista (solo para administradores)
  static async createAnalyst(req, res) {
    try {
      const { email, password, nombre } = req.body;

      if (!email || !password || !nombre) {
        return error(res, "Email, contraseña y nombre son requeridos", 400);
      }

      // Verificar si el usuario ya existe
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return error(res, "El email ya está registrado", 409);
      }

      // Encriptar contraseña
      const hashedPassword = await bcrypt.hash(password, 12);

      // Crear usuario con rol analista
      const user = await User.create({
        email,
        password: hashedPassword,
        nombre,
        rol: "analista",
      });


      const userData = {
        id_usuario: user.id_usuario,
        email: user.email,
        nombre: user.nombre,
        rol: user.rol,
      };

      success(
        res,
        { user: userData},
        "Analista creado exitosamente",
        201
      );
    } catch (err) {
      console.error("Error creando analista:", err);
      error(res, "Error creando analista", 500);
    }
  }

  // Perfil del usuario autenticado
  static async getProfile(req, res) {
    try {
      const user = await User.findById(req.user.id_usuario);

      let profile = { ...user };

      // Si es emprendedor, traer datos adicionales
      if (req.user.rol === "emprendedor") {
        const { Emprendimiento } = await import("../models/Emprendedor.js");
        const emprendedor = await Emprendimiento.findByUserId(req.user.id_usuario);
        profile.emprendedor = emprendedor;
      }

      success(res, profile, "Perfil obtenido");
    } catch (err) {
      console.error("Error obteniendo perfil:", err);
      error(res, "Error obteniendo perfil", 500);
    }
  }

  // Crear administrador
  static async createAdmin(req, res) {
    try {
      const { email, password, nombre } = req.body;

      if (!email || !password || !nombre) {
        return error(res, "Email, contraseña y nombre son requeridos", 400);
      }

      // Verificar si el usuario ya existe
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return error(res, "El email ya está registrado", 409);
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Crear usuario con rol admin
      const user = await User.create({
        email,
        password: hashedPassword,
        nombre,
        rol: "admin", // Rol administrador
      });

      // Generar token
      const token = jwt.sign(
        {
          id_usuario: user.id_usuario,
          email: user.email,
          rol: user.rol,
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      const userData = {
        id_usuario: user.id_usuario,
        email: user.email,
        nombre: user.nombre,
        rol: user.rol,
      };

      success(
        res,
        { user: userData, token },
        "Administrador creado exitosamente",
        201
      );
    } catch (err) {
      console.error("Error creando admin:", err);
      error(res, "Error creando administrador", 500);
    }
  }
}
