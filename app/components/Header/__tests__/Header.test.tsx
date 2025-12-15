/** biome-ignore-all assist/source/organizeImports: Unit tests */
/** biome-ignore-all lint/suspicious/noExplicitAny: Unit tests */

import { fireEvent, render, screen } from "@testing-library/react";

// Mock @carbon/react components used by Header to avoid ESM parsing issues
jest.mock("@carbon/react", () => {
  return {
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
jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
  signOut: jest.fn(),
}));

// Mock DisplayLinks (relative to Header file)
jest.mock("../DisplayLinks", () => () => <div data-testid="display-links" />);

// Mock AnalyticsLink (relative to Header file)
jest.mock("../../AnalyticsLink/AnalyticsLink", () => () => (
  <div data-testid="analytics-link" />
));

import HeaderClient from "../HeaderClient";
const { usePathname } = require("next/navigation");
const { useSession } = require("next-auth/react");

describe("HeaderClient component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("does not render header navigation and global bar on root path /", () => {
    (usePathname as jest.Mock).mockReturnValue("/");
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { name: "Root User" } },
    });

    render(<HeaderClient />);

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

    render(<HeaderClient />);

    expect(screen.getByTestId("header-navigation")).toBeInTheDocument();
    expect(screen.getByTestId("header-global-bar")).toBeInTheDocument();
    expect(screen.getByTestId("header-side-nav")).toBeInTheDocument();
    expect(
      screen.getByTestId("header-global-action-logout"),
    ).toBeInTheDocument();
  });

  it("renders header on /login path with navigation", () => {
    (usePathname as jest.Mock).mockReturnValue("/login");
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { name: "Test" } },
    });

    render(<HeaderClient />);

    // Navigation elements are rendered on any non-root path (including /login)
    expect(screen.getByTestId("header-navigation")).toBeInTheDocument();
    expect(screen.getByTestId("header-global-bar")).toBeInTheDocument();
  });

  it("toggles side nav when menu button is clicked", () => {
    (usePathname as jest.Mock).mockReturnValue("/timesheet");
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { name: "Toggle Test" } },
    });

    render(<HeaderClient />);

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

    render(<HeaderClient />);

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

    render(<HeaderClient />);

    // DisplayLinks should appear twice: in HeaderNavigation and in HeaderSideNavItems
    const displayLinks = screen.getAllByTestId("display-links");
    expect(displayLinks).toHaveLength(2);
  });

  it("renders SideNav with correct properties", () => {
    (usePathname as jest.Mock).mockReturnValue("/timesheet");
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { name: "Side Nav Test" } },
    });

    render(<HeaderClient />);

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

    render(<HeaderClient />);

    // Should render header even with null user name
    expect(screen.getByTestId("header-menu-button")).toBeInTheDocument();
  });

  it("handles undefined session gracefully", () => {
    (usePathname as jest.Mock).mockReturnValue("/timesheet");
    (useSession as jest.Mock).mockReturnValue({});

    render(<HeaderClient />);

    // Should render header even without user data
    expect(screen.getByTestId("header-menu-button")).toBeInTheDocument();
  });

  it("renders HeaderName with correct text", () => {
    (usePathname as jest.Mock).mockReturnValue("/forecast");
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { name: "Name Test" } },
    });

    render(<HeaderClient />);

    const headerName = screen.getByTestId("header-name");
    expect(headerName).toHaveAttribute("href", "/");
    expect(headerName).toHaveTextContent("Integrated Timekeeping");
  });

  it("renders children passed to HeaderClient", () => {
    (usePathname as jest.Mock).mockReturnValue("/analytics");
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { name: "Test" } },
    });

    render(
      <HeaderClient>
        <div data-testid="test-child">Test Child</div>
      </HeaderClient>,
    );

    // Children should appear twice: in HeaderNavigation and in HeaderSideNavItems
    const children = screen.getAllByTestId("test-child");
    expect(children).toHaveLength(2);
  });
});
