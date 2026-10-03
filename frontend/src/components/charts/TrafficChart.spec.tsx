import { render, screen } from "@testing-library/react";

import TrafficChart from "./TrafficChart";

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
    Area: createComponent("Area"),
    AreaChart: createComponent("AreaChart"),
    CartesianGrid: createComponent("CartesianGrid"),
    ResponsiveContainer: createComponent("ResponsiveContainer"),
    Tooltip: createComponent("Tooltip"),
    XAxis: createComponent("XAxis"),
    YAxis: createComponent("YAxis"),
  };
});

describe("TrafficChart", () => {
  it("passes the traffic series into recharts", () => {
    const data = [
      { requests: 20, time: "10:00" },
      { requests: 35, time: "10:05" },
    ];

    render(<TrafficChart data={data} />);

    expect(screen.getByRole("heading", { name: "Traffic" })).toBeInTheDocument();
    expect(JSON.parse(screen.getByTestId("AreaChart").getAttribute("data-props") ?? "{}") as object).toEqual(
      { data },
    );
    expect(JSON.parse(screen.getByTestId("XAxis").getAttribute("data-props") ?? "{}") as object).toEqual(
      { dataKey: "time" },
    );
    expect(JSON.parse(screen.getByTestId("Area").getAttribute("data-props") ?? "{}") as object).toEqual(
      { dataKey: "requests" },
    );
  });
});