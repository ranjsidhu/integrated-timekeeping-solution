/** biome-ignore-all lint/suspicious/noExplicitAny: Unit tests */
import { render, screen } from "@testing-library/react";

// Mock chart.js and react-chartjs-2
jest.mock("chart.js", () => ({
  Chart: {
    register: jest.fn(),
  },
  CategoryScale: jest.fn(),
  LinearScale: jest.fn(),
  PointElement: jest.fn(),
  LineElement: jest.fn(),
  Title: jest.fn(),
  Tooltip: jest.fn(),
  Legend: jest.fn(),
  Filler: jest.fn(),
}));

jest.mock("react-chartjs-2", () => ({
  Line: jest.fn(() => <div data-testid="line-chart-mock" />),
}));

import { Line } from "react-chartjs-2";
import type { UtilizationTrendChartProps } from "@/types/analytics.types";
import UtilizationTrendChart from "../UtilizationTrendChart";

const mockLine = Line as jest.MockedFunction<typeof Line>;

describe("UtilizationTrendChart", () => {
  const mockWeekEndings = [
    { id: 1, week_ending: new Date("2025-12-06"), label: "Week 1" },
    { id: 2, week_ending: new Date("2025-12-13"), label: "Week 2" },
    { id: 3, week_ending: new Date("2025-12-20"), label: "Week 3" },
  ];

  const mockTeamMembers = [
    {
      id: 1,
      name: "John Doe",
      weeklyHours: { 1: 40, 2: 35, 3: 38 },
    },
    {
      id: 2,
      name: "Jane Smith",
      weeklyHours: { 1: 30, 2: 28, 3: 32 },
    },
    {
      id: 3,
      name: "Bob Johnson",
      weeklyHours: { 1: 20, 2: 18, 3: 22 },
    },
  ];

  const defaultProps: UtilizationTrendChartProps = {
    teamMembers: mockTeamMembers,
    weekEndings: mockWeekEndings,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders chart title and description", () => {
      render(<UtilizationTrendChart {...defaultProps} />);

      expect(screen.getByText("Utilization Trend")).toBeInTheDocument();
      expect(
        screen.getByText(/Team-wide utilization over the next 3 weeks/),
      ).toBeInTheDocument();
    });

    it("renders chart container", () => {
      render(<UtilizationTrendChart {...defaultProps} />);

      expect(screen.getByTestId("chart-container")).toBeInTheDocument();
    });

    it("renders Line chart component", () => {
      render(<UtilizationTrendChart {...defaultProps} />);

      expect(screen.getByTestId("line-chart-mock")).toBeInTheDocument();
      expect(mockLine).toHaveBeenCalled();
    });
  });

  describe("Chart Data", () => {
    it("passes correct data structure to Line chart", () => {
      render(<UtilizationTrendChart {...defaultProps} />);

      expect(mockLine).toHaveBeenCalled();
      const callArgs = mockLine.mock.calls[0][0];

      expect(callArgs.data).toBeDefined();
      expect(callArgs.data.labels).toHaveLength(3);
      expect(callArgs.data.datasets).toHaveLength(3);
    });

    it("formats week labels correctly with date", () => {
      render(<UtilizationTrendChart {...defaultProps} />);

      const callArgs = mockLine.mock.calls[0][0];
      const labels = callArgs.data.labels as string[];

      expect(labels[0]).toContain("Week 1");
      expect(labels[0]).toContain("Dec 6");
      expect(labels[1]).toContain("Week 2");
      expect(labels[1]).toContain("Dec 13");
    });

    it("calculates team utilization correctly for each week", () => {
      render(<UtilizationTrendChart {...defaultProps} />);

      const callArgs = mockLine.mock.calls[0][0];
      const utilizationData = callArgs.data.datasets[0].data as number[];

      // Week 1: (40 + 30 + 20) / (3 * 40) * 100 = 90 / 120 * 100 = 75%
      expect(utilizationData[0]).toBeCloseTo(75, 1);
      // Week 2: (35 + 28 + 18) / (3 * 40) * 100 = 81 / 120 * 100 = 67.5%
      expect(utilizationData[1]).toBeCloseTo(67.5, 1);
      // Week 3: (38 + 32 + 22) / (3 * 40) * 100 = 92 / 120 * 100 = 76.67%
      expect(utilizationData[2]).toBeCloseTo(76.67, 1);
    });

    it("includes Team Utilization dataset with correct configuration", () => {
      render(<UtilizationTrendChart {...defaultProps} />);

      const callArgs = mockLine.mock.calls[0][0];
      const utilizationDataset = callArgs.data.datasets[0];

      expect(utilizationDataset.label).toBe("Team Utilization");
      expect(utilizationDataset.borderColor).toBe("#0f62fe");
      expect(utilizationDataset.backgroundColor).toBe("rgba(15, 98, 254, 0.1)");
      expect(utilizationDataset.fill).toBe(true);
      expect(utilizationDataset.tension).toBe(0.4);
    });

    it("includes Target 80% dataset with correct configuration", () => {
      render(<UtilizationTrendChart {...defaultProps} />);

      const callArgs = mockLine.mock.calls[0][0];
      const targetDataset = callArgs.data.datasets[1];

      expect(targetDataset.label).toBe("Target (80%)");
      expect(targetDataset.borderColor).toBe("#24a148");
      expect(targetDataset.borderDash).toEqual([5, 5]);
      expect(targetDataset.data).toEqual([80, 80, 80]);
    });

    it("includes Full Capacity 100% dataset with correct configuration", () => {
      render(<UtilizationTrendChart {...defaultProps} />);

      const callArgs = mockLine.mock.calls[0][0];
      const fullCapacityDataset = callArgs.data.datasets[2];

      expect(fullCapacityDataset.label).toBe("Full Capacity (100%)");
      expect(fullCapacityDataset.borderColor).toBe("#da1e28");
      expect(fullCapacityDataset.borderDash).toEqual([5, 5]);
      expect(fullCapacityDataset.data).toEqual([100, 100, 100]);
    });

    it("handles missing weekly hours for team members", () => {
      const membersWithMissingHours = [
        {
          id: 1,
          name: "Test User",
          weeklyHours: { 1: 40 }, // Missing weeks 2 and 3
        },
      ];

      render(
        <UtilizationTrendChart
          teamMembers={membersWithMissingHours}
          weekEndings={mockWeekEndings}
        />,
      );

      const callArgs = mockLine.mock.calls[0][0];
      const utilizationData = callArgs.data.datasets[0].data as number[];

      // Week 1: 40 / 40 * 100 = 100%
      expect(utilizationData[0]).toBe(100);
      // Week 2: 0 / 40 * 100 = 0%
      expect(utilizationData[1]).toBe(0);
      // Week 3: 0 / 40 * 100 = 0%
      expect(utilizationData[2]).toBe(0);
    });

    it("handles zero team members correctly", () => {
      render(
        <UtilizationTrendChart
          teamMembers={[]}
          weekEndings={mockWeekEndings}
        />,
      );

      const callArgs = mockLine.mock.calls[0][0];
      const utilizationData = callArgs.data.datasets[0].data as number[];

      // Should be 0% when there are no team members
      expect(utilizationData[0]).toBe(0);
      expect(utilizationData[1]).toBe(0);
      expect(utilizationData[2]).toBe(0);
    });
  });

  describe("Chart Options", () => {
    it("configures chart as responsive", () => {
      render(<UtilizationTrendChart {...defaultProps} />);

      const callArgs = mockLine.mock.calls[0][0];
      expect(callArgs.options?.responsive).toBe(true);
      expect(callArgs.options?.maintainAspectRatio).toBe(false);
    });

    it("configures legend correctly", () => {
      render(<UtilizationTrendChart {...defaultProps} />);

      const callArgs = mockLine.mock.calls[0][0];
      const legend = callArgs.options?.plugins?.legend;

      expect(legend?.display).toBe(true);
      expect(legend?.position).toBe("top");
      expect(legend?.labels?.usePointStyle).toBe(true);
    });

    it("configures y-axis scales", () => {
      render(<UtilizationTrendChart {...defaultProps} />);

      const callArgs = mockLine.mock.calls[0][0];
      expect(callArgs.options?.scales?.y).toBeDefined();
      expect(callArgs.options?.scales?.y?.max).toBe(120);
    });

    it("configures y-axis tick callback to format percentages", () => {
      render(<UtilizationTrendChart {...defaultProps} />);

      const callArgs = mockLine.mock.calls[0][0];
      const tickCallback = callArgs.options?.scales?.y?.ticks?.callback;

      if (tickCallback) {
        expect(tickCallback.call({} as any, 50, 0, [])).toBe("50%");
        expect(tickCallback.call({} as any, 100, 0, [])).toBe("100%");
      }
    });

    it("configures tooltip label callback to format percentages", () => {
      render(<UtilizationTrendChart {...defaultProps} />);

      const callArgs = mockLine.mock.calls[0][0];
      const labelCallback =
        callArgs.options?.plugins?.tooltip?.callbacks?.label;

      const mockContext = {
        dataset: { label: "Team Utilization" },
        parsed: { y: 75.5 },
      } as any;

      if (labelCallback) {
        expect(labelCallback.call({} as any, mockContext)).toBe(
          "Team Utilization: 75.5%",
        );
      }
    });

    it("handles null values in tooltip callback", () => {
      render(<UtilizationTrendChart {...defaultProps} />);

      const callArgs = mockLine.mock.calls[0][0];
      const labelCallback =
        callArgs.options?.plugins?.tooltip?.callbacks?.label;

      const mockContext = {
        dataset: { label: "Test" },
        parsed: { y: null },
      } as any;

      if (labelCallback) {
        const result = labelCallback.call({} as any, mockContext);
        expect(result).toBe("Test: ");
      }
    });
  });

  describe("Utilization Calculations", () => {
    it("calculates utilization for single team member", () => {
      const singleMember = [
        {
          id: 1,
          name: "Solo Worker",
          weeklyHours: { 1: 40, 2: 20, 3: 30 },
        },
      ];

      render(
        <UtilizationTrendChart
          teamMembers={singleMember}
          weekEndings={mockWeekEndings}
        />,
      );

      const callArgs = mockLine.mock.calls[0][0];
      const utilizationData = callArgs.data.datasets[0].data as number[];

      expect(utilizationData[0]).toBe(100); // 40/40 * 100
      expect(utilizationData[1]).toBe(50); // 20/40 * 100
      expect(utilizationData[2]).toBe(75); // 30/40 * 100
    });

    it("calculates utilization for over 100% hours", () => {
      const overtimeMembers = [
        {
          id: 1,
          name: "Overtime Worker",
          weeklyHours: { 1: 50, 2: 45, 3: 48 },
        },
      ];

      render(
        <UtilizationTrendChart
          teamMembers={overtimeMembers}
          weekEndings={mockWeekEndings}
        />,
      );

      const callArgs = mockLine.mock.calls[0][0];
      const utilizationData = callArgs.data.datasets[0].data as number[];

      expect(utilizationData[0]).toBe(125); // 50/40 * 100
      expect(utilizationData[1]).toBe(112.5); // 45/40 * 100
      expect(utilizationData[2]).toBe(120); // 48/40 * 100
    });

    it("handles all team members with zero hours", () => {
      const zeroHoursMembers = [
        { id: 1, name: "User 1", weeklyHours: { 1: 0, 2: 0, 3: 0 } },
        { id: 2, name: "User 2", weeklyHours: { 1: 0, 2: 0, 3: 0 } },
      ];

      render(
        <UtilizationTrendChart
          teamMembers={zeroHoursMembers}
          weekEndings={mockWeekEndings}
        />,
      );

      const callArgs = mockLine.mock.calls[0][0];
      const utilizationData = callArgs.data.datasets[0].data as number[];

      expect(utilizationData[0]).toBe(0);
      expect(utilizationData[1]).toBe(0);
      expect(utilizationData[2]).toBe(0);
    });

    it("calculates utilization with mixed hours across team", () => {
      const mixedMembers = [
        { id: 1, name: "Full Time", weeklyHours: { 1: 40 } },
        { id: 2, name: "Part Time", weeklyHours: { 1: 20 } },
        { id: 3, name: "No Hours", weeklyHours: { 1: 0 } },
      ];

      render(
        <UtilizationTrendChart
          teamMembers={mixedMembers}
          weekEndings={[mockWeekEndings[0]]}
        />,
      );

      const callArgs = mockLine.mock.calls[0][0];
      const utilizationData = callArgs.data.datasets[0].data as number[];

      // (40 + 20 + 0) / (3 * 40) * 100 = 60 / 120 * 100 = 50%
      expect(utilizationData[0]).toBe(50);
    });
  });

  describe("Edge Cases", () => {
    it("handles single week", () => {
      render(
        <UtilizationTrendChart
          teamMembers={mockTeamMembers}
          weekEndings={[mockWeekEndings[0]]}
        />,
      );

      expect(
        screen.getByText(/Team-wide utilization over the next 1 weeks/),
      ).toBeInTheDocument();

      const callArgs = mockLine.mock.calls[0][0];
      expect(callArgs.data.labels).toHaveLength(1);
      expect(callArgs.data.datasets[0].data).toHaveLength(1);
    });

    it("handles many weeks", () => {
      const manyWeeks = Array.from({ length: 12 }, (_, i) => ({
        id: i + 1,
        week_ending: new Date(2025, 11, 6 + i * 7),
        label: `Week ${i + 1}`,
      }));

      render(
        <UtilizationTrendChart
          teamMembers={mockTeamMembers}
          weekEndings={manyWeeks}
        />,
      );

      const callArgs = mockLine.mock.calls[0][0];
      expect(callArgs.data.labels).toHaveLength(12);
      expect(callArgs.data.datasets[0].data).toHaveLength(12);
      expect(callArgs.data.datasets[1].data).toHaveLength(12); // Target line
      expect(callArgs.data.datasets[2].data).toHaveLength(12); // Full capacity line
    });

    it("handles large team size", () => {
      const largeTeam = Array.from({ length: 50 }, (_, i) => ({
        id: i + 1,
        name: `Member ${i + 1}`,
        weeklyHours: { 1: 40, 2: 35, 3: 38 },
      }));

      render(
        <UtilizationTrendChart
          teamMembers={largeTeam}
          weekEndings={mockWeekEndings}
        />,
      );

      const callArgs = mockLine.mock.calls[0][0];
      const utilizationData = callArgs.data.datasets[0].data as number[];

      // Week 1: (40 * 50) / (50 * 40) * 100 = 100%
      expect(utilizationData[0]).toBe(100);
    });
  });

  describe("Props Updates", () => {
    it("recalculates when teamMembers prop changes", () => {
      const { rerender } = render(<UtilizationTrendChart {...defaultProps} />);

      const firstCallArgs = mockLine.mock.calls[0][0] as any;
      const firstUtilization = firstCallArgs.data.datasets[0].data[0];

      const newMembers = [
        { id: 1, name: "New Member", weeklyHours: { 1: 40, 2: 40, 3: 40 } },
      ];

      rerender(
        <UtilizationTrendChart
          teamMembers={newMembers}
          weekEndings={mockWeekEndings}
        />,
      );

      const secondCallArgs = mockLine.mock.calls[1][0] as any;
      const secondUtilization = secondCallArgs.data.datasets[0].data[0];

      expect(firstUtilization).not.toBe(secondUtilization);
    });

    it("updates when weekEndings prop changes", () => {
      const { rerender } = render(<UtilizationTrendChart {...defaultProps} />);

      expect(
        screen.getByText(/Team-wide utilization over the next 3 weeks/),
      ).toBeInTheDocument();

      const newWeeks = [mockWeekEndings[0], mockWeekEndings[1]];

      rerender(
        <UtilizationTrendChart
          teamMembers={mockTeamMembers}
          weekEndings={newWeeks}
        />,
      );

      expect(
        screen.getByText(/Team-wide utilization over the next 2 weeks/),
      ).toBeInTheDocument();
    });
  });
});
