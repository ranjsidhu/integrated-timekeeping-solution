/** biome-ignore-all assist/source/organizeImports: Unit tests */
/** biome-ignore-all lint/suspicious/noExplicitAny: Unit tests */

import { fireEvent, render, screen } from "@testing-library/react";

// Mock @carbon/react components used by Header to avoid ESM parsing issues
jest.mock("@carbon/react", () => {
  return {
    HeaderContainer: (props: any) => props.render(),
    Header: (props: any) => (
      <div data-testid={props["data-testid"]}>{props.children}</div>
    ),
    SkipToContent: () => <div data-testid="skip-to-content" />,
    HeaderMenuButton: (props: any) => (
      <button
        type="button"
        data-testid={props["data-testid"]}
        aria-expanded={props["aria-expanded"]}
        aria-label={props["aria-label"]}
        onClick={props.onClick}
      />
    ),
    HeaderName: (props: any) => (
      <a href={props.href} data-testid={props["data-testid"]}>
        {props.children}
      </a>
    ),
    HeaderNavigation: (props: any) => (
      <nav data-testid={props["data-testid"]}>{props.children}</nav>
    ),
    HeaderGlobalBar: (props: any) => (
      <div data-testid={props["data-testid"]}>{props.children}</div>
    ),
    HeaderGlobalAction: (props: any) => (
      <div data-testid={props["data-testid"]}>{props.children}</div>
    ),
    SideNav: (props: any) => (
      <nav data-testid={props["data-testid"]}>{props.children}</nav>
    ),
    SideNavItems: (props: any) => (
      <div data-testid={props["data-testid"]}>{props.children}</div>
    ),
    HeaderSideNavItems: (props: any) => (
      <div data-testid={props["data-testid"]}>{props.children}</div>
    ),
  };
});

// Mock next/navigation and next-auth/react hooks
jest.mock("next/navigation", () => ({ usePathname: jest.fn() }));
jest.mock("next-auth/react", () => ({ useSession: jest.fn() }));

// Mock DisplayLinks (relative to Header file)
jest.mock("../DisplayLinks", () => () => <div data-testid="display-links" />);

import Header from "../Header";
const { usePathname } = require("next/navigation");
const { useSession } = require("next-auth/react");

describe("Header component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders header and displays initials from session", () => {
    (usePathname as jest.Mock).mockReturnValue("/");
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { name: "Alice Bob" } },
    });

    render(<Header />);

    expect(screen.getByTestId("header-container")).toBeInTheDocument();
    expect(screen.getByTestId("header-name")).toHaveAttribute("href", "/");
    // Initials "AB" should be rendered inside header-global-action
    expect(screen.getByText("AB")).toBeInTheDocument();
    // DisplayLinks is present (may appear multiple times: nav + side-nav)
    expect(
      screen.getAllByTestId("display-links").length,
    ).toBeGreaterThanOrEqual(1);
  });

  it("does not render header on /login path", () => {
    (usePathname as jest.Mock).mockReturnValue("/login");
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { name: "Test" } },
    });

    render(<Header />);

    expect(screen.queryByTestId("header-container")).toBeNull();
  });

  it("toggles side nav when menu button is clicked", () => {
    (usePathname as jest.Mock).mockReturnValue("/");
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { name: "Toggle Test" } },
    });

    render(<Header />);

    const button = screen.getByTestId("header-menu-button");
    // initially false
    expect(button.getAttribute("aria-expanded")).toBe("false");

    fireEvent.click(button);

    // after click should be true
    expect(button.getAttribute("aria-expanded")).toBe("true");
  });
});
