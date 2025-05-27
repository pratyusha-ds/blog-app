"use client";

import { useQuery, gql } from "@apollo/client";
import PostList from "@/components/PostList";

const GET_POSTS = gql`
  query GetPosts {
    posts {
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

export default function HomePage() {
  const { loading, error, data } = useQuery(GET_POSTS, {
    fetchPolicy: "network-only",
  });

  const posts = data?.posts || [];

  return (
    <PostList
      posts={posts}
      title="All Blog Posts"
      loading={loading}
      error={error}
      emptyMessage="No posts found yet. Check back later!"
      showAuthor={true}
    />
  );
}
