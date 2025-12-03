/** biome-ignore-all lint/suspicious/noExplicitAny: Unit tests */
import { render, screen } from "@testing-library/react";

// Mock carbon icons to avoid ESM parsing issues
jest.mock("@carbon/icons-react", () => ({
  ChartLine: () => <span data-testid="icon-chartline" />,
  Time: () => <span data-testid="icon-time" />,
}));

import ForecastSummary from "../ForecastSummary";

describe("ForecastSummary", () => {
  it("calculates total hours and active projects correctly (distinct projects)", () => {
    const weekEndings = [
      { id: 1, label: "A", week_ending: new Date(), status: "" },
      { id: 2, label: "B", week_ending: new Date(), status: "" },
      { id: 3, label: "C", week_ending: new Date(), status: "" },
    ];

    const forecastEntries = [
      { project_id: 1, hours_per_week: 5 } as any,
      { project_id: 2, hours_per_week: 10 } as any,
    ];

    render(
      <ForecastSummary
        forecastEntries={forecastEntries}
        weekEndings={weekEndings}
      />,
    );

    // totalHours = (5 + 10) * 3 = 45
    expect(screen.getByText("45h")).toBeInTheDocument();
    // active projects = 2
    expect(screen.getByText("2")).toBeInTheDocument();

    // icons rendered
    expect(screen.getByTestId("icon-time")).toBeInTheDocument();
    expect(screen.getByTestId("icon-chartline")).toBeInTheDocument();
  });

  it("counts active projects correctly when same project appears multiple times", () => {
    const weekEndings = [
      { id: 1, label: "A", week_ending: new Date(), status: "" },
    ];

    const forecastEntries = [
      { project_id: 1, hours_per_week: 8 } as any,
      { project_id: 1, hours_per_week: 8 } as any,
    ];

    render(
      <ForecastSummary
        forecastEntries={forecastEntries}
        weekEndings={weekEndings}
      />,
    );

    // totalHours = (8 + 8) * 1 = 16
    expect(screen.getByText("16h")).toBeInTheDocument();
    // active projects = 1
    expect(screen.getByText("1")).toBeInTheDocument();
  });
});
