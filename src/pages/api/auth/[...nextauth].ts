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

  callbacks: {
    // são basicamente funções que são executadas de forma automatica pelo nextAuth assim que acontece uma ação
    async session(session) {
      try {
        const userActiveSubscription = await fauna.query(
          q.Get(
            q.Intersection([
              q.Match(
                q.Index("subscription_by_user_ref"),
                q.Select(
                  "ref",
                  q.Get(
                    q.Match(
                      q.Index("user_by_email"),
                      q.Casefold(session.user.email)
                    )
                  )
                )
              ),
              q.Match(q.Index("subscription_by_status"), "active"),
            ])
          )
        );
        return {
          ...session,
          activeSubscription: userActiveSubscription,
        };
      } catch {
        return {
          ...session,
          activeSubscription: null,
        };
      }
    },
    async signIn(user, account, profile) {
      // exemplo: assim que o usuario logar
      const { email } = user;

      try {
        await fauna.query(
          q.If(
            //se
            q.Not(
              // não
              q.Exists(
                // existe
                q.Match(
                  // um usuario o qual ele realiza um match(ou seja o if bate)
                  q.Index("user_by_email"), // por email que bate
                  q.Casefold(user.email) // com esse email aqui(casefold->normaliza o email letra maiuscula minuscula)
                )
              )
            ),
            q.Create(
              // eu quero criar então
              q.Collection("users"), // na collection usuarios
              { data: { email } } // um usuario com esse email aqui
            ), // senão
            q.Get(
              // eu vou buscar
              // busca
              q.Match(
                // um usuario que bate com esse email
                q.Index("user_by_email"),
                q.Casefold(user.email)
              )
            )
          )
        );
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
