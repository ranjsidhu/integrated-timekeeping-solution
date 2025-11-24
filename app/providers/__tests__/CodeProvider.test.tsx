import { fireEvent, render, screen } from "@testing-library/react";
import { CodeProvider, useSelectedCode } from "@/app/providers/CodeProvider";
import type { CodeWithWorkItems } from "@/types/timesheet.types";

describe("CodeProvider", () => {
  test("useSelectedCode throws when used outside CodeProvider", () => {
    const Consumer = () => {
      // This should throw because there's no provider
      useSelectedCode();
      return null;
    };

    expect(() => render(<Consumer />)).toThrow(
      "useSelectedCode must be used within CodeProvider",
    );
  });

  test("setCode updates code state", () => {
    const sampleCode = {
      id: 42,
      code: "SAMPLE",
      work_items: [],
    } as unknown as CodeWithWorkItems;

    const Consumer = () => {
      const { code, setCode } = useSelectedCode();
      return (
        <div>
          <div data-testid="code">{code ? String(code.id) : "null"}</div>
          <button
            data-testid="set"
            onClick={() => setCode(sampleCode)}
            type="button"
          >
            Set
          </button>
        </div>
      );
    };

    render(
      <CodeProvider>
        <Consumer />
      </CodeProvider>,
    );

    expect(screen.getByTestId("code").textContent).toBe("null");
    fireEvent.click(screen.getByTestId("set"));
    expect(screen.getByTestId("code").textContent).toBe("42");
  });

  test("addWorkItems appends and deduplicates, clearWorkItems empties, filterWorkItems keeps matching code_id", () => {
    const itemsA = [
      { id: 1, code_id: 10, description: "one" },
      { id: 2, code_id: 20, description: "two" },
    ] as unknown as CodeWithWorkItems["work_items"];

    const itemsDup = [
      { id: 1, code_id: 10, description: "one" },
    ] as unknown as CodeWithWorkItems["work_items"];

    const Consumer = () => {
      const { workItems, addWorkItems, clearWorkItems, filterWorkItems } =
        useSelectedCode();

      return (
        <div>
          <div data-testid="work">{JSON.stringify(workItems)}</div>
          <button
            type="button"
            data-testid="add"
            onClick={() => addWorkItems(itemsA)}
          >
            Add
          </button>
          <button
            type="button"
            data-testid="addDup"
            onClick={() => addWorkItems(itemsDup)}
          >
            AddDup
          </button>
          <button
            type="button"
            data-testid="clear"
            onClick={() => clearWorkItems()}
          >
            Clear
          </button>
          <button
            type="button"
            data-testid="filter"
            onClick={() => filterWorkItems(20)}
          >
            Filter20
          </button>
        </div>
      );
    };

    render(
      <CodeProvider>
        <Consumer />
      </CodeProvider>,
    );

    // Initially empty
    expect(screen.getByTestId("work").textContent).toBe("[]");

    // Add two items
    fireEvent.click(screen.getByTestId("add"));
    expect(screen.getByTestId("work").textContent).toContain('"id":1');
    expect(screen.getByTestId("work").textContent).toContain('"id":2');

    // Adding a duplicate by id should not create a new entry
    fireEvent.click(screen.getByTestId("addDup"));
    const parsedAfterDup = JSON.parse(
      screen.getByTestId("work").textContent || "[]",
    ) as Array<{
      id: number;
      code_id: number;
    }>;
    const ids = parsedAfterDup.map((w) => w.id);
    expect(ids.filter((i) => i === 1).length).toBe(1);

    // Filtering to code_id 20 should leave only the item with code_id 20
    fireEvent.click(screen.getByTestId("filter"));
    const parsedAfterFilter = JSON.parse(
      screen.getByTestId("work").textContent || "[]",
    ) as Array<{
      id: number;
      code_id: number;
    }>;
    expect(parsedAfterFilter.every((w) => w.code_id === 20)).toBe(true);

    // Clearing should empty the list
    fireEvent.click(screen.getByTestId("clear"));
    expect(screen.getByTestId("work").textContent).toBe("[]");
  });
});
