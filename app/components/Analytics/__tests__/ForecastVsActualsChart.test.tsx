/** biome-ignore-all lint/suspicious/noExplicitAny: Unit tests */
import { render, screen } from "@testing-library/react";

// Mock chart.js and react-chartjs-2
jest.mock("chart.js", () => ({
  Chart: {
    register: jest.fn(),
  },
  CategoryScale: jest.fn(),
  LinearScale: jest.fn(),
  BarElement: jest.fn(),
  Title: jest.fn(),
  Tooltip: jest.fn(),
  Legend: jest.fn(),
}));

jest.mock("react-chartjs-2", () => ({
  Bar: jest.fn(() => <div data-testid="bar-chart-mock" />),
}));

import { Bar } from "react-chartjs-2";
import type { ForecastVsActualsChartProps } from "@/types/analytics.types";
import ForecastVsActualsChart from "../ForecastVsActualsChart";

const mockBar = Bar as jest.MockedFunction<typeof Bar>;

describe("ForecastVsActualsChart", () => {
  const mockWeekEndings = [
    { id: 1, week_ending: new Date("2025-12-06"), label: "Week 1" },
    { id: 2, week_ending: new Date("2025-12-13"), label: "Week 2" },
    { id: 3, week_ending: new Date("2025-12-20"), label: "Week 3" },
  ];

  const mockForecastHours = [100, 120, 110];
  const mockActualHours = [95, 125, 108];
  const mockVariance = [-5, 5, -2];

  const defaultProps: ForecastVsActualsChartProps = {
    weekEndings: mockWeekEndings,
    forecastHours: mockForecastHours,
    actualHours: mockActualHours,
    variance: mockVariance,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders the chart title and description", () => {
      render(<ForecastVsActualsChart {...defaultProps} />);

      expect(screen.getByText("Forecast vs Actuals")).toBeInTheDocument();
      expect(
        screen.getByText("Comparison of forecasted vs actual hours worked"),
      ).toBeInTheDocument();
    });

    it("renders summary statistics section", () => {
      render(<ForecastVsActualsChart {...defaultProps} />);

      expect(screen.getByTestId("summary-stats")).toBeInTheDocument();
      expect(screen.getByTestId("total-forecast")).toBeInTheDocument();
      expect(screen.getByTestId("total-actual")).toBeInTheDocument();
      expect(screen.getByTestId("variance")).toBeInTheDocument();
      expect(screen.getByTestId("accuracy")).toBeInTheDocument();
    });

    it("renders the chart when data is provided", () => {
      render(<ForecastVsActualsChart {...defaultProps} />);

      expect(screen.getByTestId("chart-container")).toBeInTheDocument();
      expect(screen.getByTestId("bar-chart-mock")).toBeInTheDocument();
    });

    it("renders empty state when no week endings provided", () => {
      render(
        <ForecastVsActualsChart
          weekEndings={[]}
          forecastHours={[]}
          actualHours={[]}
          variance={[]}
        />,
      );

      expect(screen.getByTestId("empty-state")).toBeInTheDocument();
      expect(
        screen.getByText(
          "No historical data available. Submit timesheets to see comparisons.",
        ),
      ).toBeInTheDocument();
    });

    it("does not render empty state when data exists", () => {
      render(<ForecastVsActualsChart {...defaultProps} />);

      expect(screen.queryByTestId("empty-state")).not.toBeInTheDocument();
    });
  });

  describe("Summary Statistics Calculations", () => {
    it("calculates and displays total forecast hours correctly", () => {
      render(<ForecastVsActualsChart {...defaultProps} />);

      const totalForecast = mockForecastHours.reduce((sum, h) => sum + h, 0);
      expect(screen.getByText(`${totalForecast}h`)).toBeInTheDocument();
    });

    it("calculates and displays total actual hours correctly", () => {
      render(<ForecastVsActualsChart {...defaultProps} />);

      const totalActual = mockActualHours.reduce((sum, h) => sum + h, 0);
      expect(screen.getByText(`${totalActual}h`)).toBeInTheDocument();
    });

    it("calculates and displays positive variance correctly", () => {
      const props: ForecastVsActualsChartProps = {
        weekEndings: mockWeekEndings,
        forecastHours: [100, 100, 100],
        actualHours: [110, 120, 115],
        variance: [10, 20, 15],
      };
      render(<ForecastVsActualsChart {...props} />);

      const totalVariance = 110 + 120 + 115 - (100 + 100 + 100);
      expect(screen.getByText(`+${totalVariance}h`)).toBeInTheDocument();
    });

    it("calculates and displays negative variance correctly", () => {
      const props: ForecastVsActualsChartProps = {
        weekEndings: mockWeekEndings,
        forecastHours: [100, 100, 100],
        actualHours: [90, 85, 88],
        variance: [-10, -15, -12],
      };
      render(<ForecastVsActualsChart {...props} />);

      const totalVariance = 90 + 85 + 88 - (100 + 100 + 100);
      expect(screen.getByText(`${totalVariance}h`)).toBeInTheDocument();
    });

    it("calculates accuracy correctly for perfect match", () => {
      const props: ForecastVsActualsChartProps = {
        weekEndings: mockWeekEndings,
        forecastHours: [100, 100, 100],
        actualHours: [100, 100, 100],
        variance: [0, 0, 0],
      };
      render(<ForecastVsActualsChart {...props} />);

      expect(screen.getByText("100.0%")).toBeInTheDocument();
    });

    it("calculates accuracy correctly with variance", () => {
      render(<ForecastVsActualsChart {...defaultProps} />);

      const totalForecast = 330;
      const totalActual = 328;
      const totalVariance = totalActual - totalForecast;
      const accuracy = 100 - Math.abs((totalVariance / totalForecast) * 100);

      expect(screen.getByText(`${accuracy.toFixed(1)}%`)).toBeInTheDocument();
    });

    it("handles zero forecast hours without division by zero", () => {
      const props: ForecastVsActualsChartProps = {
        weekEndings: mockWeekEndings,
        forecastHours: [0, 0, 0],
        actualHours: [0, 0, 0],
        variance: [0, 0, 0],
      };
      render(<ForecastVsActualsChart {...props} />);

      expect(screen.getByText("100.0%")).toBeInTheDocument();
    });
  });

  describe("Chart Data", () => {
    it("passes correct data structure to Bar chart", () => {
      render(<ForecastVsActualsChart {...defaultProps} />);

      expect(mockBar).toHaveBeenCalled();
      const callArgs = mockBar.mock.calls[0][0];

      expect(callArgs.data).toBeDefined();
      expect(callArgs.data.labels).toHaveLength(3);
      expect(callArgs.data.datasets).toHaveLength(2);
    });

    it("formats week labels correctly with date", () => {
      render(<ForecastVsActualsChart {...defaultProps} />);

      const callArgs = mockBar.mock.calls[0][0];
      const labels = callArgs.data.labels as string[];

      expect(labels[0]).toContain("Week 1");
      expect(labels[0]).toContain("Dec");
    });

    it("includes forecast dataset with correct configuration", () => {
      render(<ForecastVsActualsChart {...defaultProps} />);

      const callArgs = mockBar.mock.calls[0][0];
      const forecastDataset = callArgs.data.datasets[0];

      expect(forecastDataset.label).toBe("Forecast");
      expect(forecastDataset.data).toEqual(mockForecastHours);
      expect(forecastDataset.backgroundColor).toBe("rgba(15, 98, 254, 0.8)");
      expect(forecastDataset.borderColor).toBe("#0f62fe");
    });

    it("includes actual dataset with correct configuration", () => {
      render(<ForecastVsActualsChart {...defaultProps} />);

      const callArgs = mockBar.mock.calls[0][0];
      const actualDataset = callArgs.data.datasets[1];

      expect(actualDataset.label).toBe("Actual");
      expect(actualDataset.data).toEqual(mockActualHours);
      expect(actualDataset.backgroundColor).toBe("rgba(36, 161, 72, 0.8)");
      expect(actualDataset.borderColor).toBe("#24a148");
    });
  });

  describe("Chart Options", () => {
    it("configures chart as responsive", () => {
      render(<ForecastVsActualsChart {...defaultProps} />);

      const callArgs = mockBar.mock.calls[0][0];
      expect(callArgs.options?.responsive).toBe(true);
      expect(callArgs.options?.maintainAspectRatio).toBe(false);
    });

    it("configures legend correctly", () => {
      render(<ForecastVsActualsChart {...defaultProps} />);

      const callArgs = mockBar.mock.calls[0][0];
      const legend = callArgs.options?.plugins?.legend;

      expect(legend?.display).toBe(true);
      expect(legend?.position).toBe("top");
      expect(legend?.labels?.usePointStyle).toBe(true);
    });

    it("configures y-axis scales", () => {
      render(<ForecastVsActualsChart {...defaultProps} />);

      const callArgs = mockBar.mock.calls[0][0];
      expect(callArgs.options?.scales?.y).toBeDefined();
    });

    it("configures y-axis tick callback to format hours", () => {
      render(<ForecastVsActualsChart {...defaultProps} />);

      const callArgs = mockBar.mock.calls[0][0];
      const tickCallback = callArgs.options?.scales?.y?.ticks?.callback;

      if (tickCallback) {
        expect(tickCallback.call({} as any, 100, 0, [])).toBe("100h");
        expect(tickCallback.call({} as any, "50", 0, [])).toBe("50h");
      }
    });

    it("configures tooltip label callback to format hours", () => {
      render(<ForecastVsActualsChart {...defaultProps} />);

      const callArgs = mockBar.mock.calls[0][0];
      const labelCallback =
        callArgs.options?.plugins?.tooltip?.callbacks?.label;

      const mockContext = {
        dataset: { label: "Forecast" },
        parsed: { y: 100 },
      } as any;

      if (labelCallback) {
        expect(labelCallback.call({} as any, mockContext)).toBe(
          "Forecast: 100h",
        );
      }
    });

    it("configures tooltip afterBody to show variance for forecast dataset", () => {
      render(<ForecastVsActualsChart {...defaultProps} />);

      const callArgs = mockBar.mock.calls[0][0];
      const afterBodyCallback =
        callArgs.options?.plugins?.tooltip?.callbacks?.afterBody;

      const mockContext = [
        {
          datasetIndex: 0,
          dataIndex: 0,
        },
      ] as any;

      if (afterBodyCallback) {
        expect(afterBodyCallback.call({} as any, mockContext)).toBe(
          "Variance: -5h",
        );
      }
    });

    it("configures tooltip afterBody to show positive variance with plus sign", () => {
      render(<ForecastVsActualsChart {...defaultProps} />);

      const callArgs = mockBar.mock.calls[0][0];
      const afterBodyCallback =
        callArgs.options?.plugins?.tooltip?.callbacks?.afterBody;

      const mockContext = [
        {
          datasetIndex: 0,
          dataIndex: 1,
        },
      ] as any;

      if (afterBodyCallback) {
        expect(afterBodyCallback.call({} as any, mockContext)).toBe(
          "Variance: +5h",
        );
      }
    });

    it("configures tooltip afterBody to return empty string for actual dataset", () => {
      render(<ForecastVsActualsChart {...defaultProps} />);

      const callArgs = mockBar.mock.calls[0][0];
      const afterBodyCallback =
        callArgs.options?.plugins?.tooltip?.callbacks?.afterBody;

      const mockContext = [
        {
          datasetIndex: 1,
          dataIndex: 0,
        },
      ] as any;

      if (afterBodyCallback) {
        expect(afterBodyCallback.call({} as any, mockContext)).toBe("");
      }
    });
  });

  describe("CSS Classes and Styling", () => {
    it("applies positive variance color class when variance is positive", () => {
      const props: ForecastVsActualsChartProps = {
        weekEndings: mockWeekEndings,
        forecastHours: [100, 100, 100],
        actualHours: [110, 110, 110],
        variance: [10, 10, 10],
      };
      const { container } = render(<ForecastVsActualsChart {...props} />);

      const varianceElement = container.querySelector(
        '[data-testid="variance"] .text-2xl',
      );
      expect(varianceElement?.className).toContain("text-[#24a148]");
    });

    it("applies negative variance color class when variance is negative", () => {
      const props: ForecastVsActualsChartProps = {
        weekEndings: mockWeekEndings,
        forecastHours: [100, 100, 100],
        actualHours: [90, 90, 90],
        variance: [-10, -10, -10],
      };
      const { container } = render(<ForecastVsActualsChart {...props} />);

      const varianceElement = container.querySelector(
        '[data-testid="variance"] .text-2xl',
      );
      expect(varianceElement?.className).toContain("text-[#da1e28]");
    });
  });

  describe("Edge Cases", () => {
    it("handles single week of data", () => {
      const props: ForecastVsActualsChartProps = {
        weekEndings: [mockWeekEndings[0]],
        forecastHours: [100],
        actualHours: [95],
        variance: [-5],
      };
      render(<ForecastVsActualsChart {...props} />);

      expect(screen.getByText("100h")).toBeInTheDocument();
      expect(screen.getByText("95h")).toBeInTheDocument();
      expect(screen.getByText("-5h")).toBeInTheDocument();
    });

    it("handles large variance values", () => {
      const props: ForecastVsActualsChartProps = {
        weekEndings: mockWeekEndings,
        forecastHours: [1000, 2000, 1500],
        actualHours: [1200, 1800, 1600],
        variance: [200, -200, 100],
      };
      render(<ForecastVsActualsChart {...props} />);

      expect(screen.getByText("4500h")).toBeInTheDocument();
      expect(screen.getByText("4600h")).toBeInTheDocument();
    });

    it("recalculates when props change", () => {
      const { rerender } = render(<ForecastVsActualsChart {...defaultProps} />);

      expect(screen.getByText("330h")).toBeInTheDocument();

      const newProps: ForecastVsActualsChartProps = {
        weekEndings: mockWeekEndings,
        forecastHours: [200, 200, 200],
        actualHours: [190, 195, 200],
        variance: [-10, -5, 0],
      };

      rerender(<ForecastVsActualsChart {...newProps} />);

      expect(screen.getByText("600h")).toBeInTheDocument();
      expect(screen.getByText("585h")).toBeInTheDocument();
    });
  });
});
