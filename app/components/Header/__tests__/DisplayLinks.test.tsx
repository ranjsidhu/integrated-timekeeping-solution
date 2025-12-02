/** biome-ignore-all assist/source/organizeImports: Unit tests */
import { render, screen } from "@testing-library/react";

// Mock next/navigation usePathname
jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

// Mock Carbon HeaderMenuItem to render a simple element
jest.mock("@carbon/react", () => ({
  // biome-ignore lint/suspicious/noExplicitAny: Unit tests
  HeaderMenuItem: (props: any) => (
    <a
      href={props.href}
      data-testid={props["data-testid"]}
      aria-current={props.isActive ? "page" : undefined}
    >
      {props.children}
    </a>
  ),
}));

import { ROUTES } from "@/utils/general";
import DisplayLinks from "@/app/components/Header/DisplayLinks";
const { usePathname } = require("next/navigation");

describe("DisplayLinks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders all routes as HeaderMenuItem links", () => {
    (usePathname as jest.Mock).mockReturnValue("/somewhere");

    render(<DisplayLinks />);

    for (const route of ROUTES) {
      const testId = `header-menu-item-${route.label.toLowerCase()}`;
      expect(screen.getByTestId(testId)).toBeInTheDocument();
      expect(screen.getByTestId(testId)).toHaveAttribute("href", route.href);
    }
  });

  it("marks the active route based on pathname", () => {
    (usePathname as jest.Mock).mockReturnValue("/forecast");

    render(<DisplayLinks />);

    const active = screen.getByTestId("header-menu-item-forecast");
    expect(active).toBeInTheDocument();
    expect(active).toHaveAttribute("aria-current", "page");
  });
});
