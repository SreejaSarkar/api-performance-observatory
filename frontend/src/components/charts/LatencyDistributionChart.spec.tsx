import { render, screen } from "@testing-library/react";

import LatencyDistributionChart from "./LatencyDistributionChart";

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
    Bar: createComponent("Bar"),
    BarChart: createComponent("BarChart"),
    CartesianGrid: createComponent("CartesianGrid"),
    ResponsiveContainer: createComponent("ResponsiveContainer"),
    Tooltip: createComponent("Tooltip"),
    XAxis: createComponent("XAxis"),
    YAxis: createComponent("YAxis"),
  };
});

describe("LatencyDistributionChart", () => {
  it("maps the distribution object into chart data", () => {
    render(
      <LatencyDistributionChart
        distribution={{
          "0-100ms": 5,
          "100-250ms": 3,
        }}
      />,
    );

    expect(screen.getByRole("heading", { name: "Latency Distribution" })).toBeInTheDocument();

    expect(JSON.parse(screen.getByTestId("BarChart").getAttribute("data-props") ?? "{}") as object).toEqual({
      data: [
        { count: 5, range: "0-100ms" },
        { count: 3, range: "100-250ms" },
      ],
    });
    expect(JSON.parse(screen.getByTestId("XAxis").getAttribute("data-props") ?? "{}") as object).toEqual(
      { dataKey: "range" },
    );
    expect(JSON.parse(screen.getByTestId("Bar").getAttribute("data-props") ?? "{}") as object).toEqual(
      { dataKey: "count" },
    );
  });
});
