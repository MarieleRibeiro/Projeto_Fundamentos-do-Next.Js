import NextAuth from "next-auth";
import Providers from "next-auth/providers";

import { query as q } from "faunadb";
import { fauna } from "../../../services/fauna";

export default NextAuth({
  providers: [
    Providers.GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      scope: "read:user",
    }),
  ],
  jwt: {
    signingKey: process.env.SINGING_KEY,
  },

  callbacks: {
    // são basicamente funções que são executadas de forma automatica pelo nextAuth assim que acontece uma ação
    async signIn(user, account, profile) {
      // exemplo: assim que o usuario logar
      const { email } = user;

      try {
        await fauna.query(q.Create(q.Collection("users"), { data: { email } }));
        return true;
      } catch {
        return false;
      }
    },
  },
}); // o fauna tem seu proprio metodo de escrita das query

// ESTRATÉGIAS DE AUTENTICAÇÃO
// -> JWT(storange)- geralmente tem uma data de expiração, coloca essa expiração ate baixa pra poder
//trabalhar com refhesh token, atualizando eles aos poucos quando o usuario precisa acessar a aplicação de novo
// -> Next Auth(Social) quando a gente quer um sistema de autenticação simples, e quando precisa de login social
//ou seja fazer um login de terceiro(com github, com facebook, ...), e consegue utilizar o Next Auth quando não quer
// se preocupar em ficar armazenando credenciais de acesso do usuario dento do nosso back-end.
// -> Cognito(AWS) utiliza-se de serviços externos, provider de autenticação externa ou seja esses provider vão
//se conectar e armazenar dados do usuario, senha, fazer envio de email
