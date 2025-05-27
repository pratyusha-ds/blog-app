import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import LoginPage from "./page";
import { MockedProvider, MockedResponse } from "@apollo/client/testing";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { gql } from "@apollo/client";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/context/AuthContext", () => ({
  useAuth: jest.fn(),
}));

const LOGIN_MUTATION = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
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

describe("LoginPage", () => {
  const mockPush = jest.fn();
  const mockAuthLogin = jest.fn();
  const mockSetIsAuthenticated = jest.fn();
  const mockIsAuthenticated = false;

  beforeEach(() => {
    mockPush.mockClear();
    mockAuthLogin.mockClear();
    mockSetIsAuthenticated.mockClear();

    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });

    (useAuth as jest.Mock).mockReturnValue({
      login: mockAuthLogin,
      isAuthenticated: mockIsAuthenticated,
      setIsAuthenticated: mockSetIsAuthenticated,
    });
  });

  it("renders login form elements correctly", () => {
    render(
      <MockedProvider mocks={[]}>
        <ChakraProvider value={defaultSystem}>
          <LoginPage />
        </ChakraProvider>
      </MockedProvider>
    );

    expect(
      screen.getByRole("heading", { name: /welcome!/i })
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
    expect(screen.getByText(/don't have an account?/i)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /register here./i })
    ).toBeInTheDocument();
  });

  it("handles successful login and navigates to home", async () => {
    const successMock: MockedResponse = {
      request: {
        query: LOGIN_MUTATION,
        variables: { username: "testuser", password: "password123" },
      },
      result: {
        data: {
          login: {
            ok: true,
            message: "Login successful!",
            token: "mock-token-123",
            user: {
              id: "user-1",
              username: "testuser",
              displayName: "Test User",
            },
          },
        },
      },
    };

    render(
      <MockedProvider mocks={[successMock]} addTypename={false}>
        <ChakraProvider value={defaultSystem}>
          <LoginPage />
        </ChakraProvider>
      </MockedProvider>
    );

    fireEvent.change(screen.getByPlaceholderText(/username/i), {
      target: { value: "testuser" },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /login/i })).not.toBeDisabled();
      expect(screen.getByText(/login successful!/i)).toBeInTheDocument();
    });

    expect(mockAuthLogin).toHaveBeenCalledTimes(1);
    expect(mockAuthLogin).toHaveBeenCalledWith(
      "mock-token-123",
      "user-1",
      "testuser",
      "Test User"
    );

    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith("/");
  });

  it("displays an error message on failed login", async () => {
    const failMock: MockedResponse = {
      request: {
        query: LOGIN_MUTATION,
        variables: { username: "wronguser", password: "wrongpassword" },
      },
      result: {
        data: {
          login: {
            ok: false,
            message: "Invalid credentials.",
            token: null,
            user: null,
          },
        },
      },
    };

    render(
      <MockedProvider mocks={[failMock]} addTypename={false}>
        <ChakraProvider value={defaultSystem}>
          <LoginPage />
        </ChakraProvider>
      </MockedProvider>
    );

    fireEvent.change(screen.getByPlaceholderText(/username/i), {
      target: { value: "wronguser" },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: "wrongpassword" },
    });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials./i)).toBeInTheDocument();
    });
    expect(mockAuthLogin).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("displays a GraphQL error message", async () => {
    const errorMock: MockedResponse = {
      request: {
        query: LOGIN_MUTATION,
        variables: { username: "erroruser", password: "errorpassword" },
      },
      error: new Error("GraphQL network error: Forbidden"),
    };

    render(
      <MockedProvider mocks={[errorMock]} addTypename={false}>
        <ChakraProvider value={defaultSystem}>
          <LoginPage />
        </ChakraProvider>
      </MockedProvider>
    );

    fireEvent.change(screen.getByPlaceholderText(/username/i), {
      target: { value: "erroruser" },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: "errorpassword" },
    });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/Network Error: GraphQL network error: Forbidden/i)
      ).toBeInTheDocument();
    });

    expect(mockAuthLogin).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("redirects to home if user is already authenticated", async () => {
    (useAuth as jest.Mock).mockReturnValue({
      login: mockAuthLogin,
      isAuthenticated: true,
    });

    render(
      <MockedProvider mocks={[]}>
        <ChakraProvider value={defaultSystem}>
          <LoginPage />
        </ChakraProvider>
      </MockedProvider>
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith("/");
    });

    expect(
      screen.queryByRole("heading", { name: /welcome!/i })
    ).not.toBeInTheDocument();
  });
});
