jest.mock("@/prisma/prisma", () => ({
  prisma: {
    code: {
      findUnique: jest.fn(),
    },
  },
}));

import { prisma } from "@/prisma/prisma";
import { addCodeToTimesheet } from "../addCodeToTimesheet";

const mockFindUnique = prisma.code.findUnique as unknown as jest.Mock;

describe("addCodeToTimesheet", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns error when code not found", async () => {
    mockFindUnique.mockResolvedValue(null);

    const result = await addCodeToTimesheet(1);

    expect(result).toEqual({ success: false, error: "Code not found" });
  });

  it("returns mapped workItems when code found", async () => {
    const code = {
      id: 7,
      code: "C7",
      work_items: [
        {
          id: 11,
          code_id: 7,
          work_item_code: "WI1",
          description: "First",
          bill_codes: [
            {
              id: 101,
              work_item_id: 11,
              bill_code: "BC1",
              bill_name: "Bill 1",
            },
          ],
        },
        {
          id: 12,
          code_id: 7,
          work_item_code: "WI2",
          description: "Second",
          bill_codes: [
            {
              id: 102,
              work_item_id: 12,
              bill_code: "BC2",
              bill_name: "Bill 2",
            },
          ],
        },
      ],
    };

    mockFindUnique.mockResolvedValue(code);

    const result = await addCodeToTimesheet(7);

    expect(result).toHaveProperty("success", true);
    const success = result as {
      success: true;
      // biome-ignore lint/suspicious/noExplicitAny: Unit tests
      data: { workItems: Array<any> };
    };
    expect(Array.isArray(success.data.workItems)).toBe(true);
    expect(success.data.workItems).toHaveLength(2);

    const wi = success.data.workItems[0];
    expect(wi).toMatchObject({
      id: 11,
      code_id: 7,
      work_item_code: "WI1",
      description: "First",
    });
    expect(Array.isArray(wi.bill_codes)).toBe(true);
    expect(wi.bill_codes[0]).toMatchObject({
      id: 101,
      work_item_id: 11,
      bill_code: "BC1",
    });
  });

  it("returns failure when prisma throws", async () => {
    mockFindUnique.mockImplementation(() => {
      throw new Error("DB fail");
    });

    const spy = jest.spyOn(console, "error").mockImplementation(() => {});

    const result = await addCodeToTimesheet(99);

    expect(result).toEqual({ success: false, error: "Failed to add code" });
    expect(spy).toHaveBeenCalled();

    spy.mockRestore();
  });
});
