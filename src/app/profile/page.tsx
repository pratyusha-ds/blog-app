"use client";

import { useAuth } from "@/context/AuthContext";
import { useQuery, gql } from "@apollo/client";
import { Box, Heading, Text, Spinner, Flex, VStack } from "@chakra-ui/react";
import ProtectedRoute from "@/components/ProtectedRoute";

const ME_QUERY = gql`
  query Me($token: String!) {
    me(token: $token) {
      username
      displayName
    }
  }
`;

function ProfileContent() {
  const { token, isAuthenticated } = useAuth();

  const { loading, error, data } = useQuery(ME_QUERY, {
    variables: { token },
    skip: !isAuthenticated || !token,
    fetchPolicy: "network-only",
  });

  if (loading) {
    return (
      <Flex minH="80vh" align="center" justify="center">
        <Spinner size="xl" color="purple.500" />
      </Flex>
    );
  }

  if (error) {
    console.error("Error fetching profile:", error);
    return (
      <Flex minH="80vh" align="center" justify="center">
        <Text fontSize="lg" color="red.500">
          Error loading profile: {error.message}
        </Text>
      </Flex>
    );
  }

  if (!data || !data.me) {
    return (
      <Flex minH="80vh" align="center" justify="center">
        <Text fontSize="lg" color="gray.600">
          Profile data could not be found.
        </Text>
      </Flex>
    );
  }

  const userDisplayName = data.me.displayName || data.me.username;

  return (
    <Box maxW="800px" mx="auto" mt={10} p={4}>
      <Heading mb={4}>Welcome, {userDisplayName}!</Heading>
      <Text fontSize="md" color="gray.600" mb={6}>
        This is your profile page. Here you can see your basic account
        information.
      </Text>

      <VStack
        align="flex-start"
        gap={3}
        p={5}
        borderWidth="1px"
        borderRadius="lg"
        boxShadow="sm"
        bg="white"
      >
        <Text fontSize="lg" fontWeight="semibold" color="purple.700">
          Account Details
        </Text>
        <Text>
          <Text as="span" fontWeight="bold">
            Email ID:
          </Text>{" "}
          {data.me.username}
        </Text>
        {data.me.displayName && (
          <Text>
            <Text as="span" fontWeight="bold">
              Display Name:
            </Text>{" "}
            {data.me.displayName}
          </Text>
        )}
      </VStack>
    </Box>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}
