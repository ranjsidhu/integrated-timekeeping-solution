/** biome-ignore-all lint/suspicious/noExplicitAny: Unit tests */
/** biome-ignore-all assist/source/organizeImports: Unit tests */
import { useState } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useTimesheetActions } from "../useTimesheetActions";

// Provide access to a shared mock so tests can assert calls
const mockAddNotification = jest.fn();

// Mock the server actions and notification provider used by the hook
jest.mock("@/app/actions", () => ({
  saveTimesheet: jest.fn(),
  submitTimesheet: jest.fn(),
  getTimesheetByWeekEnding: jest.fn(),
}));

jest.mock("@/app/providers", () => ({
  useNotification: () => ({ addNotification: mockAddNotification }),
}));

import {
  saveTimesheet,
  submitTimesheet,
  getTimesheetByWeekEnding,
} from "@/app/actions";

type TimeEntryAny = any;

function TestHarness({
  selectedWeek,
  initialTimeEntries,
  initialWorkItems,
}: {
  selectedWeek: any;
  initialTimeEntries: TimeEntryAny[];
  initialWorkItems: any[];
}) {
  const [workItems, setWorkItems] = useState(initialWorkItems);
  const [timeEntries, setTimeEntries] = useState(initialTimeEntries);
  const [status, setStatus] = useState("");

  const { handleSave, handleSubmit, handleCopyWeek, deleteEntry } =
    useTimesheetActions(
      selectedWeek,
      timeEntries,
      setWorkItems,
      setTimeEntries,
      setStatus,
    );

  return (
    <div>
      <button
        onClick={() => void handleSave()}
        data-testid="save"
        type="button"
      >
        save
      </button>
      <button
        onClick={() => void handleSubmit()}
        data-testid="submit"
        type="button"
      >
        submit
      </button>
      <button
        type="button"
        onClick={() =>
          void handleCopyWeek({
            id: 1,
            label: "Other",
            status: "OTHER",
            week_ending: new Date(),
          })
        }
        data-testid="copy"
      >
        copy
      </button>
      <button
        type="button"
        onClick={() => deleteEntry("e1")}
        data-testid="delete"
      >
        delete
      </button>

      <div data-testid="status">{status}</div>
      <div data-testid="timeEntries">{JSON.stringify(timeEntries)}</div>
      <div data-testid="workItems">{JSON.stringify(workItems)}</div>
    </div>
  );
}

describe("useTimesheetActions (DOM harness)", () => {
  const selectedWeek = { id: "week-1", label: "Week 1" } as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("handleSave calls saveTimesheet and updates status on success", async () => {
    (saveTimesheet as jest.Mock).mockResolvedValue({
      success: true,
      status: "SAVED",
    });

    render(
      <TestHarness
        selectedWeek={selectedWeek}
        initialTimeEntries={[{ id: "e1", hours: 8 }]}
        initialWorkItems={[{ id: "w1", name: "Code A" }]}
      />,
    );

    fireEvent.click(screen.getByTestId("save"));

    await waitFor(() => expect(saveTimesheet).toHaveBeenCalled());

    expect((saveTimesheet as jest.Mock).mock.calls[0][0]).toEqual(selectedWeek);
    expect((saveTimesheet as jest.Mock).mock.calls[0][1]).toEqual([
      { id: "e1", hours: 8 },
    ]);

    await waitFor(() =>
      expect(screen.getByTestId("status").textContent).toBe("SAVED"),
    );

    expect(mockAddNotification).toHaveBeenCalled();
  });

  it("handleSave handles errors and still notifies", async () => {
    (saveTimesheet as jest.Mock).mockRejectedValue(new Error("boom"));

    render(
      <TestHarness
        selectedWeek={selectedWeek}
        initialTimeEntries={[{ id: "e1", hours: 8 }]}
        initialWorkItems={[{ id: "w1", name: "Code A" }]}
      />,
    );

    fireEvent.click(screen.getByTestId("save"));

    await waitFor(() => expect(saveTimesheet).toHaveBeenCalled());

    // status should remain empty because save failed
    expect(screen.getByTestId("status").textContent).toBe("");
    expect(mockAddNotification).toHaveBeenCalled();
  });

  it("handleSubmit calls submitTimesheet and updates status on success", async () => {
    (submitTimesheet as jest.Mock).mockResolvedValue({
      success: true,
      status: "SUBMITTED",
    });

    render(
      <TestHarness
        selectedWeek={selectedWeek}
        initialTimeEntries={[{ id: "e1", hours: 8 }]}
        initialWorkItems={[{ id: "w1", name: "Code A" }]}
      />,
    );

    fireEvent.click(screen.getByTestId("submit"));

    await waitFor(() => expect(submitTimesheet).toHaveBeenCalled());
    await waitFor(() =>
      expect(screen.getByTestId("status").textContent).toBe("SUBMITTED"),
    );
    expect(mockAddNotification).toHaveBeenCalled();
  });

  it("handleSubmit handles null result and shows error notification", async () => {
    (submitTimesheet as jest.Mock).mockResolvedValue(null);

    render(
      <TestHarness
        selectedWeek={selectedWeek}
        initialTimeEntries={[{ id: "e1", hours: 8 }]}
        initialWorkItems={[{ id: "w1", name: "Code A" }]}
      />,
    );

    fireEvent.click(screen.getByTestId("submit"));

    await waitFor(() => expect(submitTimesheet).toHaveBeenCalled());
    // status remains empty and a notification is shown
    expect(screen.getByTestId("status").textContent).toBe("");
    expect(mockAddNotification).toHaveBeenCalled();
  });

  it("handleSubmit displays validation errors when present", async () => {
    (submitTimesheet as jest.Mock).mockResolvedValue({
      success: false,
      message: "Validation failed",
      validationErrors: [
        { message: "Week 1 under by 8h" },
        { message: "Week 2 over by 2h" },
      ],
    });

    render(
      <TestHarness
        selectedWeek={selectedWeek}
        initialTimeEntries={[{ id: "e1", hours: 8 }]}
        initialWorkItems={[{ id: "w1", name: "Code A" }]}
      />,
    );

    fireEvent.click(screen.getByTestId("submit"));

    await waitFor(() => expect(submitTimesheet).toHaveBeenCalled());
    // status should not change
    expect(screen.getByTestId("status").textContent).toBe("");
    // main validation notification + individual errors
    expect(mockAddNotification).toHaveBeenCalled();
    const calls = mockAddNotification.mock.calls.map((c) => c[0]);
    expect(calls.some((c) => c.title === "Timesheet validation failed")).toBe(
      true,
    );
    expect(
      calls.filter((c) => c.kind === "error").length,
    ).toBeGreaterThanOrEqual(3);
  });

  it("handleSubmit catches thrown error and notifies", async () => {
    (submitTimesheet as jest.Mock).mockRejectedValue(new Error("submit boom"));

    render(
      <TestHarness
        selectedWeek={selectedWeek}
        initialTimeEntries={[{ id: "e1", hours: 8 }]}
        initialWorkItems={[{ id: "w1", name: "Code A" }]}
      />,
    );

    fireEvent.click(screen.getByTestId("submit"));

    await waitFor(() => expect(submitTimesheet).toHaveBeenCalled());
    // status remains unchanged and error notification emitted
    expect(screen.getByTestId("status").textContent).toBe("");
    expect(mockAddNotification).toHaveBeenCalled();
  });

  it("handleCopyWeek merges work items and time entries and notifies", async () => {
    const fakeResult = {
      success: true,
      data: {
        workItems: [{ id: "w2", name: "Code B" }],
        timeEntries: [{ id: "te2", hours: 4, work_item_id: "w2" }],
      },
    };

    (getTimesheetByWeekEnding as jest.Mock).mockResolvedValue(fakeResult);

    render(
      <TestHarness
        selectedWeek={selectedWeek}
        initialTimeEntries={[{ id: "e1", hours: 8 }]}
        initialWorkItems={[{ id: "w1", name: "Code A" }]}
      />,
    );

    fireEvent.click(screen.getByTestId("copy"));

    await waitFor(() =>
      expect(getTimesheetByWeekEnding).toHaveBeenCalledWith(1),
    );

    // new work item id and time entry id should appear in the DOM representation
    await waitFor(() =>
      expect(screen.getByTestId("workItems").textContent).toContain("w2"),
    );
    await waitFor(() =>
      expect(screen.getByTestId("timeEntries").textContent).toContain("te2"),
    );
    expect(mockAddNotification).toHaveBeenCalled();
  });

  it("deleteEntry removes the time entry but keeps unrelated work items (hook logic)", async () => {
    render(
      <TestHarness
        selectedWeek={selectedWeek}
        initialTimeEntries={[{ id: "e1", hours: 8 }]}
        initialWorkItems={[{ id: "w1", name: "Code A" }]}
      />,
    );

    // initial time entry exists
    expect(screen.getByTestId("timeEntries").textContent).toContain("e1");

    fireEvent.click(screen.getByTestId("delete"));

    await waitFor(() =>
      expect(screen.getByTestId("timeEntries").textContent).toBe("[]"),
    );

    // the hook filters work items by comparing work item id to entry id string — so work item remains
    expect(screen.getByTestId("workItems").textContent).toContain("w1");
  });
});
