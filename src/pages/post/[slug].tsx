import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import Prismic from '@prismicio/client';

import Link from 'next/link';
import Header from '../../components/Header';
import Comments from '../../components/Utterances';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { formatDate } from '../../utils';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  last_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
  prevPost: Post;
  nextPost: Post;
  preview: boolean;
}

export default function Post({
  post,
  prevPost,
  nextPost,
  preview,
}: PostProps): JSX.Element {
  const { isFallback } = useRouter();

  if (isFallback) {
    return <div>Carregando...</div>;
  }

  const totalWords = post.data.content.reduce(
    (totalContent, currentContent) => {
      const headingWords = currentContent.heading?.split(' ').length || 0;

      const bodyWords = currentContent.body.reduce((totalBody, currentBody) => {
        const textWords = currentBody.text.split(' ').length;
        return totalBody + textWords;
      }, 0);

      return totalContent + headingWords + bodyWords;
    },
    0
  );

  const timeEstimmed = Math.ceil(totalWords / 200);

  const isPostEdited =
    post.first_publication_date !== post.last_publication_date;

  return (
    <>
      <Header />
      <img
        src={post.data.banner.url}
        className={styles.postBanner}
        alt="banner"
      />
      <section className={`${commonStyles.container} ${styles.post}`}>
        <h1>{post.data.title}</h1>
        <div className={styles.postInfo}>
          <div className={styles.postInfoItem}>
            <FiCalendar />
            <span>{formatDate(post.first_publication_date)}</span>
          </div>
          <div className={styles.postInfoItem}>
            <FiUser />
            <span>{post.data.author}</span>
          </div>
          <div className={styles.postInfoItem}>
            <FiClock />
            <span>{`${timeEstimmed} min`} </span>
          </div>
        </div>
        {isPostEdited && (
          <span>
            {`* editado em ${formatDate(post.last_publication_date, true)}`}
          </span>
        )}
        {post.data.content.map(({ heading, body }) => (
          <div key={heading}>
            <h2>{heading}</h2>

            <div
              className={styles.postSection}
              dangerouslySetInnerHTML={{
                __html: RichText.asHtml(body),
              }}
            />
          </div>
        ))}
        <section className={styles.navigation}>
          <div>
            {prevPost && (
              <>
                <h3>{prevPost.data.title}</h3>
                <Link href={`/post/${prevPost.uid}`}>
                  <a>Post anterior</a>
                </Link>
              </>
            )}
          </div>
          <div>
            {nextPost && (
              <>
                <h3>{nextPost.data.title}</h3>
                <Link href={`/post/${nextPost.uid}`}>
                  <a>Próximo post</a>
                </Link>
              </>
            )}
          </div>
        </section>
        <Comments />
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

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.predicates.at('document.type', 'posts'),
  ]);

  const paths = posts.results.map(post => ({
    params: { slug: post.uid },
  }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({
  params,
  preview = false,
  previewData,
}) => {
  const prismic = getPrismicClient();
  const { slug } = params;

  const response = await prismic.getByUID('posts', String(slug), {
    ref: previewData?.ref ?? null,
  });

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    last_publication_date: response.last_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content.map(content => {
        return {
          heading: content.heading,
          body: [...content.body],
        };
      }),
    },
  };

  const prevPost = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      pageSize: 1,
      after: response.id,
      orderings: '[document.first_publication_date]',
    }
  );

  const nextPost = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      pageSize: 1,
      after: response.id,
      orderings: '[document.first_publication_date desc]',
    }
  );

  return {
    props: {
      post,
      prevPost: prevPost?.results[0] ?? null,
      nextPost: nextPost?.results[0] ?? null,
      preview,
    },
    revalidate: 60 * 60,
  };
};
