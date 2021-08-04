import format from 'date-fns/format';
import ptBR from 'date-fns/locale/pt-BR';
import styles from './styles.module.scss';
import Image from 'next/image';

export function Header() {
  const currentDate = format(new Date(), 'EEEEEE, d MMMM', {
    locale: ptBR,
  });

  return (
    <>
      <head className={styles.headerContainer}>
        <Image width="200" height="55" src="/logo.png" alt="teste" />
        <span>{currentDate}</span>
      </head>
    </>
  );
}
