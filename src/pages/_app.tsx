import React from 'react';
import 'antd/dist/antd.css';

import { Header } from '../components/Header';
import { SideBarProvider } from '../context/SideBarContext';

import styles from '../styles/app.module.scss';
import '../styles/global.scss';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <div className={styles.wrapper}>
        <main>
          <SideBarProvider>
            <Component {...pageProps} />
          </SideBarProvider>
        </main>
      </div>
    </>
  );
}

export default MyApp;
