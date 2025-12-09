"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { getCodesBySearch } from "@/app/actions";
import { Search } from "@/app/components";
import type { CodeWithWorkItems } from "@/types/timesheet.types";
import SearchCodeResult from "./SearchCodeResult";

export default function SearchCodes() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<CodeWithWorkItems[]>([]);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search effect
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!searchTerm.length) {
      setSearchResults([]);
      return;
    }

    if (searchTerm.length < 3) {
      return;
    }

    debounceTimerRef.current = setTimeout(async () => {
      const codes = await getCodesBySearch(searchTerm);
      setSearchResults(codes);
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchTerm]);

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
          onChange={(e) => setSearchTerm(e.target.value)}
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
