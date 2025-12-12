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

  it("renders header and displays initials from session on non-root paths", () => {
    (usePathname as jest.Mock).mockReturnValue("/timesheet");
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { name: "Alice Bob" } },
    });

    render(<Header />);

    expect(screen.getByTestId("header-container")).toBeInTheDocument();
    expect(screen.getByTestId("header-name")).toHaveAttribute("href", "/");
    // Initials "AB" should be rendered inside header-global-action
    expect(screen.getByText("AB")).toBeInTheDocument();
    // SkipToContent should be rendered
    expect(screen.getByTestId("skip-to-content")).toBeInTheDocument();
    // Menu button should be present
    expect(screen.getByTestId("header-menu-button")).toBeInTheDocument();
  });

  it("does not render header navigation and global bar on root path /", () => {
    (usePathname as jest.Mock).mockReturnValue("/");
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { name: "Root User" } },
    });

    render(<Header />);

    // On root path, navigation elements should not be rendered
    expect(screen.queryByTestId("header-navigation")).not.toBeInTheDocument();
    expect(screen.queryByTestId("header-global-bar")).not.toBeInTheDocument();
    expect(screen.queryByTestId("header-side-nav")).not.toBeInTheDocument();
  });

  it("renders header navigation and global bar on non-root paths", () => {
    (usePathname as jest.Mock).mockReturnValue("/timesheet");
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { name: "Test User" } },
    });

    render(<Header />);

    expect(screen.getByTestId("header-navigation")).toBeInTheDocument();
    expect(screen.getByTestId("header-global-bar")).toBeInTheDocument();
    expect(screen.getByTestId("header-side-nav")).toBeInTheDocument();
    expect(
      screen.getByTestId("header-global-action-initials"),
    ).toBeInTheDocument();
    expect(screen.getByText("TU")).toBeInTheDocument();
  });

  it("renders header on /login path with navigation", () => {
    (usePathname as jest.Mock).mockReturnValue("/login");
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { name: "Test" } },
    });

    render(<Header />);

    // Header container is always rendered
    expect(screen.getByTestId("header-container")).toBeInTheDocument();
    // Navigation elements are rendered on any non-root path (including /login)
    expect(screen.getByTestId("header-navigation")).toBeInTheDocument();
    expect(screen.getByTestId("header-global-bar")).toBeInTheDocument();
  });

  it("toggles side nav when menu button is clicked", () => {
    (usePathname as jest.Mock).mockReturnValue("/timesheet");
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { name: "Toggle Test" } },
    });

    render(<Header />);

    const button = screen.getByTestId("header-menu-button");
    // initially false
    expect(button.getAttribute("aria-expanded")).toBe("false");
    expect(button.getAttribute("aria-label")).toBe("Open menu");

    fireEvent.click(button);

    // after click should be true
    expect(button.getAttribute("aria-expanded")).toBe("true");
    expect(button.getAttribute("aria-label")).toBe("Close menu");
  });

  it("toggles menu button aria-label correctly on multiple clicks", () => {
    (usePathname as jest.Mock).mockReturnValue("/forecast");
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { name: "Multi Click Test" } },
    });

    render(<Header />);

    const button = screen.getByTestId("header-menu-button");

    // First click - open
    fireEvent.click(button);
    expect(button.getAttribute("aria-label")).toBe("Close menu");
    expect(button.getAttribute("aria-expanded")).toBe("true");

    // Second click - close
    fireEvent.click(button);
    expect(button.getAttribute("aria-label")).toBe("Open menu");
    expect(button.getAttribute("aria-expanded")).toBe("false");
  });

  it("renders DisplayLinks in both navigation and side nav on non-root paths", () => {
    (usePathname as jest.Mock).mockReturnValue("/search");
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { name: "Links Test" } },
    });

    render(<Header />);

    // DisplayLinks should appear twice: in HeaderNavigation and in HeaderSideNavItems
    const displayLinks = screen.getAllByTestId("display-links");
    expect(displayLinks).toHaveLength(2);
  });

  it("renders SideNav with correct properties", () => {
    (usePathname as jest.Mock).mockReturnValue("/timesheet");
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { name: "Side Nav Test" } },
    });

    render(<Header />);

    const sideNav = screen.getByTestId("header-side-nav");
    expect(sideNav).toBeInTheDocument();
    expect(screen.getByTestId("side-nav-items")).toBeInTheDocument();
    expect(screen.getByTestId("header-side-nav-items")).toBeInTheDocument();
  });

  it("handles null user name gracefully", () => {
    (usePathname as jest.Mock).mockReturnValue("/timesheet");
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { name: null } },
    });

    render(<Header />);

    // Should render header with empty/null initials
    expect(screen.getByTestId("header-container")).toBeInTheDocument();
    expect(
      screen.getByTestId("header-global-action-initials"),
    ).toBeInTheDocument();
  });

  it("handles undefined session gracefully", () => {
    (usePathname as jest.Mock).mockReturnValue("/timesheet");
    (useSession as jest.Mock).mockReturnValue({});

    render(<Header />);

    // Should render header even without user data
    expect(screen.getByTestId("header-container")).toBeInTheDocument();
    expect(screen.getByTestId("header-menu-button")).toBeInTheDocument();
  });

  it("renders HeaderName with correct text", () => {
    (usePathname as jest.Mock).mockReturnValue("/forecast");
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { name: "Name Test" } },
    });

    render(<Header />);

    const headerName = screen.getByTestId("header-name");
    expect(headerName).toHaveAttribute("href", "/");
    expect(headerName).toHaveTextContent("Integrated Timekeeping");
  });
});
