import { render, screen } from "@testing-library/react";

import LatencyTrendChart from "./LatencyTrendChart";

jest.mock("recharts", () => {
  const React = require("react") as typeof import("react");

  const createComponent = (name: string) => {
    const Component = ({
      children,
      ...props
    }: {
      children?: React.ReactNode;
      [key: string]: unknown;
    }) => (
      <div data-props={JSON.stringify(props)} data-testid={name}>
        {children}
      </div>
    );

    Component.displayName = name;
    return Component;
  };

  return {
    __esModule: true,
    CartesianGrid: createComponent("CartesianGrid"),
    Line: createComponent("Line"),
    LineChart: createComponent("LineChart"),
    ResponsiveContainer: createComponent("ResponsiveContainer"),
    Tooltip: createComponent("Tooltip"),
    XAxis: createComponent("XAxis"),
    YAxis: createComponent("YAxis"),
  };
});

describe("LatencyTrendChart", () => {
  it("passes the latency series into recharts", () => {
    const data = [
      { latency: 120, time: "10:00" },
      { latency: 140, time: "10:05" },
    ];

    render(<LatencyTrendChart data={data} />);

    expect(screen.getByRole("heading", { name: "Latency Trend" })).toBeInTheDocument();
    expect(JSON.parse(screen.getByTestId("LineChart").getAttribute("data-props") ?? "{}") as object).toEqual(
      { data },
    );
    expect(JSON.parse(screen.getByTestId("XAxis").getAttribute("data-props") ?? "{}") as object).toEqual(
      { dataKey: "time" },
    );
    expect(JSON.parse(screen.getByTestId("Line").getAttribute("data-props") ?? "{}") as object).toEqual(
      { dataKey: "latency", type: "monotone" },
    );
  });
});
