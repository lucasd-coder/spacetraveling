import { GetStaticProps } from 'next';
import { FiCalendar, FiUser } from 'react-icons/fi';
import Prismic from '@prismicio/client';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import Link from 'next/link';
import { useState } from 'react';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import Header from '../components/Header';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const [loadedPosts, setLoadedPosts] = useState<Post[]>([]);

  async function handleLoadData(): Promise<void> {
    const response = await fetch(postsPagination.next_page);
    const data = await response.json();
    const posts = data.results.map(item => {
      return {
        uid: item.uid,
        first_publication_date: item.first_publication_date,
        data: {
          title: item.data.title,
          subtitle: item.data.subtitle,
          author: item.data.author,
        },
      };
    });

    setLoadedPosts(posts);
  }

  return (
    <>
      <Header />
      <section className={commonStyles.container}>
        {postsPagination.results.map((item: Post) => (
          <div key={item.uid} className={styles.postContainer}>
            <Link href={`/post/${item.uid}`}>
              <a>
                <h1>{item.data.title}</h1>
              </a>
            </Link>
            <p>{item.data.subtitle}</p>
            <div>
              <FiCalendar color="#d7d7d7" />
              {format(new Date(item.first_publication_date), 'd MMM yyyy', {
                locale: ptBR,
              })}
              <div>
                <FiUser color="#d7d7d7" /> {item.data.author}
              </div>
            </div>
          </div>
        ))}
        {loadedPosts.map((item: Post) => (
          <div key={item.uid} className={styles.postContainer}>
            <Link href={`/post/${item.uid}`}>
              <a>
                <h1>{item.data.title}</h1>
              </a>
            </Link>
            <p>{item.data.subtitle}</p>
            <div>
              <FiCalendar color="#d7d7d7" />
              {format(new Date(item.first_publication_date), 'd MMM yyyy', {
                locale: ptBR,
              })}
              <div>
                <FiUser color="#d7d7d7" /> {item.data.author}
              </div>
            </div>
          </div>
        ))}

        {postsPagination.next_page && (
          <button
            type="button"
            onClick={handleLoadData}
            className={styles.nextPost}
          >
            Carregar mais posts
          </button>
        )}
      </section>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: [
        'posts.uid',
        'posts.first_publication_date',
        'posts.title',
        'posts.subtitle',
        'posts.author',
      ],
      pageSize: 100,
    }
  );

  const posts = postsResponse.results.map(item => {
    return {
      uid: item.uid,
      first_publication_date: item.first_publication_date,
      data: {
        title: item.data.title,
        subtitle: item.data.subtitle,
        author: item.data.author,
      },
    };
  });

  return {
    props: {
      postsPagination: {
        results: posts,
        next_page: postsResponse.next_page,
      },
      revalidate: 60 * 30,
    },
  };
};
