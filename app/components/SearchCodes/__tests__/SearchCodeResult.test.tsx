// biome-ignore assist/source/organizeImports: Unit tests
import { fireEvent, render, screen } from "@testing-library/react";

// Mock next/router and the provider hook
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/app/providers", () => ({
  useSelectedCode: jest.fn(),
}));

import { useRouter } from "next/navigation";
import { useSelectedCode } from "@/app/providers";
import SearchCodeResult from "@/app/components/SearchCodes/SearchCodeResult";

describe("SearchCodeResult", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("selecting a code calls setCode, addWorkItems and navigates when work_items exist", () => {
    const mockSetCode = jest.fn();
    const mockAddWorkItems = jest.fn();
    const mockPush = jest.fn();

    (useSelectedCode as jest.Mock).mockReturnValue({
      setCode: mockSetCode,
      addWorkItems: mockAddWorkItems,
    });
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });

    const code = {
      id: 1,
      code: "C1",
      description: "Desc",
      work_items: [{ id: 11 }],
    } as unknown as Parameters<typeof SearchCodeResult>[0]["code"];

    render(<SearchCodeResult code={code} />);

    const node = screen.getByText("C1 - Desc");
    fireEvent.click(node);

    expect(mockSetCode).toHaveBeenCalledWith(code);
    expect(mockAddWorkItems).toHaveBeenCalledWith(
      (code as unknown as { work_items?: unknown[] }).work_items,
    );
    expect(mockPush).toHaveBeenCalledWith("/timesheet");
  });

  test("selecting a code without work_items calls setCode and navigates but not addWorkItems", () => {
    const mockSetCode = jest.fn();
    const mockAddWorkItems = jest.fn();
    const mockPush = jest.fn();

    (useSelectedCode as jest.Mock).mockReturnValue({
      setCode: mockSetCode,
      addWorkItems: mockAddWorkItems,
    });
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });

    const code = {
      id: 2,
      code: "C2",
      description: "NoItems",
      work_items: [],
    } as unknown as Parameters<typeof SearchCodeResult>[0]["code"];

    render(<SearchCodeResult code={code} />);

    const node = screen.getByText("C2 - NoItems");
    // also exercise keyboard handler
    fireEvent.keyDown(node, { key: "Enter", code: "Enter" });

    expect(mockSetCode).toHaveBeenCalledWith(code);
    expect(mockAddWorkItems).not.toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith("/timesheet");
  });
});
