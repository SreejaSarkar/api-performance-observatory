import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import WebhookForm from "./WebhookForm";

describe("WebhookForm", () => {
  it("switches providers, submits the webhook input, and resets the form", async () => {
    const onCreate = jest.fn().mockResolvedValue(undefined);

    render(<WebhookForm onCreate={onCreate} />);

    expect(screen.getByRole("button", { name: /Microsoft Teams/i })).toBeInTheDocument();
    expect(screen.getByText("Selected")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("https://outlook.office.com/webhook/... or a Power Automate trigger URL"),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Generic webhook/i }));

    const nameInput = screen.getByPlaceholderText("Primary on-call channel") as HTMLInputElement;
    const urlInput = screen.getByPlaceholderText(
      "https://example.com/webhooks/alerts",
    ) as HTMLInputElement;

    fireEvent.change(nameInput, { target: { value: "  Ops channel  " } });
    fireEvent.change(urlInput, { target: { value: "https://example.com/hooks/ops" } });
    fireEvent.click(screen.getByRole("button", { name: "Save destination" }));

    await waitFor(() => {
      expect(onCreate).toHaveBeenCalledWith({
        name: "Ops channel",
        provider: "GENERIC",
        url: "https://example.com/hooks/ops",
      });
    });

    await waitFor(() => {
      expect(nameInput.value).toBe("");
      expect(urlInput.value).toBe("");
    });
    expect(screen.getByRole("button", { name: /Microsoft Teams/i })).toBeInTheDocument();
  });

  it("does not submit when the URL is empty", async () => {
    const onCreate = jest.fn().mockResolvedValue(undefined);

    render(<WebhookForm onCreate={onCreate} />);

    fireEvent.change(screen.getByPlaceholderText("Primary on-call channel"), {
      target: { value: "Primary channel" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save destination" }));

    await waitFor(() => {
      expect(onCreate).not.toHaveBeenCalled();
    });
  });
});
