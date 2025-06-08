import { createClient } from 'graphql-ws';

export const subscriptionClient = createClient({
  url: 'ws://localhost:4000/graphql', 
});
