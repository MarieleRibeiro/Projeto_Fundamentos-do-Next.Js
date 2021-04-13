import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/client";
import { stripe } from "../../services/stripe";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    // verificar se o metodo da requisição é post/ queremos aceitar requisição do tipo post(sempre que eu estou criando é metodo post)

    const session = await getSession({ req });

    const stripeCustomer = await stripe.customers.create({
      email: session.user.email,
      // metadata
    });

    const stripeCheckoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomer.id, //quem esta comprando esse pacote, e não pode ser somente um id no nosso cliente, ou email dele
      payment_method_types: ["card"], // metodos de pagamentos
      billing_address_collection: "required", // obrigar o usuario a preencher o endereço ou não
      line_items: [
        { price: "price_1IdwvOBMSMco8MvevyYe9AE8", quantity: 1 }, // price: id do preço como é so um produto fica estatico mesmo
      ],
      mode: "subscription", // pagamento recorrente
      allow_promotion_codes: true, // posso criar um cupom de desconto
      success_url: process.env.STRIPE_SUCESS_URL, // se a requisição der sucesso onde devo redicionar o usuario
      cancel_url: process.env.STRIPE_CANCEL_URL, // quando o usuario cancela a requisição para onde deve ser redicionado
    });

    return res.status(200).json({ sessionId: stripeCheckoutSession.id });
  } else {
    // se não for do tipo post
    res.setHeader("Allow", "POST");
    res.status(405).end("Method not allowed");
  }
};
