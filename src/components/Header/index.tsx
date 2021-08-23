import Image from 'next/image';
import Link from 'next/link';

import styles from './header.module.scss';

export default function Header(): JSX.Element {
  return (
    <header className={styles.container}>
      <Link href="/">
        <a>
          <Image
            src="/images/logo.svg"
            width="292px"
            height="40px"
            objectFit="contain"
            alt="logo"
          />
        </a>
      </Link>
    </header>
  );
}
