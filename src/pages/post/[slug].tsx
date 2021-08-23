import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import Prismic from '@prismicio/client';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
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
}

export default function Post({ post }: PostProps): JSX.Element {
  const { isFallback } = useRouter();

  if (isFallback) {
    return <div>Carregando...</div>;
  }

  const postContent = post.data.content;
  const postBody = postContent.map(item => RichText.asText(item.body));
  const postHeading = postContent.map(item => item.heading);
  const postHeadingAndBodyWords = postBody.concat(postHeading);
  const postWords = postHeadingAndBodyWords.map(item => item.split(/\s+/));
  const totalPostBodyLength = postWords.map(item => item.length);
  const totalPostWords = totalPostBodyLength.reduce((acc, val) => acc + val);
  const timeToRead = Math.ceil(totalPostWords / 200);

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
            <span>
              {format(new Date(post.first_publication_date), 'd MMM yyyy', {
                locale: ptBR,
              })}
            </span>
          </div>
          <div className={styles.postInfoItem}>
            <FiUser />
            <span>{post.data.author}</span>
          </div>
          <div className={styles.postInfoItem}>
            <FiClock />
            <span>{timeToRead} min </span>
          </div>
        </div>
        {post.data.content.map(({ heading, body }) => (
          <div key={heading}>
            <h2>{heading}</h2>

            <div
              className={styles.postSection}
              dangerouslySetInnerHTML={{ __html: RichText.asHtml(body) }}
            />
          </div>
        ))}
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
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async context => {
  const prismic = getPrismicClient();
  const { slug } = context.params;

  const response = await prismic.getByUID('posts', String(slug), {});

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content,
    },
  };

  return {
    props: { post },
  };
};
