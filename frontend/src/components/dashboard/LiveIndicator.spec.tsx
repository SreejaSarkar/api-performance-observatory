import { render, screen } from "@testing-library/react";

import LiveIndicator from "./LiveIndicator";

describe("LiveIndicator", () => {
  it("shows a live state when connected", () => {
    const { container } = render(<LiveIndicator connected />);

    expect(screen.getByText("Live")).toBeInTheDocument();
    expect(container.querySelector(".bg-green-400")).toBeInTheDocument();
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("shows an offline state when disconnected", () => {
    const { container } = render(<LiveIndicator connected={false} />);

    expect(screen.getByText("Offline")).toBeInTheDocument();
    expect(container.querySelector(".bg-slate-500")).toBeInTheDocument();
  });
});
