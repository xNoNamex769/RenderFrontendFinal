// src/utils/auth.ts
import { jwtDecode } from "jwt-decode";

interface TokenPayload {
  IdUsuario: number;
  rol: number;
  iat?: number;
  exp?: number;
}

export const getDecodedToken = (): TokenPayload | null => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const decoded = jwtDecode<TokenPayload>(token); // ✅ aquí usas bien la función importada
    return decoded;
  } catch (error) {
    console.error("❌ Error al decodificar el token:", error);
    return null;
  }
};

export const obtenerIdUsuario = (): number | null => {
  const usuario = getDecodedToken();
  return usuario?.IdUsuario ?? null;
};

export const obtenerRolUsuario = (): number | null => {
  const usuario = getDecodedToken();
  return usuario?.rol ?? null;
};
