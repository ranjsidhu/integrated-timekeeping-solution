import { fireEvent, render, screen } from "@testing-library/react";
import type {
  TeamCapacityTableProps,
  TeamMember,
} from "@/types/analytics.types";
import TeamCapacityTable from "../TeamCapacityTable";

describe("TeamCapacityTable", () => {
  const mockWeekEndings = [
    { id: 1, week_ending: new Date("2025-12-06"), label: "Week 1" },
    { id: 2, week_ending: new Date("2025-12-13"), label: "Week 2" },
    { id: 3, week_ending: new Date("2025-12-20"), label: "Week 3" },
  ];

  const mockTeamMembers: TeamMember[] = [
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@example.com",
      weeklyHours: { 1: 40, 2: 35, 3: 38 },
      averageUtilization: 94,
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane.smith@example.com",
      weeklyHours: { 1: 30, 2: 28, 3: 32 },
      averageUtilization: 75,
    },
    {
      id: 3,
      name: "Bob Johnson",
      email: "bob.johnson@example.com",
      weeklyHours: { 1: 20, 2: 18, 3: 22 },
      averageUtilization: 50,
    },
  ];

  const defaultProps: TeamCapacityTableProps = {
    teamMembers: mockTeamMembers,
    weekEndings: mockWeekEndings,
  };

  describe("Rendering", () => {
    it("renders table title and description", () => {
      render(<TeamCapacityTable {...defaultProps} />);

      expect(screen.getByText("Team Capacity Overview")).toBeInTheDocument();
      expect(
        screen.getByText(/Forecasted hours for the next 3 weeks/),
      ).toBeInTheDocument();
    });

    it("renders table with correct structure", () => {
      render(<TeamCapacityTable {...defaultProps} />);

      expect(screen.getByTestId("team-capacity-table")).toBeInTheDocument();
    });

    it("renders Team Member header", () => {
      render(<TeamCapacityTable {...defaultProps} />);

      expect(screen.getByText("Team Member")).toBeInTheDocument();
    });

    it("renders all week ending headers with labels and dates", () => {
      render(<TeamCapacityTable {...defaultProps} />);

      expect(screen.getByText("Week 1")).toBeInTheDocument();
      expect(screen.getByText("Week 2")).toBeInTheDocument();
      expect(screen.getByText("Week 3")).toBeInTheDocument();

      expect(screen.getByText("Dec 6")).toBeInTheDocument();
      expect(screen.getByText("Dec 13")).toBeInTheDocument();
      expect(screen.getByText("Dec 20")).toBeInTheDocument();
    });

    it("renders Average Utilization header", () => {
      render(<TeamCapacityTable {...defaultProps} />);

      expect(screen.getByText("Avg Util.")).toBeInTheDocument();
    });

    it("renders all team members", () => {
      render(<TeamCapacityTable {...defaultProps} />);

      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
      expect(screen.getByText("Bob Johnson")).toBeInTheDocument();
    });

    it("renders team member emails", () => {
      render(<TeamCapacityTable {...defaultProps} />);

      expect(screen.getByText("john.doe@example.com")).toBeInTheDocument();
      expect(screen.getByText("jane.smith@example.com")).toBeInTheDocument();
      expect(screen.getByText("bob.johnson@example.com")).toBeInTheDocument();
    });

    it("renders empty state when no team members provided", () => {
      render(
        <TeamCapacityTable teamMembers={[]} weekEndings={mockWeekEndings} />,
      );

      expect(screen.getByTestId("empty-state")).toBeInTheDocument();
      expect(screen.getByText("No team members found")).toBeInTheDocument();
    });

    it("does not render empty state when team members exist", () => {
      render(<TeamCapacityTable {...defaultProps} />);

      expect(screen.queryByTestId("empty-state")).not.toBeInTheDocument();
    });

    it("shows clickable hint when onMemberClick is provided", () => {
      const mockOnClick = jest.fn();
      render(
        <TeamCapacityTable {...defaultProps} onMemberClick={mockOnClick} />,
      );

      expect(
        screen.getByText(/Click on a team member to view details/),
      ).toBeInTheDocument();
    });

    it("does not show clickable hint when onMemberClick is not provided", () => {
      render(<TeamCapacityTable {...defaultProps} />);

      expect(
        screen.queryByText(/Click on a team member to view details/),
      ).not.toBeInTheDocument();
    });
  });

  describe("Weekly Hours Display", () => {
    it("displays weekly hours correctly for each team member", () => {
      render(<TeamCapacityTable {...defaultProps} />);

      expect(screen.getByText("40h")).toBeInTheDocument();
      expect(screen.getByText("35h")).toBeInTheDocument();
      expect(screen.getByText("38h")).toBeInTheDocument();
    });

    it("displays 0 hours when weekly hours are missing", () => {
      const membersWithMissingHours: TeamMember[] = [
        {
          id: 1,
          name: "Test User",
          email: "test@example.com",
          weeklyHours: { 1: 20 }, // Missing weeks 2 and 3
          averageUtilization: 50,
        },
      ];

      render(
        <TeamCapacityTable
          teamMembers={membersWithMissingHours}
          weekEndings={mockWeekEndings}
        />,
      );

      const zeroHours = screen.getAllByText("0h");
      expect(zeroHours).toHaveLength(2); // For weeks 2 and 3
    });

    it("calculates and displays weekly utilization correctly", () => {
      render(<TeamCapacityTable {...defaultProps} />);

      // 40h / 40h * 100 = 100%
      expect(screen.getByText("100%")).toBeInTheDocument();
      // 35h / 40h * 100 = 87.5% -> 88%
      expect(screen.getByText("88%")).toBeInTheDocument();
      // 30h / 40h * 100 = 75%
      expect(screen.getByText("75%")).toBeInTheDocument();
    });
  });

  describe("Average Utilization Display", () => {
    it("displays average utilization for each team member", () => {
      render(<TeamCapacityTable {...defaultProps} />);

      // Check for utilization percentages
      const utilizationText = screen.getByText(/94%/);
      expect(utilizationText).toBeInTheDocument();
    });

    it("displays utilization with emoji", () => {
      render(<TeamCapacityTable {...defaultProps} />);

      const row = screen.getByTestId("team-member-row-1");
      expect(row).toHaveTextContent("94%");
    });
  });

  describe("Utilization Colors", () => {
    it("applies green color to utilization >= 80%", () => {
      render(<TeamCapacityTable {...defaultProps} />);

      const row = screen.getByTestId("team-member-row-1");
      const utilizationCell = row.querySelector(
        "td:last-child div",
      ) as HTMLElement;
      expect(utilizationCell.className).toContain("text-[#24a148]");
    });

    it("applies amber color to utilization between 60% and 80%", () => {
      render(<TeamCapacityTable {...defaultProps} />);

      const row = screen.getByTestId("team-member-row-2");
      const utilizationCell = row.querySelector(
        "td:last-child div",
      ) as HTMLElement;
      expect(utilizationCell.className).toContain("text-[#f1c21b]");
    });

    it("applies red color to utilization < 60%", () => {
      render(<TeamCapacityTable {...defaultProps} />);

      const row = screen.getByTestId("team-member-row-3");
      const utilizationCell = row.querySelector(
        "td:last-child div",
      ) as HTMLElement;
      expect(utilizationCell.className).toContain("text-[#da1e28]");
    });

    it("applies green color to exactly 80% utilization", () => {
      const members: TeamMember[] = [
        {
          id: 1,
          name: "Test User",
          email: "test@example.com",
          weeklyHours: { 1: 32 },
          averageUtilization: 80,
        },
      ];

      render(
        <TeamCapacityTable
          teamMembers={members}
          weekEndings={mockWeekEndings}
        />,
      );

      const row = screen.getByTestId("team-member-row-1");
      const utilizationCell = row.querySelector(
        "td:last-child div",
      ) as HTMLElement;
      expect(utilizationCell.className).toContain("text-[#24a148]");
    });

    it("applies amber color to exactly 60% utilization", () => {
      const members: TeamMember[] = [
        {
          id: 1,
          name: "Test User",
          email: "test@example.com",
          weeklyHours: { 1: 24 },
          averageUtilization: 60,
        },
      ];

      render(
        <TeamCapacityTable
          teamMembers={members}
          weekEndings={mockWeekEndings}
        />,
      );

      const row = screen.getByTestId("team-member-row-1");
      const utilizationCell = row.querySelector(
        "td:last-child div",
      ) as HTMLElement;
      expect(utilizationCell.className).toContain("text-[#f1c21b]");
    });
  });

  describe("Utilization Emojis", () => {
    it("displays green circle emoji for utilization >= 80%", () => {
      render(<TeamCapacityTable {...defaultProps} />);

      const row = screen.getByTestId("team-member-row-1");
      const utilizationCell = row.querySelector("td:last-child") as HTMLElement;
      expect(utilizationCell.textContent).toContain("94%");
    });

    it("displays yellow circle emoji for utilization between 60% and 80%", () => {
      render(<TeamCapacityTable {...defaultProps} />);

      const row = screen.getByTestId("team-member-row-2");
      const utilizationCell = row.querySelector("td:last-child") as HTMLElement;
      expect(utilizationCell.textContent).toContain("75%");
    });

    it("displays red circle emoji for utilization < 60%", () => {
      render(<TeamCapacityTable {...defaultProps} />);

      const row = screen.getByTestId("team-member-row-3");
      const utilizationCell = row.querySelector("td:last-child") as HTMLElement;
      expect(utilizationCell.textContent).toContain("50%");
    });
  });

  describe("Click Interaction", () => {
    it("calls onMemberClick when row is clicked", () => {
      const mockOnClick = jest.fn();
      render(
        <TeamCapacityTable {...defaultProps} onMemberClick={mockOnClick} />,
      );

      const row = screen.getByTestId("team-member-row-1");
      fireEvent.click(row);

      expect(mockOnClick).toHaveBeenCalledWith(1);
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it("calls onMemberClick with correct user ID for each member", () => {
      const mockOnClick = jest.fn();
      render(
        <TeamCapacityTable {...defaultProps} onMemberClick={mockOnClick} />,
      );

      fireEvent.click(screen.getByTestId("team-member-row-1"));
      expect(mockOnClick).toHaveBeenCalledWith(1);

      fireEvent.click(screen.getByTestId("team-member-row-2"));
      expect(mockOnClick).toHaveBeenCalledWith(2);

      fireEvent.click(screen.getByTestId("team-member-row-3"));
      expect(mockOnClick).toHaveBeenCalledWith(3);
    });

    it("does not error when row is clicked without onMemberClick", () => {
      render(<TeamCapacityTable {...defaultProps} />);

      const row = screen.getByTestId("team-member-row-1");
      expect(() => fireEvent.click(row)).not.toThrow();
    });

    it("applies cursor-pointer class when onMemberClick is provided", () => {
      const mockOnClick = jest.fn();
      render(
        <TeamCapacityTable {...defaultProps} onMemberClick={mockOnClick} />,
      );

      const row = screen.getByTestId("team-member-row-1");
      expect(row.className).toContain("cursor-pointer");
      expect(row.className).toContain("hover:bg-[#e0e0e0]");
    });

    it("does not apply cursor-pointer class when onMemberClick is not provided", () => {
      render(<TeamCapacityTable {...defaultProps} />);

      const row = screen.getByTestId("team-member-row-1");
      expect(row.className).not.toContain("cursor-pointer");
      expect(row.className).toContain("hover:bg-[#f4f4f4]");
    });
  });

  describe("Edge Cases", () => {
    it("handles single team member", () => {
      const singleMember: TeamMember[] = [mockTeamMembers[0]];

      render(
        <TeamCapacityTable
          teamMembers={singleMember}
          weekEndings={mockWeekEndings}
        />,
      );

      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByTestId("team-member-row-1")).toBeInTheDocument();
    });

    it("handles single week", () => {
      const singleWeek = [mockWeekEndings[0]];

      render(
        <TeamCapacityTable
          teamMembers={mockTeamMembers}
          weekEndings={singleWeek}
        />,
      );

      expect(screen.getByText("Week 1")).toBeInTheDocument();
      expect(
        screen.getByText(/Forecasted hours for the next 1 weeks/),
      ).toBeInTheDocument();
    });

    it("handles many weeks", () => {
      const manyWeeks = Array.from({ length: 12 }, (_, i) => ({
        id: i + 1,
        week_ending: new Date(2025, 11, 6 + i * 7),
        label: `Week ${i + 1}`,
      }));

      render(
        <TeamCapacityTable
          teamMembers={mockTeamMembers}
          weekEndings={manyWeeks}
        />,
      );

      expect(screen.getByText("Week 1")).toBeInTheDocument();
      expect(screen.getByText("Week 12")).toBeInTheDocument();
    });

    it("handles zero utilization", () => {
      const members: TeamMember[] = [
        {
          id: 1,
          name: "Zero Hours",
          email: "zero@example.com",
          weeklyHours: { 1: 0, 2: 0, 3: 0 },
          averageUtilization: 0,
        },
      ];

      render(
        <TeamCapacityTable
          teamMembers={members}
          weekEndings={mockWeekEndings}
        />,
      );

      const row = screen.getByTestId("team-member-row-1");
      const utilizationCell = row.querySelector("td:last-child") as HTMLElement;
      expect(utilizationCell.textContent).toContain("0%");
    });

    it("handles 100% utilization", () => {
      const members: TeamMember[] = [
        {
          id: 1,
          name: "Full Time",
          email: "full@example.com",
          weeklyHours: { 1: 40, 2: 40, 3: 40 },
          averageUtilization: 100,
        },
      ];

      render(
        <TeamCapacityTable
          teamMembers={members}
          weekEndings={mockWeekEndings}
        />,
      );

      const row = screen.getByTestId("team-member-row-1");
      const utilizationCell = row.querySelector("td:last-child") as HTMLElement;
      expect(utilizationCell.textContent).toContain("100%");
    });

    it("handles over 100% utilization", () => {
      const members: TeamMember[] = [
        {
          id: 1,
          name: "Overtime",
          email: "overtime@example.com",
          weeklyHours: { 1: 50, 2: 48, 3: 52 },
          averageUtilization: 125,
        },
      ];

      render(
        <TeamCapacityTable
          teamMembers={members}
          weekEndings={mockWeekEndings}
        />,
      );

      expect(screen.getByText("50h")).toBeInTheDocument();
      const row = screen.getByTestId("team-member-row-1");
      expect(row).toHaveTextContent("125%");
    });

    it("handles long team member names", () => {
      const members: TeamMember[] = [
        {
          id: 1,
          name: "This Is A Very Long Team Member Name That Might Need Wrapping",
          email: "long.name@example.com",
          weeklyHours: { 1: 40 },
          averageUtilization: 100,
        },
      ];

      render(
        <TeamCapacityTable
          teamMembers={members}
          weekEndings={mockWeekEndings}
        />,
      );

      expect(
        screen.getByText(
          "This Is A Very Long Team Member Name That Might Need Wrapping",
        ),
      ).toBeInTheDocument();
    });

    it("handles long email addresses", () => {
      const members: TeamMember[] = [
        {
          id: 1,
          name: "User",
          email:
            "very.long.email.address.that.might.be.long@example-company.com",
          weeklyHours: { 1: 40 },
          averageUtilization: 100,
        },
      ];

      render(
        <TeamCapacityTable
          teamMembers={members}
          weekEndings={mockWeekEndings}
        />,
      );

      expect(
        screen.getByText(
          "very.long.email.address.that.might.be.long@example-company.com",
        ),
      ).toBeInTheDocument();
    });
  });

  describe("Props Updates", () => {
    it("updates when teamMembers prop changes", () => {
      const { rerender } = render(<TeamCapacityTable {...defaultProps} />);

      expect(screen.getByText("John Doe")).toBeInTheDocument();

      const newMembers: TeamMember[] = [
        {
          id: 99,
          name: "New Member",
          email: "new@example.com",
          weeklyHours: { 1: 30 },
          averageUtilization: 75,
        },
      ];

      rerender(
        <TeamCapacityTable
          teamMembers={newMembers}
          weekEndings={mockWeekEndings}
        />,
      );

      expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
      expect(screen.getByText("New Member")).toBeInTheDocument();
    });

    it("updates when weekEndings prop changes", () => {
      const { rerender } = render(<TeamCapacityTable {...defaultProps} />);

      expect(screen.getByText("Week 1")).toBeInTheDocument();

      const newWeeks = [
        { id: 10, week_ending: new Date("2026-01-01"), label: "Week 10" },
      ];

      rerender(
        <TeamCapacityTable
          teamMembers={mockTeamMembers}
          weekEndings={newWeeks}
        />,
      );

      expect(screen.queryByText("Week 1")).not.toBeInTheDocument();
      expect(screen.getByText("Week 10")).toBeInTheDocument();
    });

    it("shows empty state when teamMembers becomes empty", () => {
      const { rerender } = render(<TeamCapacityTable {...defaultProps} />);

      expect(screen.queryByTestId("empty-state")).not.toBeInTheDocument();

      rerender(
        <TeamCapacityTable teamMembers={[]} weekEndings={mockWeekEndings} />,
      );

      expect(screen.getByTestId("empty-state")).toBeInTheDocument();
    });

    it("hides empty state when teamMembers are added", () => {
      const { rerender } = render(
        <TeamCapacityTable teamMembers={[]} weekEndings={mockWeekEndings} />,
      );

      expect(screen.getByTestId("empty-state")).toBeInTheDocument();

      rerender(<TeamCapacityTable {...defaultProps} />);

      expect(screen.queryByTestId("empty-state")).not.toBeInTheDocument();
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });
  });
});
