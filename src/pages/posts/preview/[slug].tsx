import { GetStaticProps } from "next";
import { useSession } from "next-auth/client";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { RichText } from "prismic-dom";
import { useEffect } from "react";
import { getPrismicClient } from "../../../services/prismic";
import styles from "../post.module.scss";

interface PostPreviewProps {
  post: {
    slug: string;
    title: string;
    content: string;
    updatedAt: string;
  };
}

export default function PostPreview({ post }: PostPreviewProps) {
  const [session] = useSession();
  const router = useRouter();

  // useEffect(() => {
  //   if (session?.activeSubscription) {
  //     router.push(`/post/${post.slug}`)
  //   }
  // }, [session]) -> dando erro activeSubscription

  return (
    <>
      <Head>
        <title>{post.title} | Ignews</title>
      </Head>

      <main className={styles.container}>
        <article className={styles.post}>
          <h1>{post.title}</h1>
          <time> {post.updatedAt} </time>
          <div
            className={`${styles.postContent} ${styles.previewContent}`} //pegar duas classes
            dangerouslySetInnerHTML={{ __html: post.content }}
          ></div>
          <div className={styles.continueReading}>
            Wanna continue reading?
            <Link href="/">
              <a href="">Subscribe now 🤗 </a>
            </Link>
          </div>
        </article>
      </main>
    </>
  );
}
export const getStaticPaths = () => {
  return {
    paths: [], // me retorna qual caminhos/paginas estaticas eu quero gerar durante a build, vazio para que todas as paginas sejam carregadas no primeiro acesso
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();

  const response = await prismic.getByUID("publication", String(slug), {});

  const post = {
    slug,
    title: RichText.asText(response.data.title),
    content: RichText.asHtml(response.data.content.splice(0, 3)), // splice->pegar somente os 3 primeiros blocos do conteudo
    updatedAt: new Date(response.last_publication_date).toLocaleDateString(
      "pt-BR",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    ),
  };
  return {
    props: {
      post,
    },
    redirect: 60 * 30, // 30 minutos (quanto tempo para o post atualizar)
  };
};
