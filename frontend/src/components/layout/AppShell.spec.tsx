import { render, screen } from "@testing-library/react";

import AppShell from "./AppShell";

jest.mock("./SideBar", () => ({
  __esModule: true,
  default: () => <div data-testid="sidebar" />,
}));

jest.mock("./MobileNavbar", () => ({
  __esModule: true,
  default: () => <div data-testid="mobile-navbar" />,
}));

jest.mock("@/components/auth/AuthSessionProvider", () => ({
  __esModule: true,
  AuthSessionProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="auth-session-provider">{children}</div>
  ),
}));

jest.mock("@/components/auth/AuthSessionWatcher", () => ({
  __esModule: true,
  default: () => <div data-testid="auth-session-watcher" />,
}));

describe("AppShell", () => {
  it("wraps the layout with auth session components and renders children", () => {
    render(
      <AppShell>
        <div>Page content</div>
      </AppShell>,
    );

    expect(screen.getByTestId("auth-session-provider")).toBeInTheDocument();
    expect(screen.getByTestId("auth-session-watcher")).toBeInTheDocument();
    expect(screen.getByTestId("sidebar")).toBeInTheDocument();
    expect(screen.getByTestId("mobile-navbar")).toBeInTheDocument();
    expect(screen.getByText("Page content")).toBeInTheDocument();
  });
});
