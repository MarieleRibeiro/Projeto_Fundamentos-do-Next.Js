import Stripe from "stripe";
import { version } from "../../package.json";

export const stripe = new Stripe(process.env.STRIPE_API_KEY, {
  //primeiro parametro preciso dizer qual que é a chave Stripe=> como esta numa variavel eu passo o nome da variavel
  // segundo parametro são algumas informações obrigatorias
  apiVersion: "2020-08-27", //versão mais recente do stripe
  appInfo: {
    //informações de meta dados
    name: "Ignews", //nome da nossa aplicação, para que no stripe consigo ver qual aplicação esta fazendo a requisição
    version, // versão da nossa aplicação, pode importar do proprio package.json
  },
});
