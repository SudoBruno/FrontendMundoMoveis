import React, { useState } from 'react';
import { Form, Input, Button, Checkbox } from 'antd';
import { setCookie } from 'nookies';
import { api } from '../services/api';
import { Notification } from '../components/Notification';
import router, { Router } from 'next/router';

export default function login() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState<string>();
  const [password, setPassword] = useState<string>();

  async function handleLogin(e) {
    e.preventDefault();

    try {
      const data = {
        email: email,
        password: password,
      };
      console.log(data);

      setLoading(true);
      const response = await api.post('/sessions', data);
      setLoading(false);

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
      console.error(error);
      setLoading(false);
      Notification({
        type: 'error',
        title: 'Erro',
        description: 'Usuário e/ou Senha Incorreto(a)',
      });
      return;
    }
  }

  return (
    <div className="logon-container">
      <section className="form">
        <form>
          <h1>LOGIN</h1>

          <input
            placeholder="Seu Usuário"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            placeholder="Sua Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleLogin} className="button">
            Entrar{' '}
          </button>
        </form>
      </section>
    </div>
  );
}
