// src/app/core/models/auth.model.ts

/**
 * Request para login
 * Coincide con LoginRequestDto del backend
 */
export interface LoginRequest {
  username: string;
  password: string;
}

/**
 * Request para registro
 * Coincide con RegisterRequestDto del backend
 */
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

/**
 * Response del backend al hacer login
 * Incluye token JWT y datos del usuario
 */
export interface AuthResponse {
  status: string;
  message: string;
  userId: string;
  username: string;
  roles: string[];
  token: string;
  expiration: string; // ISO date string
}

/**
 * Payload decodificado del JWT token
 * Estructura que viene dentro del token
 */
export interface TokenPayload {
  // Claims estándar de JWT
  sub?: string; // Subject (User ID)
  exp?: number; // Expiration time (timestamp)
  iat?: number; // Issued at (timestamp)
  
  // Claims personalizados del backend
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'?: string; // Username
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'?: string; // User ID
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'?: string | string[]; // Roles
  jti?: string; // JWT ID
}

/**
 * Opciones para el método de login
 */
export interface LoginOptions {
  rememberMe?: boolean;
}