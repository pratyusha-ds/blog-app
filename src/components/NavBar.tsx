import { Box, Flex, Spacer, Link, Button } from "@chakra-ui/react";
import NextLink from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";

export default function NavBar() {
  const { isAuthenticated, displayName, logout } = useAuth();

  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  return (
    <Box
      as="nav"
      bg="linear-gradient(135deg, #D8BFD8, #DDA0DD)"
      color="white"
      px={6}
      py={4}
      boxShadow="lg"
      position="sticky"
      top={0}
      zIndex={100}
    >
      <Flex align="center">
        <Link
          as={NextLink}
          href="/"
          fontWeight="bold"
          fontSize="xl"
          fontFamily="Bricolage Grotesque, sans-serif"
          _hover={{ textDecoration: "underline", color: "#BA55D3" }}
        >
          MyBlog
        </Link>
        <Spacer />
        <Flex gap={4} align="center">
          <Link
            as={NextLink}
            href="/"
            _hover={{ color: "#BA55D3", textDecoration: "underline" }}
          >
            Home
          </Link>

          {isAuthenticated ? (
            <>
              {displayName && (
                <Link
                  as={NextLink}
                  href="/profile"
                  _hover={{ color: "#BA55D3", textDecoration: "underline" }}
                >
                  Profile
                </Link>
              )}
              <Link
                as={NextLink}
                href="/editor"
                _hover={{ color: "#BA55D3", textDecoration: "underline" }}
              >
                Editor
              </Link>
              <Link
                as={NextLink}
                href="/myposts"
                _hover={{ color: "#BA55D3", textDecoration: "underline" }}
              >
                My Posts
              </Link>
              <Button
                variant="outline"
                colorScheme="purple"
                size="md"
                onClick={logout}
                _hover={{ bg: "#BA55D3", color: "white" }}
                fontWeight="semibold"
                fontFamily="Bricolage Grotesque, sans-serif"
                borderWidth="2px"
                borderColor="whiteAlpha.800"
                transition="all 0.3s ease"
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link
                as={NextLink}
                href="/login"
                _hover={{ color: "#BA55D3", textDecoration: "underline" }}
              >
                Login
              </Link>
              <Link
                as={NextLink}
                href="/register"
                _hover={{ color: "#BA55D3", textDecoration: "underline" }}
              >
                Register
              </Link>
            </>
          )}
        </Flex>
      </Flex>
    </Box>
  );
}
