import { render, screen } from "@testing-library/react";
import Layout from "./Layout";

describe("Layout component", () => {
  it("renders the header with the IBM prefix and title", () => {
    render(
      <Layout>
        <div>Child content</div>
      </Layout>,
    );

    // The HeaderName renders visible text 'IBM' prefix and the title
    expect(screen.getByText(/Integrated Timekeeping/i)).toBeInTheDocument();
    expect(screen.getByText(/IBM/i)).toBeInTheDocument();
  });

  it("renders children passed to it", () => {
    render(
      <Layout>
        <div data-testid="child">Child content</div>
      </Layout>,
    );

    expect(screen.getByTestId("child")).toHaveTextContent("Child content");
  });

  it("has a link to the home page", () => {
    render(
      <Layout>
        <span />
      </Layout>,
    );

    const link = screen.getByRole("link", { name: /Integrated Timekeeping/i });
    expect(link).toHaveAttribute("href", "/");
  });
});
