import "reflect-metadata";
import { AppDataSource } from "./data-source";
import express from "express";
import cors from "cors";
import http from "http";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { ApolloServer } from "apollo-server-express";
import { ApolloServerPluginDrainHttpServer } from "apollo-server-core";
import { WebSocketServer } from "ws";

// @ts-ignore 
import { useServer } from "graphql-ws/lib/use/ws";

import { typeDefs } from "./schema";
import { resolvers } from "./resolvers";

async function start() {
  await AppDataSource.initialize();
  console.log("Data Source has been initialized.");

  const app = express();
  app.use(cors());

  const schema = makeExecutableSchema({ typeDefs, resolvers });

  const httpServer = http.createServer(app);

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: "/graphql",
  });

  const serverCleanup = useServer({ schema }, wsServer);

  const apollo = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
  });

  await apollo.start();
  apollo.applyMiddleware({ app, path: "/graphql" });

  const PORT = 4000;
  httpServer.listen(PORT, () => {
    console.log(`HTTP: http://localhost:${PORT}/graphql`);
    console.log(`WS:   ws://localhost:${PORT}/graphql`);
  });
}

start().catch((err) => {
  console.error("Server failed to start", err);
});
