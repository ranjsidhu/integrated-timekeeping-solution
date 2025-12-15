"use client";

import { Logout } from "@carbon/icons-react";
import {
  HeaderGlobalAction,
  HeaderGlobalBar,
  HeaderMenuButton,
  HeaderName,
  HeaderNavigation,
  HeaderSideNavItems,
  SideNav,
  SideNavItems,
  SkipToContent,
} from "@carbon/react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import DisplayLinks from "./DisplayLinks";

interface HeaderClientProps {
  children?: React.ReactNode;
}

export default function HeaderClient({ children }: HeaderClientProps) {
  const pathname = usePathname();
  const [isNavExpanded, setIsNavExpanded] = useState(false);

  const toggleSideNav = () => {
    setIsNavExpanded(!isNavExpanded);
  };

  if (pathname === "/") {
    return <SkipToContent />;
  }

  return (
    <>
      <SkipToContent />
      <HeaderMenuButton
        aria-label={isNavExpanded ? "Close menu" : "Open menu"}
        onClick={toggleSideNav}
        isActive={isNavExpanded}
        aria-expanded={isNavExpanded}
        data-testid="header-menu-button"
      />
      <HeaderName href="/" prefix="IBM" data-testid="header-name">
        Integrated Timekeeping
      </HeaderName>
      <HeaderNavigation
        aria-label="IBM Integrated Timekeeping"
        data-testid="header-navigation"
      >
        <DisplayLinks />
        {children}
      </HeaderNavigation>
      <HeaderGlobalBar data-testid="header-global-bar">
        <HeaderGlobalAction
          aria-label="Log out"
          tooltipAlignment="center"
          data-testid="header-global-action-logout"
          onClick={() => {
            signOut({ redirectTo: "/" });
          }}
        >
          <Logout size={16} />
        </HeaderGlobalAction>
      </HeaderGlobalBar>
      <SideNav
        aria-label="Side navigation"
        expanded={isNavExpanded}
        isPersistent={false}
        data-testid="header-side-nav"
      >
        <SideNavItems data-testid="side-nav-items">
          <HeaderSideNavItems data-testid="header-side-nav-items">
            <DisplayLinks />
            {children}
          </HeaderSideNavItems>
        </SideNavItems>
      </SideNav>
    </>
  );
}
