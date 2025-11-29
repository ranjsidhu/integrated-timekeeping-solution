import { fireEvent, render, screen } from "@testing-library/react";
import { useSelectedWeek, WeekProvider } from "@/app/providers/WeekProvider";
import type { WeekEnding } from "@/types/timesheet.types";

describe("WeekProvider", () => {
  test("useSelectedWeek throws when used outside WeekProvider", () => {
    const Consumer = () => {
      // This should throw because there's no provider
      useSelectedWeek();
      return null;
    };

    expect(() => render(<Consumer />)).toThrow(
      "useSelectedWeek must be used within WeekProvider",
    );
  });

  test("setSelectedWeek updates selectedWeek state", () => {
    const sampleWeek = {
      id: 42,
      week_ending: new Date().toISOString(),
    } as unknown as WeekEnding;

    const Consumer = () => {
      const { selectedWeek, setSelectedWeek } = useSelectedWeek();
      return (
        <div>
          <div data-testid="week">
            {selectedWeek ? String(selectedWeek.id) : "null"}
          </div>
          <button
            data-testid="set"
            onClick={() => setSelectedWeek(sampleWeek)}
            type="button"
          >
            Set
          </button>
        </div>
      );
    };

    render(
      <WeekProvider>
        <Consumer />
      </WeekProvider>,
    );

    expect(screen.getByTestId("week").textContent).toBe("null");
    fireEvent.click(screen.getByTestId("set"));
    expect(screen.getByTestId("week").textContent).toBe("42");
  });
});
