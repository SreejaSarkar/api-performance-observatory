import { fireEvent, render, screen } from "@testing-library/react";

import TimeRangeSelector from "./TimeRangeSelector";

describe("TimeRangeSelector", () => {
  it("renders all supported ranges and highlights the selected value", () => {
    render(<TimeRangeSelector value={72} onChange={jest.fn()} />);

    expect(screen.getByRole("button", { name: "24h" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "72h" })).toHaveClass("bg-blue-600");
    expect(screen.getByRole("button", { name: "7d" })).toBeInTheDocument();
  });

  it("calls onChange with the selected range", () => {
    const onChange = jest.fn();

    render(<TimeRangeSelector value={24} onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: "7d" }));

    expect(onChange).toHaveBeenCalledWith(168);
  });
});