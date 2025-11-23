"use client";

import { Column, Grid, SearchCodes } from "@/app/components";

export default function Search() {
  return (
    <div className="w-full bg-slate-50 min-h-full">
      <Grid fullWidth>
        <Column lg={16} md={8} sm={4}>
          {/* Header */}
          <div className="bg-white p-4 sm:p-6 border-b border-slate-200">
            <div className="flex justify-between items-center flex-wrap gap-3">
              <h1 className="text-2xl sm:text-3xl font-normal text-[#161616] m-0">
                Search
              </h1>
            </div>
          </div>

          {/* Search */}
          <SearchCodes />
        </Column>
      </Grid>
    </div>
  );
}
