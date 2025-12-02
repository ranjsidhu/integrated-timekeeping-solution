/** biome-ignore-all lint/suspicious/noExplicitAny:Unit tests */
import { fireEvent, render, screen } from "@testing-library/react";
import Category from "./Category";

describe("Category component", () => {
  const sample = {
    id: 1,
    category_name: "Design",
    description: "Design work",
  } as any;

  it("renders name and description", () => {
    render(
      <Category category={sample} onSelect={() => {}} isSelected={false} />,
    );

    expect(screen.getByText("Design")).toBeInTheDocument();
    expect(screen.getByText("Design work")).toBeInTheDocument();
  });

  it("calls onSelect with category when clicked", () => {
    const onSelect = jest.fn();
    render(
      <Category category={sample} onSelect={onSelect} isSelected={false} />,
    );

    fireEvent.click(screen.getByRole("button"));

    expect(onSelect).toHaveBeenCalledWith(sample);
  });

  it("applies selected classes when isSelected is true", () => {
    render(
      <Category category={sample} onSelect={() => {}} isSelected={true} />,
    );

    const btn = screen.getByRole("button");
    expect(btn.className).toContain("border-[#0f62fe]");
    expect(btn.className).toContain("bg-[#e0e0e0]");
  });

  it("applies unselected classes when isSelected is false", () => {
    render(
      <Category category={sample} onSelect={() => {}} isSelected={false} />,
    );

    const btn = screen.getByRole("button");
    expect(btn.className).toContain("border-[#e0e0e0]");
    expect(btn.className).toContain("bg-white");
  });
});
