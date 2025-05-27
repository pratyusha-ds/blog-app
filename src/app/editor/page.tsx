"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useMutation, gql } from "@apollo/client";
import {
  Box,
  Input,
  Button,
  Text,
  VStack,
  Container,
  Heading,
  Flex,
} from "@chakra-ui/react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import "react-quill-new/dist/quill.snow.css";
import type { ApolloError } from "@apollo/client";

type QuillEditorProps = {
  value: string;
  onChange: (value: string) => void;
  theme?: string;
  modules?: Record<string, unknown>;
  style?: React.CSSProperties;
};

const ReactQuill = dynamic<QuillEditorProps>(() => import("react-quill-new"), {
  ssr: false,
});

const CREATE_POST = gql`
  mutation CreatePost($title: String!, $content: String!, $token: String!) {
    createPost(title: $title, content: $content, token: $token) {
      ok
      message
      post {
        id
        title
      }
    }
  }
`;

export default function EditorPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");
  const [createPost, { loading }] = useMutation(CREATE_POST);
  const { token } = useAuth();

  const handlePublish = async () => {
    if (!token) {
      setMessage("You must be logged in to publish a post.");
      console.warn("EditorPage: Token is missing!");
      return;
    }
    if (!title.trim() || !content.trim()) {
      setMessage("Title and content cannot be empty.");
      return;
    }

    setMessage("");
    console.log("EditorPage: Token being sent:", token);
    try {
      const { data } = await createPost({
        variables: { title, content, token },
      });

      setMessage(data.createPost.message);
      if (data.createPost.ok) {
        setTitle("");
        setContent("");
      }
    } catch (err: unknown) {
      console.error("Post creation error:", err);

      if (
        typeof err === "object" &&
        err !== null &&
        "graphQLErrors" in err &&
        Array.isArray(err.graphQLErrors) &&
        err.graphQLErrors.length > 0
      ) {
        setMessage(
          `GraphQL Error: ${(err as ApolloError).graphQLErrors[0].message}`
        );
      } else if (
        typeof err === "object" &&
        err !== null &&
        "networkError" in err &&
        typeof (err as ApolloError).networkError === "object" &&
        (err as ApolloError).networkError !== null
      ) {
        setMessage(
          `Network Error: ${(err as ApolloError).networkError!.message}`
        );
      } else if (err instanceof Error) {
        setMessage(`An unexpected error occurred: ${err.message}`);
      } else {
        setMessage("An unknown error occurred during post creation.");
      }
    }
  };

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
        <Flex
          width="full"
          justifyContent="center"
          alignItems="center"
          mb={6}
          flexDirection="column"
          gap={4}
        >
          <Heading as="h1" size="xl" color="purple.700" textAlign="center">
            Create New Post
          </Heading>
        </Flex>

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
            onClick={handlePublish}
            loading={loading}
            colorScheme="purple"
            size="lg"
            width="full"
            _hover={{ bg: "purple.500" }}
            _active={{ bg: "purple.700" }}
          >
            Publish Post
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
        </VStack>
      </Container>
    </ProtectedRoute>
  );
}
