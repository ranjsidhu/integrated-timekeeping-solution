/** biome-ignore-all assist/source/organizeImports: Unit tests */
/** biome-ignore-all lint/style/noNonNullAssertion: Unit tests */
/** biome-ignore-all lint/suspicious/noExplicitAny: Unit tests */
import { render, screen, fireEvent } from "@testing-library/react";

// Mock icons from carbon icons
jest.mock("@carbon/icons-react", () => ({
  Add: () => <span data-testid="icon-add" />,
  Grid: () => <span data-testid="icon-grid" />,
  List: () => <span data-testid="icon-list" />,
  Save: () => <span data-testid="icon-save" />,
}));

// Mock Tag from @carbon/react
jest.mock("@carbon/react", () => ({
  Tag: (props: any) => <div data-testid="tag">{props.children}</div>,
}));

// Mock Button component used by ForecastHeader
jest.mock("../../Button/Button", () => (props: any) => (
  <button
    type="button"
    data-testid={`button-${String(props.children).toLowerCase()}`}
    onClick={props.onClick}
    disabled={props.disabled}
  >
    {props.renderIcon ? (
      <span
        data-testid={`button-icon-${String(props.children).toLowerCase()}`}
      />
    ) : null}
    {props.children}
  </button>
));

import ForecastHeader from "../ForecastHeader";
import { viewModeClassnames } from "@/utils/forecast/forecast.utils";

describe("ForecastHeader", () => {
  it("renders title, status tag and action buttons", () => {
    const onViewModeChange = jest.fn();
    const onAddEntry = jest.fn();
    const onSave = jest.fn();
    const onSubmit = jest.fn();

    render(
      <ForecastHeader
        status="Submitted"
        viewMode="timeline"
        onViewModeChange={onViewModeChange}
        onAddEntry={onAddEntry}
        onSave={onSave}
        onSubmit={onSubmit}
      />,
    );

    expect(screen.getByText(/My Hours Plan/)).toBeInTheDocument();
    expect(screen.getByTestId("tag")).toHaveTextContent("Submitted");

    // Buttons (mocked) should exist
    expect(screen.getByTestId("button-add entry")).toBeInTheDocument();
    expect(screen.getByTestId("button-save")).toBeInTheDocument();
    expect(screen.getByTestId("button-submit")).toBeInTheDocument();
  });

  it("toggles view mode and calls handlers", () => {
    const onViewModeChange = jest.fn();
    const onAddEntry = jest.fn();
    const onSave = jest.fn();
    const onSubmit = jest.fn();

    render(
      <ForecastHeader
        status="Draft"
        viewMode="timeline"
        onViewModeChange={onViewModeChange}
        onAddEntry={onAddEntry}
        onSave={onSave}
        onSubmit={onSubmit}
      />,
    );

    // find the grid and list icon elements and their parent buttons
    const gridIcon = screen.getByTestId("icon-grid");
    const listIcon = screen.getByTestId("icon-list");

    const gridBtn = gridIcon.closest("button");
    const listBtn = listIcon.closest("button");

    expect(gridBtn).toBeTruthy();
    expect(listBtn).toBeTruthy();

    // grid (timeline) is selected initially
    expect(gridBtn).toHaveClass(viewModeClassnames.selectedClassname);

    // click list button
    fireEvent.click(listBtn!);
    expect(onViewModeChange).toHaveBeenCalledWith("list");

    // click grid button
    fireEvent.click(gridBtn!);
    expect(onViewModeChange).toHaveBeenCalledWith("timeline");
  });

  it("action buttons call their handlers", () => {
    const onViewModeChange = jest.fn();
    const onAddEntry = jest.fn();
    const onSave = jest.fn();
    const onSubmit = jest.fn();

    render(
      <ForecastHeader
        status="Draft"
        viewMode="list"
        onViewModeChange={onViewModeChange}
        onAddEntry={onAddEntry}
        onSave={onSave}
        onSubmit={onSubmit}
      />,
    );

    fireEvent.click(screen.getByTestId("button-add entry"));
    fireEvent.click(screen.getByTestId("button-save"));
    fireEvent.click(screen.getByTestId("button-submit"));

    expect(onAddEntry).toHaveBeenCalled();
    expect(onSave).toHaveBeenCalled();
    expect(onSubmit).toHaveBeenCalled();
  });
});
