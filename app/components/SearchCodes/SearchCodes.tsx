"use client";

import { Fragment, useState } from "react";
import { getCodesBySearch } from "@/app/actions";
import { Search } from "@/app/components";
import type { Code } from "@/types/timesheet.types";
import SearchCodeResult from "./SearchCodeResult";

export default function SearchCodes() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Code[]>([]);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value.length) {
      setSearchResults([]);
      setSearchTerm("");
    } else {
      setSearchTerm(e.target.value);
      if (searchTerm.length > 3) {
        const codes = await getCodesBySearch(e.target.value);
        setSearchResults(codes);
      }
    }
  };

  return (
    <Fragment>
      {/* Search bar */}
      <div className="bg-white p-6 mt-4">
        <Search
          id="search-codes"
          labelText="Search codes"
          placeholder="Search for codes..."
          value={searchTerm}
          type="search"
          size="md"
          closeButtonLabelText="Clear search input"
          onChange={handleChange}
        />
      </div>
      {/* Search results */}
      <div className="p-6">
        {searchResults.map((code) => (
          <SearchCodeResult key={code.id} code={code} />
        ))}
      </div>
    </Fragment>
  );
}
