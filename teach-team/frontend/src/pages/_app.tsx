import '@/styles/styling.css';
import type { AppProps } from "next/app";
import {AuthProvider} from "../context/AuthContext"
import {ApplicantProvider} from "../context/ApplicantContext"
import Header from "../components/Header";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <ApplicantProvider>
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <Header />
        <Navbar />
        <div style={{ flex: 1 }}>
        <Component {...pageProps} /> 
        </div>
        <Footer />
        </div>
        </ApplicantProvider>
      </AuthProvider>
    );
}
