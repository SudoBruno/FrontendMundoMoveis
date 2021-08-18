import React from 'react';
import 'antd/dist/antd.css';

import { Header } from '../components/Header';
import { SideBarProvider } from '../context/SideBarContext';

import styles from '../styles/app.module.scss';
import '../styles/global.scss';
import { AuthProvider } from '../context/AuthContext';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <div className={styles.wrapper}>
        <main>
          <AuthProvider>
            <SideBarProvider>
              <Component {...pageProps} />
            </SideBarProvider>
          </AuthProvider>
        </main>
      </div>
    </>
  );
}

export default MyApp;
