import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";

// Tipo del usuario decodificado del token
interface UsuarioAutenticado {
  IdUsuario: number;
  Nombre: string;
  rol: number;
  [key: string]: any; // Por si vienen más datos
}

// Tipo del contexto
interface AuthContextType {
  token: string | null;
  usuario: UsuarioAutenticado | null;
  login: (nuevoToken: string, usuarioData: UsuarioAutenticado) => void;
  logout: () => void;
}

// Creamos el contexto con valor inicial null (usaremos un cast luego)
const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// Props del proveedor
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const navigate = useNavigate();

  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [usuario, setUsuario] = useState<UsuarioAutenticado | null>(null);

useEffect(() => {
  if (token) {
    try {
      const usuarioLocal = localStorage.getItem("usuario");
      if (usuarioLocal) {
        setUsuario(JSON.parse(usuarioLocal));
      } else {
        const decoded = JSON.parse(atob(token.split(".")[1]));
        setUsuario(decoded);
      }
    } catch (err) {
      console.error("Token o usuario inválido", err);
      setUsuario(null);
    }
  }
}, [token]);


 const login = (nuevoToken: string, usuarioData: UsuarioAutenticado) => {
  localStorage.setItem("token", nuevoToken);
  localStorage.setItem("usuario", JSON.stringify(usuarioData)); //  Guarda el usuario completo
  setToken(nuevoToken);
  setUsuario(usuarioData);
};


  const logout = () => {
    localStorage.clear();
    setToken(null);
    setUsuario(null);
    navigate("/cuenta");
  };

  return (
    <AuthContext.Provider value={{ token, usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para acceder al contexto fácilmente
export const useAuth = () => useContext(AuthContext);
