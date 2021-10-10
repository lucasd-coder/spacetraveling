/* eslint-disable react/no-unused-prop-types */
import { GetStaticProps } from 'next';
import { FiCalendar, FiUser } from 'react-icons/fi';
import Prismic from '@prismicio/client';

import Link from 'next/link';
import { useState } from 'react';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import Header from '../components/Header';
import { formatDate } from '../utils';

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
  preview: boolean;
}

export default function Home({
  postsPagination,
  preview,
}: HomeProps): JSX.Element {
  const [nextPage, setNextPage] = useState<string>(postsPagination.next_page);

  const formattedPosts = postsPagination.results.map(post => {
    return {
      ...post,
      first_publication_date: formatDate(post.first_publication_date),
    };
  });

  const [loadedPosts, setLoadedPosts] = useState<Post[]>(formattedPosts);

  async function handleLoadData(): Promise<void> {
    const response = await fetch(nextPage);
    const data = await response.json();
    setNextPage(data.next_page);
    const posts = data.results.map(item => {
      return {
        uid: item.uid,
        first_publication_date: formatDate(item.first_publication_date),
        data: {
          title: item.data.title,
          subtitle: item.data.subtitle,
          author: item.data.author,
        },
      };
    });

    setLoadedPosts([...loadedPosts, ...posts]);
  }

  return (
    <>
      <Header />
      <section className={commonStyles.container}>
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
              {item.first_publication_date}
              <div>
                <FiUser color="#d7d7d7" /> {item.data.author}
              </div>
            </div>
          </div>
        ))}

        {nextPage && (
          <button
            type="button"
            onClick={handleLoadData}
            className={styles.nextPost}
          >
            Carregar mais posts
          </button>
        )}

        {preview && (
          <aside>
            <Link href="/api/exit-preview">
              <a className={commonStyles.preview}>Sair do modo Preview</a>
            </Link>
          </aside>
        )}
      </section>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({
  preview = false,
  previewData,
}) => {
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
      pageSize: 1,
      ref: previewData?.ref ?? null,
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

  const postsPagination = {
    results: posts,
    next_page: postsResponse.next_page,
  };

  return {
    props: {
      postsPagination,
      preview,
    },
    revalidate: 60 * 60,
  };
};
