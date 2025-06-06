import "reflect-metadata";
import express, { Application } from "express";
import cors from "cors";
import { ApolloServer } from "apollo-server-express";
import { typeDefs } from "./schema";
import { resolvers } from "./resolvers";
import { ApolloServerPluginDrainHttpServer } from "apollo-server-core";
import http from "http";

const startServer = async () => {
  const app: Application = express();
  app.use(cors());

  const httpServer = http.createServer(app);

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await server.start();
  server.applyMiddleware({ app });

  const PORT = 4000;
  httpServer.listen(PORT, () => {
    console.log(`Server ready at http://localhost:${PORT}${server.graphqlPath}`);
  });
};

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
