// Mock redirect to throw so execution stops like Next.js would
jest.mock("next/navigation", () => ({
  redirect: jest.fn((url: string) => {
    throw new Error(`redirect:${url}`);
  }),
}));

jest.mock("@/utils/auth/getSession", () => ({
  getSession: jest.fn(),
}));

// serveractions is imported relative to the component; map to absolute via alias
jest.mock("@/app/components/AuthWrapper/serveractions", () => ({
  getUserDetails: jest.fn(),
}));

import { redirect } from "next/navigation";
import { getUserDetails } from "@/app/components/AuthWrapper/serveractions";

// import the component under test
const AuthWrapper = require("../AuthWrapper").default;

describe("AuthWrapper", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("redirects to / when there is no session.user", async () => {
    await expect(
      AuthWrapper({
        children: <div>Hi</div>,
        rolesRequired: undefined,
        session: null,
      }),
    ).rejects.toThrow("redirect:/");

    expect(redirect).toHaveBeenCalledWith("/");
    expect(getUserDetails).not.toHaveBeenCalled();
  });

  it("returns children when session exists and no rolesRequired", async () => {
    (getUserDetails as jest.Mock).mockResolvedValue({ roles: [] });

    const child = <div data-testid="child">Content</div>;
    const result = await AuthWrapper({
      children: child,
      rolesRequired: undefined,
      session: { user: { email: "a@b" } },
    });

    // result is a React fragment whose props.children is our child
    expect(result.props.children).toBe(child);
    expect(redirect).not.toHaveBeenCalled();
  });

  it("redirects to user-fetch-failed when getUserDetails returns null", async () => {
    (getUserDetails as jest.Mock).mockResolvedValue(null);

    await expect(
      AuthWrapper({
        children: <div />,
        rolesRequired: undefined,
        session: { user: { email: "a@b" } },
      }),
    ).rejects.toThrow("redirect:/error?type=user-fetch-failed");

    expect(redirect).toHaveBeenCalledWith("/error?type=user-fetch-failed");
  });

  it("redirects to error page when getUserDetails returns an error field", async () => {
    (getUserDetails as jest.Mock).mockResolvedValue({ error: "some-error" });

    await expect(
      AuthWrapper({
        children: <div />,
        rolesRequired: undefined,
        session: { user: { email: "a@b" } },
      }),
    ).rejects.toThrow("redirect:/error?type=some-error");

    expect(redirect).toHaveBeenCalledWith("/error?type=some-error");
  });

  it("redirects to /timesheet when rolesRequired not satisfied", async () => {
    (getUserDetails as jest.Mock).mockResolvedValue({ roles: ["user"] });

    await expect(
      AuthWrapper({
        children: <div />,
        rolesRequired: ["admin"],
        session: { user: { email: "a@b" } },
      }),
    ).rejects.toThrow("redirect:/timesheet");

    expect(redirect).toHaveBeenCalledWith("/timesheet");
  });

  it("returns children when rolesRequired satisfied", async () => {
    (getUserDetails as jest.Mock).mockResolvedValue({ roles: ["admin"] });

    const child = <span data-testid="ok">OK</span>;
    const result = await AuthWrapper({
      children: child,
      rolesRequired: ["admin"],
      session: { user: { email: "a@b" } },
    });

    expect(result.props.children).toBe(child);
    expect(redirect).not.toHaveBeenCalled();
  });

  it("redirects to / when userDetails has no roles field", async () => {
    (getUserDetails as jest.Mock).mockResolvedValue({});

    await expect(
      AuthWrapper({
        children: <div />,
        rolesRequired: undefined,
        session: { user: { email: "a@b" } },
      }),
    ).rejects.toThrow("redirect:/error?type=user-roles-missing");

    expect(redirect).toHaveBeenCalledWith("/error?type=user-roles-missing");
  });
});
