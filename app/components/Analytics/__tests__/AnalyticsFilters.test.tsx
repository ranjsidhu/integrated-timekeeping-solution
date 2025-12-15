import { fireEvent, render, screen, waitFor } from "@testing-library/react";

// Mock the actions and utilities before importing the component
jest.mock("@/app/actions", () => ({
  getProtectedExportData: jest.fn(),
}));

jest.mock("@/utils/export/exportToCsv", () => ({
  exportToCSV: jest.fn(),
}));

import { getProtectedExportData } from "@/app/actions";
import type {
  ExportDataType,
  ForecastActualsExportRow,
  ProjectExportRow,
  TeamExportRow,
} from "@/types/analytics.types";
import { exportToCSV } from "@/utils/export/exportToCsv";
import AnalyticsFilters from "../AnalyticsFilters";

const mockGetProtectedExportData =
  getProtectedExportData as jest.MockedFunction<typeof getProtectedExportData>;
const mockExportToCSV = exportToCSV as jest.MockedFunction<typeof exportToCSV>;

describe("AnalyticsFilters", () => {
  const mockOnWeeksChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(window, "alert").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("Rendering", () => {
    it("renders all filter elements correctly", () => {
      render(
        <AnalyticsFilters weeksToShow={4} onWeeksChange={mockOnWeeksChange} />,
      );

      expect(screen.getByText("Filters")).toBeInTheDocument();
      expect(
        screen.getByText("Customize your analytics view"),
      ).toBeInTheDocument();
      expect(screen.getByText("Time Period")).toBeInTheDocument();
      expect(screen.getByText("Export Data:")).toBeInTheDocument();
    });

    it("renders all week options in the dropdown", () => {
      render(
        <AnalyticsFilters weeksToShow={4} onWeeksChange={mockOnWeeksChange} />,
      );

      expect(screen.getByText("Next 4 Weeks")).toBeInTheDocument();
      expect(screen.getByText("Next 8 Weeks")).toBeInTheDocument();
      expect(screen.getByText("Next 12 Weeks")).toBeInTheDocument();
      expect(screen.getByText("Next Quarter (16 Weeks)")).toBeInTheDocument();
      expect(screen.getByText("Next 6 Months (26 Weeks)")).toBeInTheDocument();
    });

    it("renders all export buttons", () => {
      render(
        <AnalyticsFilters weeksToShow={4} onWeeksChange={mockOnWeeksChange} />,
      );

      expect(screen.getByTestId("export-button-team")).toBeInTheDocument();
      expect(screen.getByTestId("export-button-projects")).toBeInTheDocument();
      expect(
        screen.getByTestId("export-button-forecast-actuals"),
      ).toBeInTheDocument();
    });

    it("displays the correct selected week value", () => {
      render(
        <AnalyticsFilters weeksToShow={12} onWeeksChange={mockOnWeeksChange} />,
      );

      const select = screen.getByTestId("weeks-select") as HTMLSelectElement;
      expect(select.value).toBe("12");
    });
  });

  describe("Week Selection", () => {
    it("calls onWeeksChange when a different week option is selected", () => {
      render(
        <AnalyticsFilters weeksToShow={4} onWeeksChange={mockOnWeeksChange} />,
      );

      const select = screen.getByTestId("weeks-select");
      fireEvent.change(select, { target: { value: "8" } });

      expect(mockOnWeeksChange).toHaveBeenCalledWith(8);
      expect(mockOnWeeksChange).toHaveBeenCalledTimes(1);
    });

    it("calls onWeeksChange with correct value for all week options", () => {
      render(
        <AnalyticsFilters weeksToShow={4} onWeeksChange={mockOnWeeksChange} />,
      );

      const select = screen.getByTestId("weeks-select");
      const weekValues = [4, 8, 12, 16, 26];

      weekValues.forEach((value) => {
        fireEvent.change(select, { target: { value: value.toString() } });
        expect(mockOnWeeksChange).toHaveBeenCalledWith(value);
      });

      expect(mockOnWeeksChange).toHaveBeenCalledTimes(weekValues.length);
    });
  });

  describe("Export Functionality", () => {
    it("exports team capacity data successfully", async () => {
      const mockData: TeamExportRow[] = [
        { name: "John", email: "john@example.com", "Week 1": 40 },
        { name: "Jane", email: "jane@example.com", "Week 1": 35 },
      ];
      mockGetProtectedExportData.mockResolvedValue(mockData);

      render(
        <AnalyticsFilters weeksToShow={4} onWeeksChange={mockOnWeeksChange} />,
      );

      const teamButton = screen.getByTestId("export-button-team");
      fireEvent.click(teamButton);

      await waitFor(() => {
        expect(mockGetProtectedExportData).toHaveBeenCalledWith("team", 4);
        expect(mockExportToCSV).toHaveBeenCalledWith(mockData, "team_capacity");
      });
    });

    it("exports project analytics data successfully", async () => {
      const mockData: ProjectExportRow[] = [
        {
          projectName: "Project A",
          teamSize: 5,
          forecastHours: 100,
          actualHours: 95,
          variance: -5,
          billableHours: 90,
          nonBillableHours: 5,
          utilizationRate: 95,
        },
      ];
      mockGetProtectedExportData.mockResolvedValue(mockData);

      render(
        <AnalyticsFilters weeksToShow={8} onWeeksChange={mockOnWeeksChange} />,
      );

      const projectsButton = screen.getByTestId("export-button-projects");
      fireEvent.click(projectsButton);

      await waitFor(() => {
        expect(mockGetProtectedExportData).toHaveBeenCalledWith("projects", 8);
        expect(mockExportToCSV).toHaveBeenCalledWith(
          mockData,
          "project_analytics",
        );
      });
    });

    it("exports forecast vs actuals data successfully", async () => {
      const mockData: ForecastActualsExportRow[] = [
        {
          week: "Week 1",
          weekEnding: "2025-12-20",
          forecastHours: 100,
          actualHours: 95,
          variance: -5,
        },
      ];
      mockGetProtectedExportData.mockResolvedValue(mockData);

      render(
        <AnalyticsFilters weeksToShow={12} onWeeksChange={mockOnWeeksChange} />,
      );

      const forecastButton = screen.getByTestId(
        "export-button-forecast-actuals",
      );
      fireEvent.click(forecastButton);

      await waitFor(() => {
        expect(mockGetProtectedExportData).toHaveBeenCalledWith(
          "forecast-actuals",
          12,
        );
        expect(mockExportToCSV).toHaveBeenCalledWith(
          mockData,
          "forecast_vs_actuals",
        );
      });
    });

    it("displays alert when no data is available to export", async () => {
      mockGetProtectedExportData.mockResolvedValue([]);

      render(
        <AnalyticsFilters weeksToShow={4} onWeeksChange={mockOnWeeksChange} />,
      );

      const teamButton = screen.getByTestId("export-button-team");
      fireEvent.click(teamButton);

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith(
          "No data available to export",
        );
      });

      expect(mockExportToCSV).not.toHaveBeenCalled();
    });

    it("displays alert and logs error when export fails", async () => {
      const error = new Error("Export failed");
      mockGetProtectedExportData.mockRejectedValue(error);

      render(
        <AnalyticsFilters weeksToShow={4} onWeeksChange={mockOnWeeksChange} />,
      );

      const teamButton = screen.getByTestId("export-button-team");
      fireEvent.click(teamButton);

      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith(
          "Error exporting data:",
          error,
        );
        expect(window.alert).toHaveBeenCalledWith(
          "Failed to export data. You may not have permission.",
        );
      });

      expect(mockExportToCSV).not.toHaveBeenCalled();
    });

    it("disables export buttons while exporting", async () => {
      let resolveExport: (value: TeamExportRow[]) => void = () => {};
      const exportPromise = new Promise<TeamExportRow[]>((resolve) => {
        resolveExport = resolve;
      });
      mockGetProtectedExportData.mockReturnValue(exportPromise);

      render(
        <AnalyticsFilters weeksToShow={4} onWeeksChange={mockOnWeeksChange} />,
      );

      const teamButton = screen.getByTestId(
        "export-button-team",
      ) as HTMLButtonElement;
      const projectsButton = screen.getByTestId(
        "export-button-projects",
      ) as HTMLButtonElement;
      const forecastButton = screen.getByTestId(
        "export-button-forecast-actuals",
      ) as HTMLButtonElement;

      expect(teamButton.disabled).toBe(false);
      expect(projectsButton.disabled).toBe(false);
      expect(forecastButton.disabled).toBe(false);

      fireEvent.click(teamButton);

      await waitFor(() => {
        expect(teamButton.disabled).toBe(true);
        expect(projectsButton.disabled).toBe(true);
        expect(forecastButton.disabled).toBe(true);
      });

      resolveExport([{ name: "Test", email: "test@example.com" }]);

      await waitFor(() => {
        expect(teamButton.disabled).toBe(false);
        expect(projectsButton.disabled).toBe(false);
        expect(forecastButton.disabled).toBe(false);
      });
    });

    it("re-enables buttons after export fails", async () => {
      mockGetProtectedExportData.mockRejectedValue(new Error("Failed"));

      render(
        <AnalyticsFilters weeksToShow={4} onWeeksChange={mockOnWeeksChange} />,
      );

      const teamButton = screen.getByTestId(
        "export-button-team",
      ) as HTMLButtonElement;

      fireEvent.click(teamButton);

      await waitFor(() => {
        expect(teamButton.disabled).toBe(false);
      });
    });

    it("uses correct filename for each export type", async () => {
      const mockData: TeamExportRow[] = [
        { name: "Test", email: "test@example.com" },
      ];
      mockGetProtectedExportData.mockResolvedValue(mockData);

      const exportTypes: Array<{
        testId: string;
        type: ExportDataType;
        filename: string;
      }> = [
        {
          testId: "export-button-team",
          type: "team",
          filename: "team_capacity",
        },
        {
          testId: "export-button-projects",
          type: "projects",
          filename: "project_analytics",
        },
        {
          testId: "export-button-forecast-actuals",
          type: "forecast-actuals",
          filename: "forecast_vs_actuals",
        },
      ];

      for (const { testId, type, filename } of exportTypes) {
        const { unmount } = render(
          <AnalyticsFilters
            weeksToShow={4}
            onWeeksChange={mockOnWeeksChange}
          />,
        );

        const button = screen.getByTestId(testId);
        fireEvent.click(button);

        await waitFor(() => {
          expect(mockGetProtectedExportData).toHaveBeenCalledWith(type, 4);
          expect(mockExportToCSV).toHaveBeenCalledWith(mockData, filename);
        });

        unmount();
        jest.clearAllMocks();
      }
    });
  });
});
