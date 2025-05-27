"use client";

import { useQuery, gql } from "@apollo/client";
import {
  Box,
  Heading,
  Text,
  Spinner,
  Container,
  Flex,
  Button,
} from "@chakra-ui/react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

const GET_POST_BY_ID = gql`
  query GetPostById($id: ID!) {
    post(id: $id) {
      id
      title
      content
      author {
        id
        username
        displayName
      }
    }
  }
`;

export default function PostPage() {
  const params = useParams();
  const router = useRouter();
  const { userId: currentUserId } = useAuth();

  const postId = params.id as string;

  const { loading, error, data } = useQuery(GET_POST_BY_ID, {
    variables: { id: postId },
    skip: !postId,
  });

  if (loading) {
    return (
      <Flex
        minH="100vh"
        align="center"
        justify="center"
        bgGradient="linear(to-br, #F0E6FA, #F8F0FA)"
      >
        <Spinner size="xl" color="purple.500" />
      </Flex>
    );
  }

  if (error) {
    return (
      <Flex
        minH="100vh"
        align="center"
        justify="center"
        bgGradient="linear(to-br, #F0E6FA, #F8F0FA)"
      >
        <Text fontSize="lg" color="red.500" textAlign="center">
          Error loading post: {error.message}. Please try again.
        </Text>
      </Flex>
    );
  }

  if (!data || !data.post) {
    return (
      <Flex
        minH="100vh"
        align="center"
        justify="center"
        flexDirection="column"
        bgGradient="linear(to-br, #F0E6FA, #F8F0FA)"
      >
        <Text fontSize="xl" color="gray.700" mb={4}>
          Post not found.
        </Text>
        <Link href="/" passHref>
          <Button colorScheme="purple" variant="solid">
            Back to Homepage
          </Button>
        </Link>
      </Flex>
    );
  }

  const { title, content, author } = data.post;
  const authorName =
    author?.displayName || author?.username || "Unknown Author";

  const isAuthor = currentUserId === author?.id;

  return (
    <ProtectedRoute>
      <Container
        maxW={{ base: "100%", md: "90%", lg: "800px" }}
        p={{ base: 4, md: 6, lg: 8 }}
        mx="auto"
        minH="100vh"
        bgGradient="linear(to-br, #F0E6FA, #F8F0FA)"
        display="flex"
        flexDirection="column"
        alignItems="center"
      >
        <Flex width="full" mb={6} justifyContent="flex-start">
          <Link href="/">
            <Button colorScheme="purple" variant="outline" flexGrow={1}>
              Back to All Posts
            </Button>
          </Link>
        </Flex>

        <Box
          p={{ base: 5, md: 8 }}
          bg="white"
          borderRadius="lg"
          boxShadow="xl"
          width="full"
          borderColor="purple.100"
          borderWidth="1px"
        >
          <Heading
            as="h1"
            size="xl"
            mb={2}
            color="purple.800"
            textAlign="center"
          >
            {title}
          </Heading>
          <Text fontSize="md" color="gray.500" mb={4} textAlign="center">
            By {authorName}
          </Text>

          <Box
            className="blog-content"
            color="gray.700"
            fontSize={{ base: "md", md: "lg" }}
            lineHeight={{ base: "tall", md: "base" }}
            dangerouslySetInnerHTML={{ __html: content }}
          />

          {isAuthor && (
            <Flex mt={8} justifyContent="center">
              <Button
                colorScheme="teal"
                variant="solid"
                onClick={() => router.push(`/posts/${postId}/edit`)}
              >
                Edit Post
              </Button>
            </Flex>
          )}
        </Box>

        <Flex mt={8} width="full" justifyContent="center">
          <Link href="/" passHref>
            <Button variant="outline" colorScheme="purple">
              Back to All Posts
            </Button>
          </Link>
        </Flex>
      </Container>
    </ProtectedRoute>
  );
}
