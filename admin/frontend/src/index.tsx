import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/index.css";
import "./styles/global.css";
import App from "./App";
import { ApolloWrapper } from "./apolloClient"; 

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
  <ApolloWrapper>
    <App />
  </ApolloWrapper>
);
