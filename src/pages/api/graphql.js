import { gql, ApolloServer } from "apollo-server-micro";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
// import { buildClientSchema, introspectionQuery } from "graphql";

const typeDefs = gql`
  type Query {
    hello: String!
    numbers: [Int!]!
  }
`;

const resolvers = {
    Query: {
        hello: () => 'Hello, world!',
        numbers: () => [1, 2, 3, 4, 5],
    },
};
async function createServer(url) {
    // const introspectionResult = await fetch(url, {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ query: introspectionQuery }),
    // }).then(res => res.json());

    // const schema = buildClientSchema(introspectionResult.data);

    const server = new ApolloServer({
        typeDefs,
        resolvers,
        plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
    });

    return server;
}


const url = "https://query-api-hasura-vcqilefdcq-uc.a.run.app/v1/graphql";
export default async function handler(req, res) {
    const server = await createServer(url);
    await server.start()

    server.createHandler({
        path: "/api/graphql",
    })(req, res);

}
