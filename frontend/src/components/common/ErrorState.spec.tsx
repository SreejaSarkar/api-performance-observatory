import { fireEvent, render, screen } from "@testing-library/react";

import ErrorState from "./ErrorState";

describe("ErrorState", () => {
  it("renders the default title and no retry button without a handler", () => {
    render(<ErrorState message="The dashboard failed to load." />);

    expect(screen.getByRole("heading", { name: "Something went wrong" })).toBeInTheDocument();
    expect(screen.getByText("The dashboard failed to load.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Try Again" })).not.toBeInTheDocument();
  });

  it("renders a retry button when a retry handler is provided", () => {
    const onRetry = jest.fn();

    render(
      <ErrorState
        title="Unable to fetch alerts"
        message="Please try again in a moment."
        onRetry={onRetry}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Try Again" }));

    expect(screen.getByRole("heading", { name: "Unable to fetch alerts" })).toBeInTheDocument();
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
