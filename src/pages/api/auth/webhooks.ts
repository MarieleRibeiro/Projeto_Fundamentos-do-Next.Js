import { NextApiRequest, NextApiResponse } from "next";
import { Readable } from "stream";
import Stripe from "stripe";
import { stripe } from "../../../services/stripe";

async function buffer(readable: Readable) {
  const chunks = [];

  for await (const chunk of readable) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

// por padrão o next tem formato de entender a requisição-> ele entende que toda requisição esta vindo como um Json por exemplo
// ou como um envio de um formulario, mas nesse caso a requisição esta vindo como uma stream, então eu preciso desabilitar o entendimento padrão do next
// sobre oq ta vindo da requisição.
export const config = {
  api: {
    bodyParser: false,
  },
};

const relevantEvents = new Set(["checkout.session.completed"]);

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const buf = await buffer(req);
    const secret = req.headers["stripe-signature"];

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        buf,
        secret,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      return res.status(400).send(`Webhook error: ${err.message}`);
    }

    const { type } = event;

    if (relevantEvents.has(type)) {
      //fazer algo
      console.log("evento recebido", event);
    }

    res.json({ received: true });
  } else {
    res.setHeader("ALLOW", "POST");
    res.status(405).end("Method not allowed");
  }
};
