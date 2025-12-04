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
    const forecastEntries = [
      {
        project_id: 1,
        hours_per_week: 5,
        weekly_hours: { 1: 5, 2: 5, 3: 5 },
      } as any,
      {
        project_id: 2,
        hours_per_week: 10,
        weekly_hours: { 1: 10, 2: 10, 3: 10 },
      } as any,
    ];

    render(<ForecastSummary forecastEntries={forecastEntries} />);

    // totalHours = (5 + 5 + 5) + (10 + 10 + 10) = 45
    expect(screen.getByText(/45h/)).toBeInTheDocument();
    // active projects = 2
    expect(screen.getByText("2")).toBeInTheDocument();

    // icons rendered
    expect(screen.getByTestId("icon-time")).toBeInTheDocument();
    expect(screen.getByTestId("icon-chartline")).toBeInTheDocument();
  });

  it("counts active projects correctly when same project appears multiple times", () => {
    const forecastEntries = [
      { project_id: 1, hours_per_week: 8, weekly_hours: { 1: 8, 2: 8 } } as any,
      { project_id: 1, hours_per_week: 8, weekly_hours: { 1: 8, 2: 8 } } as any,
    ];

    render(<ForecastSummary forecastEntries={forecastEntries} />);

    // totalHours = (8 + 8) + (8 + 8) = 32
    expect(screen.getByText(/32h/)).toBeInTheDocument();
    // active projects = 1
    expect(screen.getByText("1")).toBeInTheDocument();
  });
});
