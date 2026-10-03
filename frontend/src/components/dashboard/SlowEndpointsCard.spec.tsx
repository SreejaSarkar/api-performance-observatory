import { render, screen } from "@testing-library/react";

import SlowEndpointsCard from "./SlowEndpointsCard";

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

jest.mock("lucide-react", () => ({
  Eye: () => <svg data-testid="eye-icon" />,
  Info: () => <svg data-testid="info-icon" />,
}));

jest.mock("../common/EmptyState", () => ({
  __esModule: true,
  default: ({ title, description, icon }: { title: string; description: string; icon: string }) => (
    <div data-testid="empty-state">
      <span>{icon}</span>
      <span>{title}</span>
      <span>{description}</span>
    </div>
  ),
}));

describe("SlowEndpointsCard", () => {
  it("renders the empty state when there are no slow endpoints", () => {
    render(<SlowEndpointsCard endpoints={[]} />);

    expect(screen.getByTestId("empty-state")).toBeInTheDocument();
    expect(screen.getByText("No Slow Endpoints")).toBeInTheDocument();
  });

  it("renders endpoint rows with links and metrics", () => {
    render(
      <SlowEndpointsCard
        endpoints={[
          {
            endpoint: "/api/orders/list",
            avgLatency: 812,
            requests: 42,
          },
        ]}
      />,
    );

    expect(screen.getByRole("heading", { name: "Top Slow Endpoints" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "/api/orders/list" })).toHaveAttribute(
      "href",
      "/endpoints/%2Fapi%2Forders%2Flist",
    );
    expect(screen.getByRole("link", { name: "View details for /api/orders/list" })).toHaveAttribute(
      "href",
      "/endpoints/%2Fapi%2Forders%2Flist",
    );
    expect(screen.getByText("42 requests")).toBeInTheDocument();
    expect(screen.getByText("812ms")).toBeInTheDocument();
    expect(screen.getByTestId("eye-icon")).toBeInTheDocument();
    expect(screen.getByTestId("info-icon")).toBeInTheDocument();
  });
});
