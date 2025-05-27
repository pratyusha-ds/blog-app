"use client";

import { useQuery, gql } from "@apollo/client";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import PostList from "@/components/PostList";

const GET_MY_POSTS = gql`
  query GetMyPosts($token: String!) {
    me(token: $token) {
      id
      username
      displayName
      posts {
        id
        title
        content
      }
    }
  }
`;

export default function MyPostsPage() {
  const { token } = useAuth();

  const { loading, error, data } = useQuery(GET_MY_POSTS, {
    variables: { token },
    skip: !token,
    fetchPolicy: "network-only",
  });

  const posts = data?.me?.posts || [];
  const userDisplayName = data?.me?.displayName || data?.me?.username || "User";

  return (
    <ProtectedRoute>
      <PostList
        posts={posts}
        title={`${userDisplayName}'s Posts`}
        loading={loading}
        error={error}
        emptyMessage="You haven't published any posts yet."
        showAuthor={false}
      />
    </ProtectedRoute>
  );
}
