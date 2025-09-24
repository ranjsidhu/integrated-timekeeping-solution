import { render, screen } from "@testing-library/react";

describe("Example Component", () => {
  it("should render successfully", () => {
    // Arrange
    const expectedText = "Hello World";

    // Act
    render(<div>{expectedText}</div>);

    // Assert
    expect(screen.getByText(expectedText)).toBeInTheDocument();
  });

  it("should handle user interactions", () => {
    // Arrange
    const handleClick = jest.fn();

    // Act
    render(
      <button type="button" onClick={handleClick}>
        Click me
      </button>,
    );
    screen.getByText("Click me").click();

    // Assert
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
