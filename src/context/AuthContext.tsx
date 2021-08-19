import { createContext, ReactNode, useEffect, useState } from 'react';
import { parseCookies, setCookie } from 'nookies';
import { api } from '../services/api';
import { Notification } from '../components/Notification';
import router from 'next/router';

interface User {
  email: string;
  permissions: string[];
  roles: string[];
}
interface signInCredentials {
  email: string;
  password: string;
}

interface AuthContextData {
  signIn(credentials: signInCredentials): Promise<void>;
  isAuthenticated: boolean;
  user: User;
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthContext = createContext({} as AuthContextData);

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User>();
  const isAuthenticated = !!user;

  // useEffect(() => {
  //   const { token } = parseCookies();

  //   if (!token) {
  //     router.push('/');
  //   }

  //   if (token) {
  //     api.get('/user').then((response) => {
  //       const { permissions, roles, email } = response.data;
  //       setUser({
  //         email,
  //         permissions,
  //         roles,
  //       });
  //     });
  //   }
  // }, []);

  async function signIn({ email, password }: signInCredentials) {
    try {
      const data = {
        email: email,
        password: password,
      };

      const response = await api.post('/sessions', data);
      console.log(response.data);

      setCookie(undefined, 'token', response.data.token, {
        maxAge: 60 * 60 * 24, //24 horas
        path: '/',
      });

      const { permissions, roles, user } = response.data;

      setUser({
        email,
        permissions,
        roles,
      });
      Notification({
        type: 'success',
        title: 'Logado',
        description: 'Login Efetuado',
      });
      router.push('/Profile');
    } catch (error) {
      console.error(error);

      Notification({
        type: 'error',
        title: 'Erro',
        description: 'Usuário e/ou Senha Incorreto(a)',
      });
      return;
    }
  }

  return (
    <AuthContext.Provider value={{ signIn, isAuthenticated, user }}>
      {children}
    </AuthContext.Provider>
  );
}
