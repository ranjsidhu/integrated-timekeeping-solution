import type {
  BillCode as PrismaBillCode,
  WorkItem as PrismaWorkItem,
} from "@/generated/prisma";
import type { BillCode } from "@/types/timesheet.types";

type PrismaBillCodeWithWorkItem = PrismaBillCode & {
  work_item?: PrismaWorkItem | null;
};

export function mapBillCode(b: PrismaBillCodeWithWorkItem): BillCode {
  return {
    id: String(b.id),
    code: b.bill_code,
    description: b.bill_name,
    projectName: undefined,
    clientName: undefined,
    workItems: b.work_item
      ? [
          {
            id: String(b.work_item.id),
            codeId: b.work_item.code_id,
            workItemCode: b.work_item.work_item_code,
            description: b.work_item.description,
          },
        ]
      : [],
  };
}
