/** biome-ignore-all lint/suspicious/noExplicitAny: Unit tests */
/** biome-ignore-all assist/source/organizeImports: Unit tests */
import { render, screen, fireEvent } from "@testing-library/react";

// Mock Category to control selection behavior without rendering the real component
jest.mock("../../../Category/Category", () => (props: any) => {
  const { category, onSelect, isSelected } = props;
  return (
    <button
      type="button"
      data-testid={`category-${category.id}`}
      onClick={() => onSelect(category)}
      className={isSelected ? "selected" : ""}
    >
      {category.category_name}
    </button>
  );
});

// Mock Button to avoid any external UI lib and can query by children text
jest.mock("../../../Button/Button", () => (props: any) => {
  const children = String(props.children ?? "");
  return (
    <button
      type="button"
      data-testid={`button-${children.toLowerCase()}`}
      onClick={props.onClick}
      disabled={props.disabled}
    >
      {props.children}
    </button>
  );
});

import AddEntryStep1 from "../AddEntryStep1";
import type { Category } from "@/types/forecast.types";

describe("AddEntryStep1", () => {
  const productive: Category = {
    id: 1,
    category_name: "ProdCat",
    assignment_type: "Productive",
    description: "",
  };
  const nonProd: Category = {
    id: 2,
    category_name: "NonProdCat",
    assignment_type: "Non-Productive",
    description: "",
  };

  it("renders headings and groups categories", () => {
    render(
      <AddEntryStep1
        categories={[productive, nonProd]}
        onNext={jest.fn()}
        onCancel={jest.fn()}
      />,
    );

    expect(screen.getByText(/Select Assignment Type/i)).toBeInTheDocument();
    // assert the exact 'Productive' heading (avoid matching 'Non-Productive')
    expect(screen.getByText(/^Productive$/)).toBeInTheDocument();
    expect(screen.getByText(/Non-Productive or Timeaway/i)).toBeInTheDocument();

    // category buttons should be present
    expect(screen.getByTestId("category-1")).toBeInTheDocument();
    expect(screen.getByTestId("category-2")).toBeInTheDocument();
  });

  it("calls onCancel when Cancel clicked", () => {
    const onCancel = jest.fn();
    render(
      <AddEntryStep1
        categories={[productive]}
        onNext={jest.fn()}
        onCancel={onCancel}
      />,
    );

    const cancel = screen.getByTestId("button-cancel");
    fireEvent.click(cancel);

    expect(onCancel).toHaveBeenCalled();
  });

  it("does not call onNext when no category selected and Next clicked", () => {
    const onNext = jest.fn();
    render(
      <AddEntryStep1
        categories={[productive]}
        onNext={onNext}
        onCancel={jest.fn()}
      />,
    );

    const next = screen.getByTestId("button-next");
    // Next starts disabled
    expect(next).toBeDisabled();

    fireEvent.click(next);
    expect(onNext).not.toHaveBeenCalled();
  });

  it("selects category and calls onNext with category_id", () => {
    const onNext = jest.fn();
    render(
      <AddEntryStep1
        categories={[productive, nonProd]}
        onNext={onNext}
        onCancel={jest.fn()}
      />,
    );

    const prodBtn = screen.getByTestId("category-1");
    fireEvent.click(prodBtn);

    // Next should now be enabled
    const next = screen.getByTestId("button-next");
    expect(next).not.toBeDisabled();

    fireEvent.click(next);

    expect(onNext).toHaveBeenCalledWith({ category_id: 1 });
  });

  it("shows selected class on the chosen category", () => {
    render(
      <AddEntryStep1
        categories={[productive, nonProd]}
        onNext={jest.fn()}
        onCancel={jest.fn()}
      />,
    );

    const prodBtn = screen.getByTestId("category-1");
    const nonProdBtn = screen.getByTestId("category-2");

    // initially none selected
    expect(prodBtn.className).not.toContain("selected");

    fireEvent.click(prodBtn);
    expect(prodBtn.className).toContain("selected");
    // other button remains unselected
    expect(nonProdBtn.className).not.toContain("selected");
  });
});
