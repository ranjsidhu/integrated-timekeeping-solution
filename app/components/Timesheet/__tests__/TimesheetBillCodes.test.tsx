import { fireEvent, render, screen } from "@testing-library/react";
import type { CodeWithWorkItems, TimeEntry } from "@/types/timesheet.types";

// Mock the Input and IconButton components so their onChange/onClick props are directly attached
jest.mock("@/app/components/Input/Input", () => {
  const React = require("react");
  type P = { id?: string } & Record<string, unknown>;
  return {
    __esModule: true,
    default: (props: P) =>
      React.createElement("input", {
        ...props,
        "aria-label": props.id,
        "data-testid": `mock-input-${props.id}`,
      }),
  };
});

jest.mock("@/app/components/IconButton/IconButton", () => {
  const React = require("react");
  type P = { label?: string; onClick?: (e: Event) => void } & Record<
    string,
    unknown
  >;
  return {
    __esModule: true,
    default: (props: P) =>
      React.createElement(
        "button",
        {
          type: "button",
          onClick: props.onClick,
          "aria-label": props.label,
          "data-testid": "mock-icon-button",
        },
        props.children,
      ),
  };
});

import TimesheetBillCodes from "@/app/components/Timesheet/TimesheetBillCodes";

describe("TimesheetBillCodes", () => {
  const billCodes: CodeWithWorkItems["work_items"][number]["bill_codes"] = [
    { id: 11, work_item_id: 1, bill_code: "BC-1", bill_name: "Bill One" },
  ];

  test("renders bill code rows, shows buffered values, handles change/blur and delete", () => {
    const onTempChange = jest.fn();
    const onCommit = jest.fn();
    const deleteEntry = jest.fn();

    const entry: TimeEntry = {
      id: "e1",
      billCodeId: 1,
      subCodeId: 1,
      hours: { mon: 2, tue: 3, wed: 0, thu: 1, fri: 4 },
    } as unknown as TimeEntry;

    const editingValues = { e1: { mon: "5" } } as Record<
      string,
      Partial<Record<string, string>>
    >;

    const { container } = render(
      <table>
        <tbody>
          <TimesheetBillCodes
            billCodes={billCodes}
            entry={entry}
            editingValues={editingValues}
            onTempChange={onTempChange}
            onCommit={onCommit}
            deleteEntry={deleteEntry}
          />
        </tbody>
      </table>,
    );

    // Bill code text present (desktop and mobile)
    expect(screen.getAllByText("BC-1").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Bill One").length).toBeGreaterThanOrEqual(1);

    // Desktop input id: `${entry.id}-mon-hours`
    const desktopMon = container.querySelector(
      `#${entry.id}-mon-hours`,
    ) as HTMLInputElement | null;
    expect(desktopMon).toBeTruthy();
    expect(desktopMon?.value).toBe("5");

    // Mobile input id: `${entry.id}-mon-hours-mobile`
    const mobileMon = container.querySelector(
      `#${entry.id}-mon-hours-mobile`,
    ) as HTMLInputElement | null;
    expect(mobileMon).toBeTruthy();
    expect(mobileMon?.value).toBe("5");

    // Change desktop mon value
    if (desktopMon) fireEvent.change(desktopMon, { target: { value: "7" } });
    expect(onTempChange).toHaveBeenCalledWith(entry.id ?? "", "mon", "7");

    // Blur commits
    if (desktopMon) fireEvent.blur(desktopMon);
    expect(onCommit).toHaveBeenCalledWith(entry.id ?? "", "mon");

    // Change mobile value as well
    if (mobileMon) fireEvent.change(mobileMon, { target: { value: "8" } });
    expect(onTempChange).toHaveBeenCalledWith(entry.id ?? "", "mon", "8");
    if (mobileMon) fireEvent.blur(mobileMon);
    expect(onCommit).toHaveBeenCalledWith(entry.id ?? "", "mon");

    // Delete buttons - desktop and mobile; click both to exercise both handlers
    const deleteButtons = screen.getAllByLabelText("Delete entry");
    expect(deleteButtons.length).toBeGreaterThanOrEqual(1);
    // click desktop
    fireEvent.click(deleteButtons[0]);
    // click mobile if present
    if (deleteButtons.length > 1) fireEvent.click(deleteButtons[1]);
    // deleteEntry should have been called with the entry id for each click that had an id
    expect(deleteEntry).toHaveBeenCalledWith(entry.id);
  });

  test("clicking delete when entry.id is falsy does nothing", () => {
    const onTempChange = jest.fn();
    const onCommit = jest.fn();
    const deleteEntry = jest.fn();

    // entry with no id
    const entry = {
      billCodeId: 1,
      subCodeId: 1,
      hours: { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0 },
    } as unknown as TimeEntry;

    render(
      <table>
        <tbody>
          <TimesheetBillCodes
            billCodes={billCodes}
            entry={entry}
            onTempChange={onTempChange}
            onCommit={onCommit}
            deleteEntry={deleteEntry}
          />
        </tbody>
      </table>,
    );

    const deleteButtons = screen.getAllByLabelText("Delete entry");
    expect(deleteButtons.length).toBeGreaterThanOrEqual(1);
    fireEvent.click(deleteButtons[0]);
    expect(deleteEntry).not.toHaveBeenCalled();
  });

  test("returns empty string for inputs when entry.hours[day] is undefined and no buffer", () => {
    const onTempChange = jest.fn();
    const onCommit = jest.fn();
    const deleteEntry = jest.fn();

    const entry = {
      id: "e2",
      billCodeId: 1,
      subCodeId: 1,
      hours: {},
    } as unknown as TimeEntry;

    const { container } = render(
      <table>
        <tbody>
          <TimesheetBillCodes
            billCodes={billCodes}
            entry={entry}
            onTempChange={onTempChange}
            onCommit={onCommit}
            deleteEntry={deleteEntry}
          />
        </tbody>
      </table>,
    );

    const desktopMon = container.querySelector(
      `#${entry.id}-mon-hours`,
    ) as HTMLInputElement | null;
    expect(desktopMon).toBeTruthy();
    expect(desktopMon?.value).toBe("");
  });
});
