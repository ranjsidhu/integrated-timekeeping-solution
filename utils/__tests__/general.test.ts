import { formInitials } from "@/utils/general";

describe("formInitials", () => {
  it("returns initials for a two-word name", () => {
    expect(formInitials("John Doe")).toBe("JD");
    expect(formInitials("john doe")).toBe("JD");
  });

  it("returns initial for a single name", () => {
    expect(formInitials("alice")).toBe("A");
  });

  it("handles extra spaces and trims correctly", () => {
    expect(formInitials(" Mary  Jane ")).toBe("MJ");
    expect(formInitials("Anna Maria Smith")).toBe("AMS");
  });

  it("returns empty string for null, undefined, or empty input", () => {
    expect(formInitials(null)).toBe("");
    expect(formInitials(undefined)).toBe("");
    expect(formInitials("")).toBe("");
  });
});
