"use client";

import { useRouter } from "next/navigation";
import type { SearchCodeResultProps } from "@/types/timesheet.types";

export default function SearchCodeResult({ code }: SearchCodeResultProps) {
  const { code: codeValue, description } = code;
  const router = useRouter();

  const handleSelectCode = () => {
    // Store the selected code in localStorage temporarily
    localStorage.setItem("pendingCode", JSON.stringify(code));

    // Navigate back to timesheet
    router.push("/timesheet");
  };

  return (
    <div className="p-4 border-b border-slate-200 hover:bg-slate-100 cursor-pointer">
      <button
        type="button"
        onClick={handleSelectCode}
        className="w-full text-left"
      >
        {codeValue} - {description}
      </button>
    </div>
  );
}
