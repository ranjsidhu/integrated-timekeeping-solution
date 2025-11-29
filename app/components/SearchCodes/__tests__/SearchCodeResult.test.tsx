import { fireEvent, render, screen } from "@testing-library/react";

// Mock next/router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

import { useRouter } from "next/navigation";
import SearchCodeResult from "@/app/components/SearchCodes/SearchCodeResult";

describe("SearchCodeResult", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("selecting a code calls router.push with /timesheet", () => {
    const mockPush = jest.fn();

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

    expect(mockPush).toHaveBeenCalledWith("/timesheet");
  });
});
