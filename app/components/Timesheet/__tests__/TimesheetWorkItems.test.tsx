import { fireEvent, render, screen } from "@testing-library/react";
import TimesheetWorkItems from "@/app/components/Timesheet/TimesheetWorkItems";
import type { CodeWithWorkItems } from "@/types/timesheet.types";

describe("TimesheetWorkItems", () => {
  const workItem: CodeWithWorkItems["work_items"][number] = {
    id: 5,
    code_id: 0,
    work_item_code: "WI-5",
    description: "Work item five",
    bill_codes: [],
  } as unknown as CodeWithWorkItems["work_items"][number];

  test("renders work item code and description and calls toggleExpanded on click (collapsed)", () => {
    const toggleExpanded = jest.fn();

    render(
      <table>
        <tbody>
          <TimesheetWorkItems
            workItem={workItem}
            isExpanded={false}
            toggleExpanded={toggleExpanded}
          />
        </tbody>
      </table>,
    );

    expect(screen.getByText("WI-5")).toBeInTheDocument();
    expect(screen.getByText("Work item five")).toBeInTheDocument();

    const row = screen.getByText("WI-5").closest("tr");
    expect(row).toBeTruthy();
    if (row) fireEvent.click(row);
    expect(toggleExpanded).toHaveBeenCalledWith(workItem.id);
  });

  test("renders when expanded and still calls toggleExpanded on click", () => {
    const toggleExpanded = jest.fn();

    render(
      <table>
        <tbody>
          <TimesheetWorkItems
            workItem={workItem}
            isExpanded={true}
            toggleExpanded={toggleExpanded}
          />
        </tbody>
      </table>,
    );

    const row = screen.getByText("WI-5").closest("tr");
    expect(row).toBeTruthy();
    if (row) fireEvent.click(row);
    expect(toggleExpanded).toHaveBeenCalledWith(workItem.id);
  });
});
