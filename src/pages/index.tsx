import { GetStaticProps } from "next";
import Head from "next/head";
import { SubscribeButton } from "../components/SubscribeButton";
import { stripe } from "../services/stripe";
import styles from "./home.module.scss";

// 3 formas de fazer uma chamada API
// -> Client_side- quando não preciso de indexação, quando é uma informação carregada atraves de uma ação do ususario e não
// necessariamente quando a pagina carrega, uma informação que não tem a necessidade de ja estar ali quando a pagina é carregada
// -> Server-side- vai ser utilizado quando precisamos tambem a indexação, porem precisamos de dados dinamicos da sessão
// do usuario, ações em tempo real do usuario que esta acessando, do contexto da requisição.
// -> Static Site Generation- vamos utilizar em casos que eu consigo gerar uma
// pagina html para compartilhar esse html para todas as pessoas que estaão acessando aquela aplicação
// (paginas que são iguais para todo mundo e precisam de indexação do google).

interface HomeProps {
  product: {
    priceId: string;
    amount: number;
  };
}

export default function Home({ product }: HomeProps) {
  return (
    <>
      <Head>
        <title>Home | ig.news</title>
      </Head>

      <main className={styles.contentContainer}>
        <section className={styles.hero}>
          <span> 👏 Hey, welcome </span>
          <h1>
            News about the <span>React</span> world.
          </h1>
          <p>
            Get access to all the publications <br />
            <span>for {product.amount} month</span>
          </p>
          <SubscribeButton priceId={product.priceId} />
        </section>

        <img src="/images/avatar.svg" alt="Girl coding" />
      </main>
    </>
  );
}

//chamada API stripe
export const getStaticProps: GetStaticProps = async () => {
  const price = await stripe.prices.retrieve("price_1IdwvOBMSMco8MvevyYe9AE8", {
    //quando busca um só valor é retrieve
    expand: ["product"], //vou ter todas as informações do produto, por preço, imagem, descrição(não é necessario colocar quando a somente um produto)
  });

  const product = {
    priceId: price.id,
    amount: new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price.unit_amount / 100),
  }; // salvar em centavos, mais facil de lidar não precisa lidar com as casas decimais, quando salva em centavos o numeros sempre vai ser inteiro, e como ta em centavos divido ele por 100

  return {
    props: {
      product,
    },
    revalidate: 60 * 60 * 24, // 1min * 1h * 1dia= 24hours
    // quanto tempo em segundos eu quero que essa pagina se mantenha sem precisar ser revalidada(recostruida)
  };
};
/* Diferença entre SSR( Server-side Rendering) e SSG(Static Site Generation)
-> Enquanto SSG ele executa uma vez e depois salva o resultado do html de forma estatica ou seja não muda mais ate dar 
o tempo do revalidate, é mais perfomatico, ele salva o html e não precisa fazer toda a chamada do 0,
eu so posso usar SSG se a pagina for igual para todos os usuarios 

-> Enquanto o SSR faz todo o processo do 0 de novo, e permite ser mais dinamico, posso usar informações dinamicas dependendo 
do usuario(ex: pegar dados somente do usuario que esta logado)

*/
