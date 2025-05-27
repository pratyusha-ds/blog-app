"use client";

import { Button } from "@chakra-ui/react";
import { useAuth } from "@/context/AuthContext";

export default function LogoutButton() {
  const { logout } = useAuth();

  return (
    <Button onClick={logout} colorScheme="red" variant="outline">
      Logout
    </Button>
  );
}
