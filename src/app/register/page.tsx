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

const REGISTER_MUTATION = gql`
  mutation Register(
    $username: String!
    $password: String!
    $displayName: String!
  ) {
    register(
      username: $username
      password: $password
      displayName: $displayName
    ) {
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

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [message, setMessage] = useState("");
  const [registerApollo, { loading }] = useMutation(REGISTER_MUTATION);

  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  const handleRegister = async () => {
    setMessage("");

    if (!username.trim() || !password.trim() || !displayName.trim()) {
      setMessage("Username, author name, and password cannot be empty.");
      return;
    }
    if (password.length < 6) {
      setMessage("Password must be at least 6 characters long.");
      return;
    }

    try {
      const { data } = await registerApollo({
        variables: { username, password, displayName },
      });

      if (data.register.ok) {
        setUsername("");
        setPassword("");
        setDisplayName("");
        setMessage(
          data.register.message || "Registration successful! Please log in."
        );
        router.push("/login");
      } else {
        setMessage(
          data.register.message || "Registration failed. Please try again."
        );
      }
    } catch (err: unknown) {
      if (err instanceof ApolloError) {
        if (err.graphQLErrors.length > 0) {
          setMessage(`GraphQL Error: ${err.graphQLErrors[0].message}`);
        } else if (err.networkError) {
          setMessage(`Network Error: ${err.networkError.message}`);
        } else {
          setMessage("Apollo error occurred.");
        }
      } else {
        setMessage("An unexpected error occurred during registration.");
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
            Create Your Account
          </Heading>
          <Input
            placeholder="Username (e.g., your email)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            size="lg"
            variant="subtle"
            _focus={{ borderColor: "purple.400" }}
            _hover={{ borderColor: "purple.300" }}
          />
          <Input
            placeholder="Display Name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
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
            onClick={handleRegister}
            loading={loading}
            colorScheme="purple"
            size="lg"
            width="full"
            _hover={{ bg: "purple.500" }}
            _active={{ bg: "purple.700" }}
          >
            Register
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
            Already have an account?{" "}
            <ChakraLink
              as={NextLink}
              href="login"
              color="purple.500"
              fontWeight="bold"
            >
              Login here.
            </ChakraLink>
          </Text>
        </VStack>
      </Container>
    </Flex>
  );
}
