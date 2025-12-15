"use client";

import { HeaderMenuItem } from "@carbon/react";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/utils/general";

export default function DisplayLinks() {
  const pathname = usePathname();

  return (
    <>
      {ROUTES.map((route) => (
        <HeaderMenuItem
          href={route.href}
          key={route.href}
          isActive={pathname.includes(route.href)}
          data-testid={`header-menu-item-${route.label.toLowerCase()}`}
        >
          {route.label}
        </HeaderMenuItem>
      ))}
    </>
  );
}
