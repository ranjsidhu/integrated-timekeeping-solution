import { render, screen } from "@testing-library/react";
import type { MetricsCardProps } from "@/types/analytics.types";
import MetricsCard from "../MetricsCard";

describe("MetricsCard", () => {
  const mockIcon = (
    <svg role="img" aria-label="mock icon" data-testid="mock-icon">
      Icon
    </svg>
  );

  const defaultProps: MetricsCardProps = {
    title: "Test Metric",
    value: 100,
    icon: mockIcon,
    color: "blue",
  };

  describe("Rendering", () => {
    it("renders title correctly", () => {
      render(<MetricsCard {...defaultProps} />);

      expect(screen.getByText("Test Metric")).toBeInTheDocument();
    });

    it("renders value correctly when value is a number", () => {
      render(<MetricsCard {...defaultProps} value={100} />);

      expect(screen.getByText("100")).toBeInTheDocument();
    });

    it("renders value correctly when value is a string", () => {
      render(<MetricsCard {...defaultProps} value="95%" />);

      expect(screen.getByText("95%")).toBeInTheDocument();
    });

    it("renders icon correctly", () => {
      render(<MetricsCard {...defaultProps} />);

      expect(screen.getByTestId("mock-icon")).toBeInTheDocument();
    });

    it("renders without subtitle when subtitle is not provided", () => {
      render(<MetricsCard {...defaultProps} />);

      const container = screen.getByText("Test Metric").parentElement;
      expect(container?.children).toHaveLength(3); // icon container, value, title
    });

    it("renders with subtitle when subtitle is provided", () => {
      render(<MetricsCard {...defaultProps} subtitle="Last 30 days" />);

      expect(screen.getByText("Last 30 days")).toBeInTheDocument();
    });
  });

  describe("Color Variants", () => {
    it("applies blue color class correctly", () => {
      const { container } = render(
        <MetricsCard {...defaultProps} color="blue" />,
      );

      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain("bg-[#0f62fe]");
    });

    it("applies green color class correctly", () => {
      const { container } = render(
        <MetricsCard {...defaultProps} color="green" />,
      );

      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain("bg-[#24a148]");
    });

    it("applies purple color class correctly", () => {
      const { container } = render(
        <MetricsCard {...defaultProps} color="purple" />,
      );

      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain("bg-[#8a3ffc]");
    });

    it("applies dark color class correctly", () => {
      const { container } = render(
        <MetricsCard {...defaultProps} color="dark" />,
      );

      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain("bg-[#161616]");
    });

    it("applies consistent base classes for all color variants", () => {
      const colors: Array<"blue" | "green" | "purple" | "dark"> = [
        "blue",
        "green",
        "purple",
        "dark",
      ];

      for (const color of colors) {
        const { container, unmount } = render(
          <MetricsCard {...defaultProps} color={color} />,
        );

        const card = container.firstChild as HTMLElement;
        expect(card.className).toContain("rounded-lg");
        expect(card.className).toContain("p-6");
        expect(card.className).toContain("text-white");
        expect(card.className).toContain("shadow-sm");

        unmount();
      }
    });
  });

  describe("Layout and Structure", () => {
    it("renders card with correct structure", () => {
      const { container } = render(<MetricsCard {...defaultProps} />);

      const card = container.firstChild as HTMLElement;
      expect(card).toBeInTheDocument();
      expect(card.tagName).toBe("DIV");
    });

    it("renders icon container with correct styling", () => {
      render(<MetricsCard {...defaultProps} />);

      const iconContainer = screen.getByTestId("mock-icon")
        .parentElement as HTMLElement;
      expect(iconContainer.className).toContain("p-3");
      expect(iconContainer.className).toContain("bg-white/10");
      expect(iconContainer.className).toContain("rounded-lg");
    });

    it("renders value with correct text size", () => {
      render(<MetricsCard {...defaultProps} />);

      const valueElement = screen.getByText("100");
      expect(valueElement.className).toContain("text-3xl");
      expect(valueElement.className).toContain("font-semibold");
      expect(valueElement.className).toContain("mb-1");
    });

    it("renders title with correct styling", () => {
      render(<MetricsCard {...defaultProps} />);

      const titleElement = screen.getByText("Test Metric");
      expect(titleElement.className).toContain("text-white/80");
      expect(titleElement.className).toContain("text-sm");
    });

    it("renders subtitle with correct styling when provided", () => {
      render(<MetricsCard {...defaultProps} subtitle="Additional info" />);

      const subtitleElement = screen.getByText("Additional info");
      expect(subtitleElement.className).toContain("text-white/60");
      expect(subtitleElement.className).toContain("text-xs");
      expect(subtitleElement.className).toContain("mt-1");
    });
  });

  describe("Content Variations", () => {
    it("handles long title text", () => {
      const longTitle = "This is a very long metric title that might wrap";
      render(<MetricsCard {...defaultProps} title={longTitle} />);

      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it("handles large numeric values", () => {
      render(<MetricsCard {...defaultProps} value={1000000} />);

      expect(screen.getByText("1000000")).toBeInTheDocument();
    });

    it("handles decimal values", () => {
      render(<MetricsCard {...defaultProps} value={98.5} />);

      expect(screen.getByText("98.5")).toBeInTheDocument();
    });

    it("handles percentage string values", () => {
      render(<MetricsCard {...defaultProps} value="85.2%" />);

      expect(screen.getByText("85.2%")).toBeInTheDocument();
    });

    it("handles zero value", () => {
      render(<MetricsCard {...defaultProps} value={0} />);

      expect(screen.getByText("0")).toBeInTheDocument();
    });

    it("handles negative values", () => {
      render(<MetricsCard {...defaultProps} value={-15} />);

      expect(screen.getByText("-15")).toBeInTheDocument();
    });

    it("handles complex icon components", () => {
      const complexIcon = (
        <div data-testid="complex-icon">
          <svg role="img" aria-label="complex icon">
            <circle cx="50" cy="50" r="40" />
          </svg>
        </div>
      );

      render(<MetricsCard {...defaultProps} icon={complexIcon} />);

      expect(screen.getByTestId("complex-icon")).toBeInTheDocument();
    });

    it("handles long subtitle text", () => {
      const longSubtitle = "This is a longer subtitle with additional context";
      render(<MetricsCard {...defaultProps} subtitle={longSubtitle} />);

      expect(screen.getByText(longSubtitle)).toBeInTheDocument();
    });
  });

  describe("Props Updates", () => {
    it("updates when title prop changes", () => {
      const { rerender } = render(<MetricsCard {...defaultProps} />);

      expect(screen.getByText("Test Metric")).toBeInTheDocument();

      rerender(<MetricsCard {...defaultProps} title="Updated Metric" />);

      expect(screen.queryByText("Test Metric")).not.toBeInTheDocument();
      expect(screen.getByText("Updated Metric")).toBeInTheDocument();
    });

    it("updates when value prop changes", () => {
      const { rerender } = render(
        <MetricsCard {...defaultProps} value={100} />,
      );

      expect(screen.getByText("100")).toBeInTheDocument();

      rerender(<MetricsCard {...defaultProps} value={200} />);

      expect(screen.queryByText("100")).not.toBeInTheDocument();
      expect(screen.getByText("200")).toBeInTheDocument();
    });

    it("updates when color prop changes", () => {
      const { container, rerender } = render(
        <MetricsCard {...defaultProps} color="blue" />,
      );

      let card = container.firstChild as HTMLElement;
      expect(card.className).toContain("bg-[#0f62fe]");

      rerender(<MetricsCard {...defaultProps} color="green" />);

      card = container.firstChild as HTMLElement;
      expect(card.className).not.toContain("bg-[#0f62fe]");
      expect(card.className).toContain("bg-[#24a148]");
    });

    it("adds subtitle when it changes from undefined to defined", () => {
      const { rerender } = render(<MetricsCard {...defaultProps} />);

      expect(screen.queryByText("New subtitle")).not.toBeInTheDocument();

      rerender(<MetricsCard {...defaultProps} subtitle="New subtitle" />);

      expect(screen.getByText("New subtitle")).toBeInTheDocument();
    });

    it("removes subtitle when it changes from defined to undefined", () => {
      const { rerender } = render(
        <MetricsCard {...defaultProps} subtitle="Subtitle text" />,
      );

      expect(screen.getByText("Subtitle text")).toBeInTheDocument();

      rerender(<MetricsCard {...defaultProps} subtitle={undefined} />);

      expect(screen.queryByText("Subtitle text")).not.toBeInTheDocument();
    });
  });
});
