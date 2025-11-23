"use client";

import { useRouter } from "next/navigation";
import { useSelectedCode } from "@/app/providers";
import type { SearchCodeResultProps } from "@/types/timesheet.types";

export default function SearchCodeResult({ code }: SearchCodeResultProps) {
  const { code: codeValue, description } = code;
  const { setCode } = useSelectedCode();
  const router = useRouter();

  const handleSelectCode = () => {
    setCode(code);
    router.push("/timesheet");
  };

  return (
    <div className="p-4 border-b border-slate-200 hover:bg-slate-100 cursor-pointer">
      <p onClick={handleSelectCode} onKeyDown={handleSelectCode}>
        {codeValue} - {description} - {}
      </p>
    </div>
  );
}
