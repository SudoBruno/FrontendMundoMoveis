import { createContext, ReactNode } from 'react';
import { setCookie } from 'nookies';
import { api } from '../services/api';
import { Notification } from '../components/Notification';
import router from 'next/router';

interface signInCredentials {
  email: string;
  password: string;
}

interface AuthContextData {
  signIn(credentials: signInCredentials): Promise<void>;
  isAuthenticated: boolean;
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthContext = createContext({} as AuthContextData);

export function AuthProvider({ children }: AuthProviderProps) {
  const isAuthenticated = false;

  async function signIn({ email, password }: signInCredentials) {
    try {
      const data = {
        email: email,
        password: password,
      };

      const response = await api.post('/sessions', data);

      setCookie(undefined, 'token', response.data.token, {
        maxAge: 60 * 60 * 24, //24 horas
      });

      Notification({
        type: 'success',
        title: 'Logado',
        description: 'Login Efetuado',
      });
      router.push('/Profile');
    } catch (error) {
      console.error(error.response);

      Notification({
        type: 'error',
        title: 'Erro',
        description: 'Usuário e/ou Senha Incorreto(a)',
      });
      return;
    }
  }

  return (
    <AuthContext.Provider value={{ signIn, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}
