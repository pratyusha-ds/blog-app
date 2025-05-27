import {
  Box,
  Heading,
  Text,
  Stack,
  Container,
  Flex,
  Image,
  Spinner,
} from "@chakra-ui/react";
import Link from "next/link";
import { getExcerpt, getFirstImageUrl } from "@/utils/postHelpers";

interface Post {
  id: string;
  title: string;
  content: string;
  author?: {
    id: string;
    username: string;
    displayName?: string;
  };
}

interface PostListProps {
  posts: Post[];
  title: string;
  loading: boolean;
  error: Error | undefined;
  emptyMessage: string;
  showAuthor?: boolean;
}

export default function PostList({
  posts,
  title,
  loading,
  error,
  emptyMessage,
  showAuthor = false,
}: PostListProps) {
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
          Error loading posts: {error.message}. Please try again later.
        </Text>
      </Flex>
    );
  }

  return (
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
      <Heading
        as="h1"
        size="xl"
        mb={{ base: 6, md: 8 }}
        color="purple.700"
        textAlign="center"
        py={4}
        px={{ base: 4, md: 0 }}
      >
        {title}
      </Heading>

      {posts.length === 0 ? (
        <Box
          p={{ base: 5, md: 8 }}
          bg="white"
          borderRadius="lg"
          boxShadow="xl"
          width="full"
          textAlign="center"
          borderColor="purple.100"
          borderWidth="1px"
        >
          <Text fontSize="lg" color="gray.600">
            {emptyMessage}
          </Text>
        </Box>
      ) : (
        <Stack gap={6} align="stretch" width="full">
          {posts.map((post: Post) => {
            const excerpt = getExcerpt(post.content, 150);
            const imageUrl = getFirstImageUrl(post.content);
            const authorName =
              post.author?.displayName ||
              post.author?.username ||
              "Unknown Author";

            return (
              <Link key={post.id} href={`/posts/${post.id}`}>
                <Box
                  as="div"
                  display="block"
                  p={{ base: 5, md: 6 }}
                  shadow="md"
                  borderWidth="1px"
                  borderRadius="lg"
                  bg="white"
                  borderColor="purple.100"
                  cursor="pointer"
                  _hover={{
                    boxShadow: "lg",
                    transform: "translateY(-2px)",
                    transition: "all 0.2s ease-in-out",
                  }}
                >
                  <Flex
                    direction={{ base: "column", md: "row" }}
                    alignItems="center"
                  >
                    {imageUrl && (
                      <Box
                        mr={{ base: 0, md: 4 }}
                        mb={{ base: 4, md: 0 }}
                        flexShrink={0}
                      >
                        <Image
                          src={imageUrl}
                          alt={post.title}
                          borderRadius="md"
                          boxSize={{ base: "100%", md: "120px" }}
                          maxH={{ base: "150px", md: "120px" }}
                          objectFit="cover"
                          width={{ base: "full", md: "120px" }}
                        />
                      </Box>
                    )}
                    <Box flex={1}>
                      <Heading
                        fontSize={{ base: "xl", md: "2xl" }}
                        mb={2}
                        color="purple.800"
                      >
                        {post.title}
                      </Heading>
                      {showAuthor && (
                        <Text fontSize="sm" color="gray.500" mb={2}>
                          By {authorName}
                        </Text>
                      )}
                      <Text
                        color="gray.700"
                        fontSize={{ base: "md", md: "lg" }}
                        lineHeight={{ base: "tall", md: "base" }}
                        lineClamp={3}
                      >
                        {excerpt}
                      </Text>
                    </Box>
                  </Flex>
                </Box>
              </Link>
            );
          })}
        </Stack>
      )}
    </Container>
  );
}
