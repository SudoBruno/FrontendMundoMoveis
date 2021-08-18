import format from 'date-fns/format';
import ptBR from 'date-fns/locale/pt-BR';
import styles from './styles.module.scss';
import Image from 'next/image';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

export function Header() {
  const { user } = useContext(AuthContext);
  const currentDate = format(new Date(), 'EEEEEE, d MMMM', {
    locale: ptBR,
  });

  return (
    <>
      <head className={styles.headerContainer}>
        <Image width="200" height="55" src="/logo.png" alt="teste" />
        {/* <h3>{user?.email}</h3> */}
        <span>{currentDate}</span>
      </head>
    </>
  );
}
