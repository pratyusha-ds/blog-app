"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useQuery, useMutation, gql } from "@apollo/client";
import {
  Box,
  Input,
  Button,
  Text,
  VStack,
  Container,
  Heading,
  Flex,
  Spinner,
  Link,
} from "@chakra-ui/react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import "react-quill-new/dist/quill.snow.css";
import { ApolloError } from "@apollo/client";

const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
}) as unknown as typeof import("react-quill-new")["default"];

const GET_POST_FOR_EDIT = gql`
  query GetPostForEdit($id: ID!) {
    post(id: $id) {
      id
      title
      content
      author {
        id
      }
    }
  }
`;

const UPDATE_POST_MUTATION = gql`
  mutation UpdatePost(
    $id: ID!
    $title: String!
    $content: String!
    $token: String!
  ) {
    updatePost(id: $id, title: $title, content: $content, token: $token) {
      ok
      message
      post {
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
  }
`;

export default function EditPostPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;
  const { token, userId: currentUserId } = useAuth();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");

  const {
    loading: queryLoading,
    error: queryError,
    data: queryData,
  } = useQuery(GET_POST_FOR_EDIT, {
    variables: { id: postId },
    skip: !postId,
  });

  const [updatePost, { loading: mutationLoading }] =
    useMutation(UPDATE_POST_MUTATION);

  useEffect(() => {
    if (queryData && queryData.post) {
      const { title, content, author } = queryData.post;

      if (currentUserId === null) {
        return;
      }

      if (currentUserId !== author?.id) {
        setMessage("You are not authorized to edit this post.");
        router.replace(`/posts/${postId}`);
        return;
      }
      setTitle(title);
      setContent(content);
    }
  }, [queryData, currentUserId, router, postId]);

  const handleUpdate = async () => {
    if (!token) {
      setMessage("You must be logged in to update a post.");
      return;
    }
    if (!title.trim() || !content.trim()) {
      setMessage("Title and content cannot be empty.");
      return;
    }

    setMessage("");
    try {
      const { data } = await updatePost({
        variables: { id: postId, title, content, token },
      });

      if (data.updatePost.ok) {
        setMessage(data.updatePost.message || "Post updated successfully!");
        router.push(`/posts/${postId}`);
      } else {
        setMessage(data.updatePost.message || "Failed to update post.");
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
        setMessage("An unknown error occurred during post update.");
      }
    }
  };

  if (queryLoading) {
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

  if (queryError) {
    return (
      <Flex
        minH="100vh"
        align="center"
        justify="center"
        bgGradient="linear(to-br, #F0E6FA, #F8F0FA)"
      >
        <Text fontSize="lg" color="red.500" textAlign="center">
          Error loading post for editing: {queryError.message}.
        </Text>
      </Flex>
    );
  }

  if (
    !queryData ||
    !queryData.post ||
    (currentUserId !== null &&
      queryData.post.author?.id &&
      currentUserId !== queryData.post.author.id)
  ) {
    return (
      <Flex
        minH="100vh"
        align="center"
        justify="center"
        flexDirection="column"
        bgGradient="linear(to-br, #F0E6FA, #F8F0FA)"
      >
        <Text fontSize="xl" color="gray.700" mb={4}>
          {message ||
            "You are not authorized to edit this post, or post not found."}
        </Text>
        <Link href={`/posts/${postId}`}>
          <Button colorScheme="purple" variant="solid">
            Back to Post
          </Button>
        </Link>
      </Flex>
    );
  }

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
        <Heading as="h1" size="xl" color="purple.700" mb={6} textAlign="center">
          Edit Post
        </Heading>

        <VStack
          gap={6}
          align="stretch"
          width="full"
          p={{ base: 4, md: 6 }}
          bg="white"
          borderRadius="lg"
          boxShadow="xl"
          borderColor="purple.100"
          borderWidth="1px"
        >
          <Input
            placeholder="Post Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            size="lg"
            variant="outline"
            _focus={{ borderColor: "purple.400" }}
            _hover={{ borderColor: "purple.300" }}
          />

          <Box
            className="quill-editor-container"
            borderWidth="1px"
            borderColor="gray.200"
            borderRadius="md"
            _hover={{ borderColor: "purple.300" }}
          >
            <ReactQuill
              theme="snow"
              value={content}
              onChange={setContent}
              style={{
                maxHeight: "400px",
                overflowY: "auto",
              }}
              modules={{
                toolbar: [
                  [{ header: [1, 2, false] }],
                  ["bold", "italic", "underline", "strike"],
                  ["blockquote", "code-block"],
                  [{ list: "ordered" }, { list: "bullet" }],
                  [{ indent: "-1" }, { indent: "+1" }],
                  [{ align: [] }],
                  ["link", "image"],
                  ["clean"],
                ],
              }}
            />
          </Box>

          <Button
            onClick={handleUpdate}
            loading={mutationLoading}
            colorScheme="purple"
            size="lg"
            width="full"
            _hover={{ bg: "purple.500" }}
            _active={{ bg: "purple.700" }}
          >
            Update Post
          </Button>

          {message && (
            <Text
              color={message.includes("success") ? "green.600" : "red.600"}
              textAlign="center"
              fontWeight="semibold"
            >
              {message}
            </Text>
          )}

          <Link href={`/posts/${postId}`}>
            <Button variant="ghost" width="full" mt={2}>
              Cancel
            </Button>
          </Link>
        </VStack>
      </Container>
    </ProtectedRoute>
  );
}
