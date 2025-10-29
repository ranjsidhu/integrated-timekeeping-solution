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
import { getSession } from "@/utils/auth/getSession";

// import the component under test
const AuthWrapper = require("../AuthWrapper").default;

describe("AuthWrapper", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("redirects to / when there is no session.user", async () => {
    (getSession as jest.Mock).mockResolvedValue(null);

    await expect(
      AuthWrapper({ children: <div>Hi</div>, rolesRequired: undefined }),
    ).rejects.toThrow("redirect:/");

    expect(redirect).toHaveBeenCalledWith("/");
    expect(getUserDetails).not.toHaveBeenCalled();
  });

  it("returns children when session exists and no rolesRequired", async () => {
    (getSession as jest.Mock).mockResolvedValue({ user: { email: "a@b" } });
    (getUserDetails as jest.Mock).mockResolvedValue({ user: { roles: [] } });

    const child = <div data-testid="child">Content</div>;
    const result = await AuthWrapper({
      children: child,
      rolesRequired: undefined,
    });

    // result is a React fragment whose props.children is our child
    expect(result.props.children).toBe(child);
    expect(redirect).not.toHaveBeenCalled();
  });

  it("redirects to /timesheet when rolesRequired not satisfied", async () => {
    (getSession as jest.Mock).mockResolvedValue({ user: { email: "a@b" } });
    (getUserDetails as jest.Mock).mockResolvedValue({
      user: { roles: ["user"] },
    });

    await expect(
      AuthWrapper({ children: <div />, rolesRequired: ["admin"] }),
    ).rejects.toThrow("redirect:/timesheet");

    expect(redirect).toHaveBeenCalledWith("/timesheet");
  });

  it("returns children when rolesRequired satisfied", async () => {
    (getSession as jest.Mock).mockResolvedValue({ user: { email: "a@b" } });
    (getUserDetails as jest.Mock).mockResolvedValue({
      user: { roles: ["admin"] },
    });

    const child = <span data-testid="ok">OK</span>;
    const result = await AuthWrapper({
      children: child,
      rolesRequired: ["admin"],
    });

    expect(result.props.children).toBe(child);
    expect(redirect).not.toHaveBeenCalled();
  });

  it("redirects to / when userDetails has no roles field", async () => {
    (getSession as jest.Mock).mockResolvedValue({ user: { email: "a@b" } });
    // simulate userDetails lacking a roles property
    (getUserDetails as jest.Mock).mockResolvedValue({ user: {} });

    await expect(
      AuthWrapper({ children: <div />, rolesRequired: undefined }),
    ).rejects.toThrow("redirect:/");

    expect(redirect).toHaveBeenCalledWith("/");
  });
});
