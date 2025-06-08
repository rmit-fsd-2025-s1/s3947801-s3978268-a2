import { ApolloClient, InMemoryCache, HttpLink, split } from "@apollo/client";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { getMainDefinition } from "@apollo/client/utilities";
import { subscriptionClient } from "./subscriptionClient"; 

// WebSocket link for subscriptions
const wsLink = new GraphQLWsLink(subscriptionClient);

// HTTP link for queries and mutations
const httpLink = new HttpLink({
  uri: "http://localhost:4000/graphql",
});

// Use split to direct operations to the correct transport
const splitLink = split(
  ({ query }) => {
    const def = getMainDefinition(query);
    return (
      def.kind === "OperationDefinition" &&
      def.operation === "subscription"
    );
  },
  wsLink,
  httpLink
);

export const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});
