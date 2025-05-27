"use client";

import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { ReactNode } from "react";
import { ApolloProvider } from "@apollo/client";
import client from "@/graphql/apolloClient";
import NavBar from "@/components/NavBar";
import { AuthProvider } from "@/context/AuthContext";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ApolloProvider client={client}>
          <AuthProvider>
            <ChakraProvider value={defaultSystem}>
              <NavBar />
              {children}
            </ChakraProvider>
          </AuthProvider>
        </ApolloProvider>
      </body>
    </html>
  );
}
