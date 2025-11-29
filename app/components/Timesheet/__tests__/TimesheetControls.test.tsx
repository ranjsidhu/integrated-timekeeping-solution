import { fireEvent, render, screen } from "@testing-library/react";
import type { WeekEnding } from "@/types/timesheet.types";

// Mock the Dropdown used inside TimesheetControls so we can trigger onChange
jest.mock("@/app/components/Dropdown/Dropdown", () => {
  const React = require("react");
  type DropdownProps = {
    label?: string;
    items?: unknown[];
    onChange?: (arg: { selectedItem?: unknown }) => void;
  };

  return {
    __esModule: true,
    default: (props: DropdownProps) =>
      React.createElement(
        "button",
        {
          type: "button",
          onClick: () => props.onChange?.({ selectedItem: props.items?.[0] }),
        },
        props.label || "dropdown",
      ),
  };
});

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

import { useRouter } from "next/navigation";
import TimesheetControls from "@/app/components/Timesheet/TimesheetControls";

describe("TimesheetControls", () => {
  test("renders selected week label and Add bill code button", () => {
    const selectedWeek: WeekEnding = {
      id: 2,
      label: "Nov 28",
      week_ending: new Date("2025-11-28"),
      status: "Draft",
    } as WeekEnding;

    const setSelectedWeek = jest.fn();

    // mock router but we won't assert push in this test
    (useRouter as jest.Mock).mockReturnValue({ push: jest.fn() });

    render(
      <TimesheetControls
        selectedWeek={selectedWeek}
        setSelectedWeek={setSelectedWeek}
        weekEndings={[selectedWeek]}
      />,
    );

    expect(screen.getByText("Nov 28")).toBeInTheDocument();
    expect(screen.getByText("Add bill code")).toBeInTheDocument();
    expect(screen.getByText("Copy previous week")).toBeInTheDocument();
  });

  test("clicking Add bill code navigates to /search", () => {
    const selectedWeek: WeekEnding = {
      id: 2,
      label: "Nov 28",
      week_ending: new Date("2025-11-28"),
      status: "Draft",
    } as WeekEnding;

    const setSelectedWeek = jest.fn();
    const mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });

    render(
      <TimesheetControls
        selectedWeek={selectedWeek}
        setSelectedWeek={setSelectedWeek}
        weekEndings={[selectedWeek]}
      />,
    );

    fireEvent.click(screen.getByText("Add bill code"));
    expect(mockPush).toHaveBeenCalledWith("/search");
  });

  test("selecting a week from dropdown calls setSelectedWeek", () => {
    const selectedWeek: WeekEnding = {
      id: 2,
      label: "Nov 28",
      week_ending: new Date("2025-11-28"),
      status: "Draft",
    } as WeekEnding;

    const setSelectedWeek = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: jest.fn() });

    render(
      <TimesheetControls
        selectedWeek={selectedWeek}
        setSelectedWeek={setSelectedWeek}
        weekEndings={[selectedWeek]}
      />,
    );

    // our mocked Dropdown renders a button with the label which triggers onChange
    fireEvent.click(screen.getByText("Nov 28"));
    expect(setSelectedWeek).toHaveBeenCalledWith(selectedWeek);
  });

  test("copy previous week popover shows weeks and calls onCopyWeek", () => {
    const selectedWeek: WeekEnding = {
      id: 3,
      label: "Nov 28",
      week_ending: new Date("2025-11-28"),
      status: "Draft",
    } as WeekEnding;

    const previousWeek: WeekEnding = {
      id: 2,
      label: "Nov 21",
      week_ending: new Date("2025-11-21"),
      status: "Submitted",
    } as WeekEnding;

    const setSelectedWeek = jest.fn();
    const onCopyWeek = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: jest.fn() });

    render(
      <TimesheetControls
        selectedWeek={selectedWeek}
        setSelectedWeek={setSelectedWeek}
        weekEndings={[previousWeek, selectedWeek]}
        onCopyWeek={onCopyWeek}
      />,
    );

    // open the popover by clicking the tertiary button
    const copyBtn = screen.getByText("Copy previous week");
    fireEvent.click(copyBtn);

    // previous week entry should be rendered and clickable
    const prevBtn = screen.getByText("Nov 21");
    expect(prevBtn).toBeInTheDocument();

    fireEvent.click(prevBtn);
    expect(onCopyWeek).toHaveBeenCalledWith(previousWeek);
  });
});
