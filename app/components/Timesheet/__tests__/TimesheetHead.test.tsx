import { render, screen } from "@testing-library/react";
import TimesheetHead from "@/app/components/Timesheet/TimesheetHead";
import type { WeekEnding } from "@/types/timesheet.types";
import { getDayInfo } from "@/utils/timesheet/timesheet.utils";

describe("TimesheetHead", () => {
  test("renders headers for project, five days, total and an actions column", () => {
    const selectedWeek: WeekEnding = {
      id: 1,
      label: "W1",
      week_ending: new Date("2025-11-28"),
      status: "Draft",
    } as WeekEnding;

    render(
      <table>
        <TimesheetHead selectedWeek={selectedWeek} />
      </table>,
    );

    const headers = screen.getAllByRole("columnheader");
    // Project + 5 days + Total + actions = 8
    expect(headers.length).toBe(8);

    expect(headers[0]).toHaveTextContent("Project");

    for (let offset = 0; offset < 5; offset++) {
      const dayInfo = getDayInfo(offset, selectedWeek);
      const header = headers[offset + 1];
      expect(header).toHaveTextContent(dayInfo.shortDay);
      expect(header).toHaveTextContent(dayInfo.date);
    }

    expect(headers[6]).toHaveTextContent("Total");
    // last header is an empty actions column
    expect(headers[7].textContent?.trim() || "").toBe("");
  });

  test("renders empty day cells when selectedWeek is falsy", () => {
    const selectedWeek = undefined as unknown as WeekEnding;

    render(
      <table>
        <TimesheetHead selectedWeek={selectedWeek} />
      </table>,
    );

    const headers = screen.getAllByRole("columnheader");
    // ensure day headers exist but are empty
    expect(headers.length).toBe(8);
    for (let i = 1; i <= 5; i++) {
      expect(headers[i].textContent?.trim() || "").toBe("");
    }
  });
});
