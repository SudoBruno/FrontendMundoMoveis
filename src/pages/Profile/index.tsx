import { GetServerSideProps } from 'next';
import { parseCookies } from 'nookies';
import React from 'react';
import { getAPIClient } from '../../services/axios';
import styles from './profile.module.scss';

export default function Profile() {
  return (
    <>
      <div className={styles.profile}>
        <img src="/coffeBreak.svg" />
        <h1>Página em construção...</h1>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const apiClient = getAPIClient(context);
  const { token } = parseCookies(context);

  if (!token) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }
  return { props: {} };
};
