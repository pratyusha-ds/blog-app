"use client";

import { useState, useEffect } from "react";
import { useMutation, gql } from "@apollo/client";
import {
  Input,
  Button,
  Text,
  VStack,
  Heading,
  Container,
  Flex,
  Link as ChakraLink,
} from "@chakra-ui/react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import NextLink from "next/link";
import { ApolloError } from "@apollo/client";

const LOGIN_MUTATION = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      ok
      message
      token
      user {
        id
        username
        displayName
      }
    }
  }
`;

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const [loginApollo, { loading }] = useMutation(LOGIN_MUTATION);

  const { login: authContextLogin, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  const handleLogin = async () => {
    setMessage("");
    try {
      const { data } = await loginApollo({ variables: { username, password } });

      if (data.login.ok && data.login.token && data.login.user) {
        authContextLogin(
          data.login.token,
          data.login.user.id,
          data.login.user.username,
          data.login.user.displayName
        );

        setUsername("");
        setPassword("");
        setMessage(data.login.message || "Login successful!");
        router.push("/");
      } else {
        setMessage(
          data.login.message || "Login failed. Please check credentials."
        );
      }
    } catch (err: unknown) {
      if (err instanceof ApolloError) {
        if (err.graphQLErrors.length > 0) {
          setMessage(`GraphQL Error: ${err.graphQLErrors[0].message}`);
        } else if (err.networkError) {
          setMessage(`Network Error: ${err.networkError.message}`);
        }
      } else if (err instanceof Error) {
        setMessage(`Unexpected error: ${err.message}`);
      } else {
        setMessage("An unknown error occurred during login.");
      }
    }
  };

  if (isAuthenticated) {
    return null;
  }

  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      bgGradient="linear(to-br, #E6E6FA, #D8BFD8)"
      py={10}
    >
      <Container
        maxW="400px"
        p={8}
        borderWidth={1}
        borderRadius="lg"
        boxShadow="xl"
        bg="white"
        borderColor="purple.200"
      >
        <VStack gap={6} align="stretch">
          <Heading as="h1" size="xl" textAlign="center" color="purple.600">
            Welcome!
          </Heading>
          <Input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            size="lg"
            variant="subtle"
            _focus={{ borderColor: "purple.400" }}
            _hover={{ borderColor: "purple.300" }}
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            size="lg"
            variant="subtle"
            _focus={{ borderColor: "purple.400" }}
            _hover={{ borderColor: "purple.300" }}
          />
          <Button
            onClick={handleLogin}
            loading={loading}
            colorScheme="purple"
            size="lg"
            width="full"
            _hover={{ bg: "purple.500" }}
            _active={{ bg: "purple.700" }}
          >
            Login
          </Button>
          {message && (
            <Text
              mt={4}
              color={message.includes("successful") ? "green.600" : "red.600"}
              textAlign="center"
              fontWeight="semibold"
            >
              {message}
            </Text>
          )}
          <Text textAlign="center" color="gray.600">
            Don&apos;t have an account?{" "}
            <ChakraLink
              as={NextLink}
              href="register"
              color="purple.500"
              fontWeight="bold"
            >
              Register here.
            </ChakraLink>
          </Text>
        </VStack>
      </Container>
    </Flex>
  );
}
