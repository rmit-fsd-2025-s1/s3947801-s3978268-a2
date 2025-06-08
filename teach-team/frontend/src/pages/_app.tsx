import "@/styles/styling.css";
import type { AppProps } from "next/app";
import { AuthProvider } from "../context/AuthContext";
import { ApplicantProvider } from "../context/ApplicantContext";
import Header from "../components/Header";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { ApolloProvider } from "@apollo/client";
import { client } from "../graphql/apolloClient"; 

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ApolloProvider client={client}>
      <AuthProvider>
        <ApplicantProvider>
          <div className="app-container">
            <Header />
            <Navbar />
            <div className="app-content">
              <Component {...pageProps} />
            </div>
            <Footer />
            <ToastContainer position="bottom-right" autoClose={3000} />
          </div>
        </ApplicantProvider>
      </AuthProvider>
    </ApolloProvider>
  );
}
