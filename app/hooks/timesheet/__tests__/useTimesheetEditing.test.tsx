/** biome-ignore-all lint/suspicious/noExplicitAny: Unit tests */
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { useTimesheetEditing } from "../useTimesheetEditing";

type Day = any;

function TestHarness({ initialEntries }: { initialEntries: any[] }) {
  const [timeEntries, setTimeEntries] = useState(initialEntries);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const { editingValues, handleTempChange, handleCommit, toggleExpanded } =
    useTimesheetEditing(timeEntries, setTimeEntries);

  return (
    <div>
      <button
        type="button"
        data-testid="temp-3"
        onClick={() => handleTempChange("e1", "monday" as Day, "3")}
      />

      <button
        type="button"
        data-testid="temp-empty"
        onClick={() => handleTempChange("e1", "monday" as Day, "")}
      />

      <button
        type="button"
        data-testid="commit"
        onClick={() => handleCommit("e1", "monday" as Day)}
      />

      <button
        type="button"
        data-testid="commit-no-buffer"
        onClick={() => handleCommit("e2", "monday" as Day)}
      />

      <button
        type="button"
        data-testid="toggle"
        onClick={() => toggleExpanded(1, setExpandedRows)}
      />

      <div data-testid="editingValues">{JSON.stringify(editingValues)}</div>
      <div data-testid="timeEntries">{JSON.stringify(timeEntries)}</div>
      <div data-testid="expandedRows">
        {JSON.stringify(Array.from(expandedRows))}
      </div>
    </div>
  );
}

describe("useTimesheetEditing (DOM harness)", () => {
  it("handleTempChange stores temporary editing values and handleCommit applies them", async () => {
    const initialEntries = [
      { id: "e1", hours: { monday: 1, tuesday: 0 } },
      { id: "e2", hours: { monday: 4 } },
    ];

    render(<TestHarness initialEntries={initialEntries} />);

    // set a temporary value
    fireEvent.click(screen.getByTestId("temp-3"));

    await waitFor(() =>
      expect(screen.getByTestId("editingValues").textContent).toContain("3"),
    );

    // commit the temp value
    fireEvent.click(screen.getByTestId("commit"));

    await waitFor(() =>
      expect(screen.getByTestId("timeEntries").textContent).toContain(
        '"monday":3',
      ),
    );

    // editing values should no longer contain the committed string value
    expect(screen.getByTestId("editingValues").textContent).not.toContain("3");
  });

  it("handleCommit uses existing entry hours when no buffer is present", async () => {
    const initialEntries = [{ id: "e2", hours: { monday: 4 } }];

    render(<TestHarness initialEntries={initialEntries} />);

    fireEvent.click(screen.getByTestId("commit-no-buffer"));

    await waitFor(() =>
      expect(screen.getByTestId("timeEntries").textContent).toContain(
        '"monday":4',
      ),
    );
  });

  it("handleCommit with empty string sets value to 0", async () => {
    const initialEntries = [{ id: "e1", hours: { monday: 2 } }];

    render(<TestHarness initialEntries={initialEntries} />);

    // set an empty buffer and commit
    fireEvent.click(screen.getByTestId("temp-empty"));
    fireEvent.click(screen.getByTestId("commit"));

    await waitFor(() =>
      expect(screen.getByTestId("timeEntries").textContent).toContain(
        '"monday":0',
      ),
    );
  });

  it("toggleExpanded adds and removes the id from the set", async () => {
    const initialEntries: any[] = [];

    render(<TestHarness initialEntries={initialEntries} />);

    // toggle on
    fireEvent.click(screen.getByTestId("toggle"));
    await waitFor(() =>
      expect(screen.getByTestId("expandedRows").textContent).toContain("1"),
    );

    // toggle off
    fireEvent.click(screen.getByTestId("toggle"));
    await waitFor(() =>
      expect(screen.getByTestId("expandedRows").textContent).toBe("[]"),
    );
  });
});
