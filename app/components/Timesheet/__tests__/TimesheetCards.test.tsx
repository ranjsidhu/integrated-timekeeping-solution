import { fireEvent, render, screen } from "@testing-library/react";
import TimesheetCards from "@/app/components/Timesheet/TimesheetCards";
import type { CodeWithWorkItems, TimeEntry } from "@/types/timesheet.types";

describe("TimesheetCards", () => {
  const wi: CodeWithWorkItems["work_items"][number] = {
    id: 1,
    code_id: 0,
    work_item_code: "WI-100",
    description: "Work item desc",
    bill_codes: [{ id: 11, bill_code: "BC-1", bill_name: "Bill One" }],
  } as unknown as CodeWithWorkItems["work_items"][number];

  test("renders expanded card with inputs, respects buffered value and delegates changes/blurs", () => {
    const toggleExpanded = jest.fn();
    const deleteEntry = jest.fn();
    const onTempChange = jest.fn();
    const onCommit = jest.fn();

    const timeEntries: TimeEntry[] = [
      {
        id: "e1",
        subCodeId: 1,
        hours: { mon: 2, tue: 3, wed: 0, thu: 1, fri: 4 },
      } as unknown as TimeEntry,
    ];

    const editingValues = { e1: { mon: "5" } } as Record<
      string,
      Partial<Record<string, string>>
    >;

    render(
      <TimesheetCards
        workItems={[wi]}
        expandedRows={new Set([String(wi.id)])}
        toggleExpanded={toggleExpanded}
        editingValues={editingValues}
        onTempChange={onTempChange}
        onCommit={onCommit}
        deleteEntry={deleteEntry}
        timeEntries={timeEntries}
      />,
    );

    // Total shows calculated sum (2+3+0+1+4 = 10) appears twice (card header and bill code)
    const totals = screen.getAllByText("10");
    expect(totals.length).toBe(2);

    // Buffered value should be shown for MON
    const monInput = screen.getByLabelText("MON") as HTMLInputElement;
    expect(monInput.value).toBe("5");

    // Change input triggers onTempChange with entry id and day
    fireEvent.change(monInput, { target: { value: "7" } });
    expect(onTempChange).toHaveBeenCalledWith("e1", "mon", "7");

    // Blur triggers commit
    fireEvent.blur(monInput);
    expect(onCommit).toHaveBeenCalledWith("e1", "mon");

    // Delete button should call deleteEntry with entry id and not call toggleExpanded
    const deleteBtn = screen.getByTestId("delete-entry-button");
    fireEvent.click(deleteBtn);
    expect(deleteEntry).toHaveBeenCalledWith("e1");
    expect(toggleExpanded).not.toHaveBeenCalled();

    // Clicking the header toggles expanded state
    const headerButton = screen.getByText(wi.work_item_code).closest("button");
    expect(headerButton).toBeTruthy();
    if (headerButton) fireEvent.click(headerButton);
    expect(toggleExpanded).toHaveBeenCalledWith(wi.id);
  });

  test("treats falsy entry id (0) as empty input value", () => {
    const toggleExpanded = jest.fn();
    const deleteEntry = jest.fn();
    const onTempChange = jest.fn();
    const onCommit = jest.fn();

    // Create an entry whose id is 0 (falsy) to exercise the `if (!entryId) return ""` branch
    const timeEntries = [
      {
        id: 0 as unknown as string,
        subCodeId: 1,
        hours: { mon: 2, tue: 3, wed: 1, thu: 0, fri: 0 },
      } as unknown as TimeEntry,
    ];

    render(
      <TimesheetCards
        workItems={[wi]}
        expandedRows={new Set([String(wi.id)])}
        toggleExpanded={toggleExpanded}
        onTempChange={onTempChange}
        onCommit={onCommit}
        deleteEntry={deleteEntry}
        timeEntries={timeEntries}
      />,
    );

    // Because the entry id is falsy (0), the input value should be empty string
    const monInput = screen.getByLabelText("MON") as HTMLInputElement;
    expect(monInput.value).toBe("");
  });

  test("clicking delete when no corresponding entry exists does nothing", () => {
    const toggleExpanded = jest.fn();
    const deleteEntry = jest.fn();

    // No timeEntries for the work item -> entry undefined
    render(
      <TimesheetCards
        workItems={[wi]}
        expandedRows={new Set([String(wi.id)])}
        toggleExpanded={toggleExpanded}
        onTempChange={() => {}}
        onCommit={() => {}}
        deleteEntry={deleteEntry}
        timeEntries={[]}
      />,
    );

    const deleteBtn = screen.getByTestId("delete-entry-button");
    fireEvent.click(deleteBtn);
    expect(deleteEntry).not.toHaveBeenCalled();
  });
});
