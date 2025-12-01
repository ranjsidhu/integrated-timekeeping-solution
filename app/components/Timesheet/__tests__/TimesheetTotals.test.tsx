import { render, screen } from "@testing-library/react";
import TimesheetTotals from "@/app/components/Timesheet/TimesheetTotals";
import type { TimeEntry } from "@/types/timesheet.types";

describe("TimesheetTotals", () => {
  test("calculates per-day totals and overall total", () => {
    const timeEntries: TimeEntry[] = [
      {
        id: "a",
        billCodeId: 1,
        subCodeId: 11,
        hours: { mon: 2, tue: 1, wed: 0, thu: 4, fri: 0 },
      } as unknown as TimeEntry,
      {
        id: "b",
        billCodeId: 2,
        subCodeId: 12,
        hours: { mon: 1, tue: 2, wed: 3, thu: 0, fri: 4 },
      } as unknown as TimeEntry,
    ];

    render(
      <table>
        <tbody>
          <TimesheetTotals timeEntries={timeEntries} />
        </tbody>
      </table>,
    );

    const cells = screen.getAllByRole("cell");
    // cells: [Total label, mon, tue, wed, thu, fri, overall total, actions]
    expect(cells[0]).toHaveTextContent("Total");

    // per-day totals: mon 3, tue 3, wed 3, thu 4, fri 4
    expect(cells[1]).toHaveTextContent("3");
    expect(cells[2]).toHaveTextContent("3");
    expect(cells[3]).toHaveTextContent("3");
    expect(cells[4]).toHaveTextContent("4");
    expect(cells[5]).toHaveTextContent("4");

    // overall total = sum of entry totals: (2+1+0+4+0)=7 and (1+2+3+0+4)=10 => 17
    expect(cells[6]).toHaveTextContent("17");

    // actions cell empty
    expect(cells[7].textContent?.trim() || "").toBe("");
  });
});
