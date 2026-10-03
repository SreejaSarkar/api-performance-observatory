import { fireEvent, render, screen } from "@testing-library/react";

import WebhookTable from "./WebhookTable";

jest.mock("lucide-react", () => ({
  Send: () => <svg data-testid="send-icon" />,
  Trash2: () => <svg data-testid="trash-icon" />,
}));

jest.mock("../common/EmptyState", () => ({
  __esModule: true,
  default: ({ icon, title, description }: { icon: string; title: string; description: string }) => (
    <div data-testid="empty-state">
      <span>{icon}</span>
      <span>{title}</span>
      <span>{description}</span>
    </div>
  ),
}));

describe("WebhookTable", () => {
  it("renders the empty state when no webhooks exist", () => {
    render(<WebhookTable webhooks={[]} onDelete={jest.fn()} onTest={jest.fn()} />);

    expect(screen.getByTestId("empty-state")).toBeInTheDocument();
    expect(screen.getByText("No destinations configured")).toBeInTheDocument();
  });

  it("renders webhook rows and triggers test/delete actions", () => {
    const onDelete = jest.fn();
    const onTest = jest.fn();

    render(
      <WebhookTable
        webhooks={[
          {
            createdAt: "2026-09-29T08:15:00.000Z",
            id: "webhook-1",
            name: "Ops channel",
            provider: "MICROSOFT_TEAMS",
            updatedAt: "2026-09-29T08:15:00.000Z",
            url: "https://outlook.office.com/webhook/abc",
          },
          {
            createdAt: "2026-09-29T09:00:00.000Z",
            id: "webhook-2",
            name: null,
            provider: "GENERIC",
            updatedAt: "2026-09-29T09:00:00.000Z",
            url: "https://example.com/hooks/alerts",
          },
        ]}
        onDelete={onDelete}
        onTest={onTest}
      />,
    );

    expect(screen.getByText("Ops channel")).toBeInTheDocument();
    expect(screen.getAllByText("Microsoft Teams")).toHaveLength(1);
    expect(screen.getAllByText("Generic webhook")).toHaveLength(2);
    expect(screen.getByText("https://outlook.office.com/webhook/abc")).toBeInTheDocument();
    expect(screen.getByText("https://example.com/hooks/alerts")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Test" })).toHaveLength(2);

    fireEvent.click(screen.getAllByRole("button", { name: "Test" })[1]);
    fireEvent.click(screen.getAllByRole("button")[3]);

    expect(onTest).toHaveBeenCalledWith("webhook-2");
    expect(onDelete).toHaveBeenCalledWith("webhook-2");
    expect(screen.getAllByTestId("send-icon")).toHaveLength(2);
    expect(screen.getAllByTestId("trash-icon")).toHaveLength(2);
  });
});