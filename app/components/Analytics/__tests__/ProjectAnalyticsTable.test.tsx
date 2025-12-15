import { render, screen } from "@testing-library/react";
import type {
  ProjectAnalytics,
  ProjectAnalyticsTableProps,
} from "@/types/analytics.types";
import ProjectAnalyticsTable from "../ProjectAnalyticsTable";

describe("ProjectAnalyticsTable", () => {
  const mockProjects: ProjectAnalytics[] = [
    {
      projectId: 1,
      projectName: "Project Alpha",
      forecastHours: 100,
      actualHours: 95,
      variance: -5,
      billableHours: 90,
      nonBillableHours: 5,
      utilizationRate: 95,
      teamMemberCount: 5,
    },
    {
      projectId: 2,
      projectName: "Project Beta",
      forecastHours: 200,
      actualHours: 210,
      variance: 10,
      billableHours: 180,
      nonBillableHours: 30,
      utilizationRate: 85,
      teamMemberCount: 8,
    },
    {
      projectId: 3,
      projectName: "Project Gamma",
      forecastHours: 150,
      actualHours: 148,
      variance: -2,
      billableHours: 120,
      nonBillableHours: 28,
      utilizationRate: 75,
      teamMemberCount: 6,
    },
  ];

  const defaultProps: ProjectAnalyticsTableProps = {
    projects: mockProjects,
  };

  describe("Rendering", () => {
    it("renders table title and description", () => {
      render(<ProjectAnalyticsTable {...defaultProps} />);

      expect(screen.getByText("Project Analytics")).toBeInTheDocument();
      expect(
        screen.getByText("Resource allocation and utilization by project"),
      ).toBeInTheDocument();
    });

    it("renders table with correct headers", () => {
      render(<ProjectAnalyticsTable {...defaultProps} />);

      expect(screen.getByText("Project")).toBeInTheDocument();
      expect(screen.getByText("Team Size")).toBeInTheDocument();
      expect(screen.getByText("Forecast")).toBeInTheDocument();
      expect(screen.getByText("Actual")).toBeInTheDocument();
      expect(screen.getByText("Variance")).toBeInTheDocument();
      expect(screen.getByText("Billable")).toBeInTheDocument();
      expect(screen.getByText("Non-Billable")).toBeInTheDocument();
      expect(screen.getByText("Utilization")).toBeInTheDocument();
    });

    it("renders all projects in the table", () => {
      render(<ProjectAnalyticsTable {...defaultProps} />);

      expect(screen.getByText("Project Alpha")).toBeInTheDocument();
      expect(screen.getByText("Project Beta")).toBeInTheDocument();
      expect(screen.getByText("Project Gamma")).toBeInTheDocument();
    });

    it("renders correct number of project rows", () => {
      render(<ProjectAnalyticsTable {...defaultProps} />);

      expect(screen.getByTestId("project-row-1")).toBeInTheDocument();
      expect(screen.getByTestId("project-row-2")).toBeInTheDocument();
      expect(screen.getByTestId("project-row-3")).toBeInTheDocument();
    });

    it("renders empty state when no projects provided", () => {
      render(<ProjectAnalyticsTable projects={[]} />);

      expect(screen.getByTestId("empty-state")).toBeInTheDocument();
      expect(screen.getByText("No project data available")).toBeInTheDocument();
    });

    it("does not render empty state when projects exist", () => {
      render(<ProjectAnalyticsTable {...defaultProps} />);

      expect(screen.queryByTestId("empty-state")).not.toBeInTheDocument();
    });

    it("renders table when projects exist", () => {
      render(<ProjectAnalyticsTable {...defaultProps} />);

      expect(screen.getByTestId("projects-table")).toBeInTheDocument();
    });
  });

  describe("Project Data Display", () => {
    it("displays project name correctly", () => {
      render(<ProjectAnalyticsTable {...defaultProps} />);

      const project = mockProjects[0];
      expect(screen.getByText(project.projectName)).toBeInTheDocument();
    });

    it("displays team member count correctly", () => {
      render(<ProjectAnalyticsTable {...defaultProps} />);

      expect(screen.getByText("5")).toBeInTheDocument();
      expect(screen.getByText("8")).toBeInTheDocument();
      expect(screen.getByText("6")).toBeInTheDocument();
    });

    it("displays forecast hours with hours suffix", () => {
      render(<ProjectAnalyticsTable {...defaultProps} />);

      expect(screen.getByText("100h")).toBeInTheDocument();
      expect(screen.getByText("200h")).toBeInTheDocument();
      expect(screen.getByText("150h")).toBeInTheDocument();
    });

    it("displays actual hours with hours suffix", () => {
      render(<ProjectAnalyticsTable {...defaultProps} />);

      expect(screen.getByText("95h")).toBeInTheDocument();
      expect(screen.getByText("210h")).toBeInTheDocument();
      expect(screen.getByText("148h")).toBeInTheDocument();
    });

    it("displays billable hours with hours suffix", () => {
      render(<ProjectAnalyticsTable {...defaultProps} />);

      expect(screen.getByText("90h")).toBeInTheDocument();
      expect(screen.getByText("180h")).toBeInTheDocument();
      expect(screen.getByText("120h")).toBeInTheDocument();
    });

    it("displays non-billable hours with hours suffix", () => {
      render(<ProjectAnalyticsTable {...defaultProps} />);

      expect(screen.getByText("5h")).toBeInTheDocument();
      expect(screen.getByText("30h")).toBeInTheDocument();
      expect(screen.getByText("28h")).toBeInTheDocument();
    });

    it("displays utilization rate with percentage sign", () => {
      render(<ProjectAnalyticsTable {...defaultProps} />);

      expect(screen.getByText("95%")).toBeInTheDocument();
      expect(screen.getByText("85%")).toBeInTheDocument();
      expect(screen.getByText("75%")).toBeInTheDocument();
    });
  });

  describe("Variance Display and Colors", () => {
    it("displays negative variance without plus sign", () => {
      render(<ProjectAnalyticsTable {...defaultProps} />);

      expect(screen.getByText("-5h")).toBeInTheDocument();
      expect(screen.getByText("-2h")).toBeInTheDocument();
    });

    it("displays positive variance with plus sign", () => {
      render(<ProjectAnalyticsTable {...defaultProps} />);

      expect(screen.getByText("+10h")).toBeInTheDocument();
    });

    it("applies green color to negative variance (under forecast)", () => {
      render(<ProjectAnalyticsTable {...defaultProps} />);

      const varianceCell = screen.getByText("-5h");
      expect(varianceCell.className).toContain("text-[#24a148]");
    });

    it("applies red color to positive variance over 5 hours (over forecast)", () => {
      render(<ProjectAnalyticsTable {...defaultProps} />);

      const varianceCell = screen.getByText("+10h");
      expect(varianceCell.className).toContain("text-[#da1e28]");
    });

    it("applies neutral color to variance within 5 hours threshold", () => {
      const projects: ProjectAnalytics[] = [
        {
          projectId: 1,
          projectName: "Project Test",
          forecastHours: 100,
          actualHours: 103,
          variance: 3,
          billableHours: 100,
          nonBillableHours: 3,
          utilizationRate: 97,
          teamMemberCount: 5,
        },
      ];

      render(<ProjectAnalyticsTable projects={projects} />);

      const varianceCell = screen.getByText("+3h");
      expect(varianceCell.className).toContain("text-[#525252]");
    });

    it("applies neutral color to zero variance", () => {
      const projects: ProjectAnalytics[] = [
        {
          projectId: 1,
          projectName: "Project Test",
          forecastHours: 100,
          actualHours: 100,
          variance: 0,
          billableHours: 95,
          nonBillableHours: 5,
          utilizationRate: 95,
          teamMemberCount: 5,
        },
      ];

      render(<ProjectAnalyticsTable projects={projects} />);

      const varianceCell = screen.getByText("0h");
      expect(varianceCell.className).toContain("text-[#525252]");
    });

    it("applies neutral color to negative variance within threshold", () => {
      const projects: ProjectAnalytics[] = [
        {
          projectId: 1,
          projectName: "Project Test",
          forecastHours: 100,
          actualHours: 96,
          variance: -4,
          billableHours: 90,
          nonBillableHours: 6,
          utilizationRate: 96,
          teamMemberCount: 5,
        },
      ];

      render(<ProjectAnalyticsTable projects={projects} />);

      const varianceCell = screen.getByText("-4h");
      expect(varianceCell.className).toContain("text-[#525252]");
    });
  });

  describe("Utilization Rate Colors", () => {
    it("applies green color to utilization >= 80%", () => {
      render(<ProjectAnalyticsTable {...defaultProps} />);

      const utilization95 = screen.getByText("95%");
      const utilization85 = screen.getByText("85%");

      expect(utilization95.className).toContain("text-[#24a148]");
      expect(utilization85.className).toContain("text-[#24a148]");
    });

    it("applies amber color to utilization between 60% and 80%", () => {
      render(<ProjectAnalyticsTable {...defaultProps} />);

      const utilization75 = screen.getByText("75%");
      expect(utilization75.className).toContain("text-[#f1c21b]");
    });

    it("applies red color to utilization below 60%", () => {
      const projects: ProjectAnalytics[] = [
        {
          projectId: 1,
          projectName: "Low Utilization Project",
          forecastHours: 100,
          actualHours: 50,
          variance: -50,
          billableHours: 45,
          nonBillableHours: 5,
          utilizationRate: 45,
          teamMemberCount: 5,
        },
      ];

      render(<ProjectAnalyticsTable projects={projects} />);

      const utilization = screen.getByText("45%");
      expect(utilization.className).toContain("text-[#da1e28]");
    });

    it("applies green color to exactly 80% utilization", () => {
      const projects: ProjectAnalytics[] = [
        {
          projectId: 1,
          projectName: "Project Test",
          forecastHours: 100,
          actualHours: 80,
          variance: -20,
          billableHours: 75,
          nonBillableHours: 5,
          utilizationRate: 80,
          teamMemberCount: 5,
        },
      ];

      render(<ProjectAnalyticsTable projects={projects} />);

      const utilization = screen.getByText("80%");
      expect(utilization.className).toContain("text-[#24a148]");
    });

    it("applies amber color to exactly 60% utilization", () => {
      const projects: ProjectAnalytics[] = [
        {
          projectId: 1,
          projectName: "Project Test",
          forecastHours: 100,
          actualHours: 60,
          variance: -40,
          billableHours: 55,
          nonBillableHours: 5,
          utilizationRate: 60,
          teamMemberCount: 5,
        },
      ];

      render(<ProjectAnalyticsTable projects={projects} />);

      const utilization = screen.getByText("60%");
      expect(utilization.className).toContain("text-[#f1c21b]");
    });
  });

  describe("Table Structure and Styling", () => {
    it("renders table with proper structure", () => {
      render(<ProjectAnalyticsTable {...defaultProps} />);

      const table = screen.getByTestId("projects-table");
      expect(table.tagName).toBe("TABLE");
      expect(table.querySelector("thead")).toBeInTheDocument();
      expect(table.querySelector("tbody")).toBeInTheDocument();
    });

    it("applies hover effect class to table rows", () => {
      render(<ProjectAnalyticsTable {...defaultProps} />);

      const row = screen.getByTestId("project-row-1");
      expect(row.className).toContain("hover:bg-[#f4f4f4]");
      expect(row.className).toContain("transition-colors");
    });

    it("applies correct styling to forecast hours", () => {
      render(<ProjectAnalyticsTable {...defaultProps} />);

      const forecastCell = screen.getByText("100h");
      expect(forecastCell.className).toContain("text-[#0f62fe]");
      expect(forecastCell.className).toContain("font-semibold");
    });

    it("applies correct styling to actual hours", () => {
      render(<ProjectAnalyticsTable {...defaultProps} />);

      const actualCell = screen.getByText("95h");
      expect(actualCell.className).toContain("text-[#24a148]");
      expect(actualCell.className).toContain("font-semibold");
    });
  });

  describe("Edge Cases", () => {
    it("handles single project", () => {
      const singleProject: ProjectAnalytics[] = [mockProjects[0]];

      render(<ProjectAnalyticsTable projects={singleProject} />);

      expect(screen.getByText("Project Alpha")).toBeInTheDocument();
      expect(screen.getByTestId("project-row-1")).toBeInTheDocument();
    });

    it("handles large number of projects", () => {
      const manyProjects: ProjectAnalytics[] = Array.from(
        { length: 20 },
        (_, i) => ({
          projectId: i + 1,
          projectName: `Project ${i + 1}`,
          forecastHours: 100,
          actualHours: 95,
          variance: -5,
          billableHours: 90,
          nonBillableHours: 5,
          utilizationRate: 95,
          teamMemberCount: 5,
        }),
      );

      render(<ProjectAnalyticsTable projects={manyProjects} />);

      expect(screen.getByText("Project 1")).toBeInTheDocument();
      expect(screen.getByText("Project 20")).toBeInTheDocument();
    });

    it("handles zero hours values", () => {
      const projects: ProjectAnalytics[] = [
        {
          projectId: 1,
          projectName: "Zero Project",
          forecastHours: 0,
          actualHours: 0,
          variance: 0,
          billableHours: 0,
          nonBillableHours: 0,
          utilizationRate: 0,
          teamMemberCount: 0,
        },
      ];

      render(<ProjectAnalyticsTable projects={projects} />);

      expect(screen.getByText("Zero Project")).toBeInTheDocument();
      const zeroHourElements = screen.getAllByText("0h");
      expect(zeroHourElements.length).toBeGreaterThan(0);
    });

    it("handles large variance values", () => {
      const projects: ProjectAnalytics[] = [
        {
          projectId: 1,
          projectName: "Large Variance Project",
          forecastHours: 1000,
          actualHours: 1500,
          variance: 500,
          billableHours: 1400,
          nonBillableHours: 100,
          utilizationRate: 93,
          teamMemberCount: 15,
        },
      ];

      render(<ProjectAnalyticsTable projects={projects} />);

      expect(screen.getByText("+500h")).toBeInTheDocument();
    });

    it("handles long project names", () => {
      const projects: ProjectAnalytics[] = [
        {
          projectId: 1,
          projectName:
            "This is a Very Long Project Name That Might Need Special Handling",
          forecastHours: 100,
          actualHours: 95,
          variance: -5,
          billableHours: 90,
          nonBillableHours: 5,
          utilizationRate: 95,
          teamMemberCount: 5,
        },
      ];

      render(<ProjectAnalyticsTable projects={projects} />);

      expect(
        screen.getByText(
          "This is a Very Long Project Name That Might Need Special Handling",
        ),
      ).toBeInTheDocument();
    });
  });

  describe("Props Updates", () => {
    it("updates when projects prop changes", () => {
      const { rerender } = render(<ProjectAnalyticsTable {...defaultProps} />);

      expect(screen.getByText("Project Alpha")).toBeInTheDocument();

      const newProjects: ProjectAnalytics[] = [
        {
          projectId: 99,
          projectName: "New Project",
          forecastHours: 50,
          actualHours: 48,
          variance: -2,
          billableHours: 45,
          nonBillableHours: 3,
          utilizationRate: 96,
          teamMemberCount: 3,
        },
      ];

      rerender(<ProjectAnalyticsTable projects={newProjects} />);

      expect(screen.queryByText("Project Alpha")).not.toBeInTheDocument();
      expect(screen.getByText("New Project")).toBeInTheDocument();
    });

    it("shows empty state when projects array becomes empty", () => {
      const { rerender } = render(<ProjectAnalyticsTable {...defaultProps} />);

      expect(screen.queryByTestId("empty-state")).not.toBeInTheDocument();

      rerender(<ProjectAnalyticsTable projects={[]} />);

      expect(screen.getByTestId("empty-state")).toBeInTheDocument();
    });

    it("hides empty state when projects are added", () => {
      const { rerender } = render(<ProjectAnalyticsTable projects={[]} />);

      expect(screen.getByTestId("empty-state")).toBeInTheDocument();

      rerender(<ProjectAnalyticsTable {...defaultProps} />);

      expect(screen.queryByTestId("empty-state")).not.toBeInTheDocument();
      expect(screen.getByText("Project Alpha")).toBeInTheDocument();
    });
  });
});
