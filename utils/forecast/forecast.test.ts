import { getForecastStatusColour } from "./forecast.utils";

describe("getForecastStatusColour", () => {
  it("returns 'blue' for 'Submitted' status", () => {
    expect(getForecastStatusColour("Submitted")).toBe("blue");
  });

  it("returns 'green' for 'Processed' status", () => {
    expect(getForecastStatusColour("Processed")).toBe("green");
  });

  it("returns 'gray' for unknown status", () => {
    expect(getForecastStatusColour("Pending")).toBe("gray");
    expect(getForecastStatusColour("")).toBe("gray");
    expect(getForecastStatusColour("Completed")).toBe("gray");
  });
});
