import { useSession, signIn } from "next-auth/client";
import { api } from "../../services/api";
import { getStripeJs } from "../../services/stripe-js";
import styles from "./styles.module.scss";

interface SubscribeButtonProps {
  priceId: string;
}

export function SubscribeButton({ priceId }: SubscribeButtonProps) {
  const [session] = useSession(); // saber se o usuario esta logado

  async function handleSubscribe() {
    if (!session) {
      // se não existir uma sessão do usuario vou redirecionar
      signIn("github"); // para a autenticação do github
      return; // não quero que o codigo a partir desse aqui seja executado
    }
    //se ele ja esta logado eu vou fazer a criação da checkout session

    try {
      const response = await api.post("/subscribe");
      const { sessionId } = response.data;

      const stripe = await getStripeJs();

      await stripe.redirectToCheckout({ sessionId });
    } catch (err) {
      alert(err.message);
    }
  }
  return (
    <button
      type="button"
      className={styles.subscribeButton}
      onClick={handleSubscribe}
    >
      Subscribe now
    </button>
  );
}

// 3 lugares para utilizar nossas credenciais secretas que não podem ser visivel para usuario final
// -> getServerSideProps (SSR) = so são utilizados quando a pagina esta sendo renderizada
// -> getStaticProps (SSG) = so são utilizados quando a pagina esta sendo renderizada
// -> API routes = utilizada a partir de uma ação do usuario depois que a pagina ja esta renderizada/exibida para o usuario
