"use server";

import { Header as CarbonHeader } from "@carbon/react";
import AnalyticsLink from "../AnalyticsLink/AnalyticsLink";
import HeaderClient from "./HeaderClient";

export default async function Header() {
  return (
    <CarbonHeader
      aria-label="IBM Integrated Timekeeping"
      data-testid="header-container"
    >
      <HeaderClient>
        <AnalyticsLink />
      </HeaderClient>
    </CarbonHeader>
  );
}
