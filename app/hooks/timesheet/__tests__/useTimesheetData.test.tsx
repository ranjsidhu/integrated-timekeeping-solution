/** biome-ignore-all lint/suspicious/noExplicitAny: Unit tests */
import { render, screen, waitFor } from "@testing-library/react";
import { useTimesheetData } from "../useTimesheetData";

// Mock actions and utils
const mockGetTimesheetByWeekEnding = jest.fn();
const mockGetEntriesWithHours = jest.fn();
const mockMergeTimeEntries = jest.fn();
const mockMergeWorkItems = jest.fn();
const mockProcessPendingCode = jest.fn();

jest.mock("@/app/actions", () => ({
  getTimesheetByWeekEnding: (...args: any[]) =>
    mockGetTimesheetByWeekEnding(...args),
}));

jest.mock("@/utils/timesheet/timesheet.utils", () => ({
  getEntriesWithHours: (...args: any[]) => mockGetEntriesWithHours(...args),
  mergeTimeEntries: (...args: any[]) => mockMergeTimeEntries(...args),
  mergeWorkItems: (...args: any[]) => mockMergeWorkItems(...args),
  processPendingCode: (...args: any[]) => mockProcessPendingCode(...args),
}));

function TestHarness({ selectedWeek }: { selectedWeek: any }) {
  const { workItems, timeEntries, expandedRows, isLoading } =
    useTimesheetData(selectedWeek);

  return (
    <div>
      <div data-testid="isLoading">{isLoading ? "1" : "0"}</div>
      <div data-testid="workItems">{JSON.stringify(workItems)}</div>
      <div data-testid="timeEntries">{JSON.stringify(timeEntries)}</div>
      <div data-testid="expandedRows">
        {JSON.stringify(Array.from(expandedRows))}
      </div>
    </div>
  );
}

describe("useTimesheetData (DOM harness)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("loads timesheet, merges pending data, and sets expanded rows when timesheet exists", async () => {
    const selectedWeek = { id: "week-1" } as any;

    const serverData = {
      workItems: [{ id: "w1", name: "Work 1" }],
      timeEntries: [{ id: "e1", hours: 8 }],
      hasTimesheet: true,
    };

    // pending data from local storage
    mockProcessPendingCode.mockReturnValue({
      workItems: [{ id: "p1", name: "Pending" }],
      timeEntries: [{ id: "pe1", hours: 2 }],
    });

    mockGetTimesheetByWeekEnding.mockResolvedValue({
      success: true,
      data: serverData,
    });

    // simple merge implementations for assertions
    mockMergeWorkItems.mockImplementation((a, b) => [...a, ...b]);
    mockMergeTimeEntries.mockImplementation((a, b) => [...a, ...b]);
    mockGetEntriesWithHours.mockReturnValue(["e1"]);

    render(<TestHarness selectedWeek={selectedWeek} />);

    await waitFor(() =>
      expect(screen.getByTestId("isLoading").textContent).toBe("0"),
    );

    // verify actions called
    expect(mockProcessPendingCode).toHaveBeenCalled();
    expect(mockGetTimesheetByWeekEnding).toHaveBeenCalledWith("week-1");

    // merged results should contain server + pending
    const workItemsText = screen.getByTestId("workItems").textContent || "";
    expect(workItemsText).toContain("w1");
    expect(workItemsText).toContain("p1");

    const timeEntriesText = screen.getByTestId("timeEntries").textContent || "";
    expect(timeEntriesText).toContain("e1");
    expect(timeEntriesText).toContain("pe1");

    // expanded rows should contain ids returned by getEntriesWithHours
    const expandedText = screen.getByTestId("expandedRows").textContent || "";
    expect(expandedText).toContain("e1");
  });

  it("handles missing or failed timesheet result and leaves arrays empty", async () => {
    const selectedWeek = { id: "week-2" } as any;

    mockProcessPendingCode.mockReturnValue({ workItems: [], timeEntries: [] });
    mockGetTimesheetByWeekEnding.mockResolvedValue({ success: false });

    render(<TestHarness selectedWeek={selectedWeek} />);

    await waitFor(() =>
      expect(screen.getByTestId("isLoading").textContent).toBe("0"),
    );

    expect(mockGetTimesheetByWeekEnding).toHaveBeenCalledWith("week-2");

    expect(screen.getByTestId("workItems").textContent).toBe("[]");
    expect(screen.getByTestId("timeEntries").textContent).toBe("[]");
    expect(screen.getByTestId("expandedRows").textContent).toBe("[]");
  });

  it("does not set expanded rows when hasTimesheet is false", async () => {
    const selectedWeek = { id: "week-3" } as any;

    const serverData = {
      workItems: [{ id: "wX" }],
      timeEntries: [{ id: "eX", hours: 5 }],
      hasTimesheet: false,
    };

    mockProcessPendingCode.mockReturnValue({ workItems: [], timeEntries: [] });
    mockGetTimesheetByWeekEnding.mockResolvedValue({
      success: true,
      data: serverData,
    });
    mockMergeWorkItems.mockImplementation((a) => a);
    mockMergeTimeEntries.mockImplementation((a) => a);
    mockGetEntriesWithHours.mockReturnValue([]);

    render(<TestHarness selectedWeek={selectedWeek} />);

    await waitFor(() =>
      expect(screen.getByTestId("isLoading").textContent).toBe("0"),
    );

    expect(screen.getByTestId("expandedRows").textContent).toBe("[]");
  });
});
