import { NextApiRequest, NextApiResponse } from "next";
import { query as q } from "faunadb";
import { getSession } from "next-auth/client";
import { stripe } from "../../services/stripe";
import { fauna } from "../../services/fauna";

type User = {
  ref: {
    id: string;
  };
  data: {
    stripe_customer_id: string;
  };
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    // verificar se o metodo da requisição é post/ queremos aceitar requisição do tipo post(sempre que eu estou criando é metodo post)
    const session = await getSession({ req }); //qual cliente esta logado

    const user = await fauna.query<User>(
      q.Get(q.Match(q.Index("user_by_email"), q.Casefold(session.user.email)))
    );

    // verificar se ja existe o usuario
    let customerId = user.data.stripe_customer_id;

    if (!customerId) {
      // se não ele cria um novo usuario
      const stripeCustomer = await stripe.customers.create({
        email: session.user.email,
      });

      await fauna.query(
        // e atualiza esse novo usuario e salva no banco
        q.Update(q.Ref(q.Collection("users"), user.ref.id), {
          data: {
            stripe_customer_id: stripeCustomer.id,
          },
        })
      );
      customerId = stripeCustomer.id; // reatribui a variavel para ela sempre ter um valor
    }

    const stripeCheckoutSession = await stripe.checkout.sessions.create({
      customer: customerId, //quem esta comprando esse pacote, e não pode ser somente um id no nosso cliente, ou email dele/ esse id é o id do customer no stripe e não no banco de dados do fauna
      payment_method_types: ["card"], // metodo de pagamento
      billing_address_collection: "required", // obrigar o usuario a preencher o endereço ou não
      line_items: [
        { price: "price_1IdwvOBMSMco8MvevyYe9AE8", quantity: 1 }, // price: id do preço como é so um produto fica estatico mesmo
      ],
      mode: "subscription", // pagamento recorrente
      allow_promotion_codes: true, // posso criar um cupom de desconto
      success_url: process.env.STRIPE_SUCCESS_URL, // se a requisição der sucesso onde devo redicionar o usuario
      cancel_url: process.env.STRIPE_CANCEL_URL, // quando o usuario cancela a requisição para onde deve ser redicionado
    });

    return res.status(200).json({ sessionId: stripeCheckoutSession.id });
  } else {
    // se não for do tipo post
    res.setHeader("Allow", "POST");
    res.status(405).end("Method not allowed");
  }
};
