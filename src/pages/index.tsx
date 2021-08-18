import React, { FormEvent, useContext, useState } from 'react';
import { Form, Input, Button, Checkbox } from 'antd';
import { setCookie } from 'nookies';
import { api } from '../services/api';
import { Notification } from '../components/Notification';
import router, { Router } from 'next/router';
import { AuthContext } from '../context/AuthContext';

export default function login() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState<string>();
  const [password, setPassword] = useState<string>();

  const { signIn } = useContext(AuthContext);

  setCookie(undefined, 'token', '');

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    try {
      const data = {
        email: email,
        password: password,
      };

      signIn(data);
      setPassword('');
    } catch (error) {
      console.error(error);
    }
  }
  return (
    <div className="logon-container">
      <section className="form">
        <form>
          <img
            src="logo.png"
            alt=""
            style={{
              position: 'relative',
              marginLeft: '5.6rem',
              marginBottom: '0.6rem',
            }}
          />

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
          <button onClick={handleSubmit} className="button">
            Entrar{' '}
          </button>
        </form>
      </section>
    </div>
  );
}

// async function handleLogin(e) {
//   e.preventDefault();

//   try {
//     const data = {
//       email: email,
//       password: password,
//     };

//     setLoading(true);
//     const response = await api.post('/sessions', data);
//     setLoading(false);

//     setCookie(undefined, 'token', response.data.token, {
//       maxAge: 60 * 60 * 24, //24 horas
//     });

//     Notification({
//       type: 'success',
//       title: 'Logado',
//       description: 'Login Efetuado',
//     });
//     router.push('/Profile');
//   } catch (error) {
//     console.error(error.response);
//     setLoading(false);
//     Notification({
//       type: 'error',
//       title: 'Erro',
//       description: 'Usuário e/ou Senha Incorreto(a)',
//     });
//     return;
//   }
// }
