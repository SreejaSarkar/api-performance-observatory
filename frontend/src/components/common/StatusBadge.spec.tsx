import { render, screen } from "@testing-library/react";

import StatusBadge from "./StatusBadge";

describe("StatusBadge", () => {
  it("renders the status label and mapped dot color", () => {
    const { container } = render(<StatusBadge status="CRITICAL" />);

    expect(screen.getByText("CRITICAL")).toBeInTheDocument();
    expect(container.querySelector(".bg-red-500")).toBeInTheDocument();
  });

  it("renders the resolved status with the healthy color mapping", () => {
    const { container } = render(<StatusBadge status="RESOLVED" />);

    expect(screen.getByText("RESOLVED")).toBeInTheDocument();
    expect(container.querySelector(".bg-emerald-500")).toBeInTheDocument();
  });
});