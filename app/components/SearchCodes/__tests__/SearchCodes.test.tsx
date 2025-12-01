import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import type { CodeWithWorkItems } from "@/types/timesheet.types";

jest.mock("@/app/components", () => {
  const React = require("react");
  type P = { value?: string; onChange?: (e: Event) => void } & Record<
    string,
    unknown
  >;
  return {
    Search: (props: P) =>
      React.createElement("input", {
        "data-testid": "search-input",
        value: props.value,
        onChange: props.onChange,
      }),
  };
});

// Mock the action that fetches codes
jest.mock("@/app/actions", () => ({
  getCodesBySearch: jest.fn(),
}));

// Mock the SearchCodeResult to render a simple representation
jest.mock("@/app/components/SearchCodes/SearchCodeResult", () => ({
  __esModule: true,
  default: ({ code }: { code: { code: string } }) =>
    React.createElement("div", { "data-testid": "code-result" }, code.code),
}));

import { getCodesBySearch } from "@/app/actions";
import SearchCodes from "@/app/components/SearchCodes/SearchCodes";

describe("SearchCodes", () => {
  beforeEach(() => {
    (getCodesBySearch as jest.Mock).mockReset();
  });

  test("calls getCodesBySearch after searchTerm was already >=3 chars", async () => {
    const results = [{ id: 1, code: "C1", work_items: [] }];
    (
      getCodesBySearch as jest.MockedFunction<typeof getCodesBySearch>
    ).mockImplementationOnce(() =>
      Promise.resolve(results as unknown as CodeWithWorkItems[]),
    );

    render(<SearchCodes />);

    const input = screen.getByTestId("search-input");

    // first type 'abc' -> sets internal searchTerm to 'abc' but does NOT call getCodesBySearch yet
    fireEvent.change(input, { target: { value: "abc" } });

    // now extend to 'abcd' -> handler will see previous searchTerm length >= 3 and call getCodesBySearch
    fireEvent.change(input, { target: { value: "abcd" } });

    await waitFor(() => expect(getCodesBySearch).toHaveBeenCalledWith("abcd"));

    // SearchCodeResult should render our mocked result
    expect(await screen.findByTestId("code-result")).toHaveTextContent("C1");
  });

  test("clears results when input becomes empty", async () => {
    render(<SearchCodes />);
    const input = screen.getByTestId("search-input");

    // type non-empty then clear
    fireEvent.change(input, { target: { value: "x" } });
    fireEvent.change(input, { target: { value: "" } });

    // no code results should be present
    expect(screen.queryByTestId("code-result")).toBeNull();
    expect(getCodesBySearch).not.toHaveBeenCalled();
  });
});
