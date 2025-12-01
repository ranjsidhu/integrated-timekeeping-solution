// Mock prisma module
jest.mock("@/prisma/prisma", () => ({
  prisma: {
    code: {
      findMany: jest.fn(),
    },
  },
}));

import { getCodesBySearch } from "@/app/actions/search/getCodesBySearch";
import { prisma } from "@/prisma/prisma";

describe("getCodesBySearch", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test("returns formatted codes on success", async () => {
    const dbNow = new Date();
    const dbResult = [
      {
        id: 1,
        code: "CODE1",
        description: "Description 1",
        project_id: null,
        created_at: dbNow,
        updated_at: dbNow,
        is_system_code: false,
        start_date: dbNow,
        expiry_date: new Date(dbNow.getTime() + 1000000),
        work_items: [
          {
            id: 11,
            code_id: 1,
            work_item_code: "WI1",
            description: "WI desc",
            bill_codes: [
              {
                id: 111,
                work_item_id: 11,
                bill_code: "BC1",
                bill_name: "Bill 1",
              },
            ],
          },
        ],
      },
    ];

    const spy = jest.spyOn(
      prisma.code,
      "findMany",
    ) as unknown as jest.MockedFunction<
      (...args: unknown[]) => Promise<typeof dbResult>
    >;
    spy.mockResolvedValue(dbResult);

    const res = await getCodesBySearch("CODE1");

    expect(prisma.code.findMany).toHaveBeenCalled();
    expect(res).toHaveLength(1);
    expect(res[0].id).toBe(1);
    expect(res[0].code).toBe("CODE1");
    expect(res[0].work_items).toHaveLength(1);
    expect(res[0].work_items[0].bill_codes[0].bill_code).toBe("BC1");
  });

  test("returns empty array on error", async () => {
    const spyErr = jest.spyOn(
      prisma.code,
      "findMany",
    ) as unknown as jest.MockedFunction<(...args: unknown[]) => Promise<never>>;
    spyErr.mockRejectedValue(new Error("db error"));

    const res = await getCodesBySearch("x");
    expect(res).toEqual([]);
    expect(prisma.code.findMany).toHaveBeenCalled();
  });
});
