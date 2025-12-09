"use client";

import {
  Header as CarbonHeader,
  HeaderContainer,
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
import { useSession } from "next-auth/react";
import { useState } from "react";
import { formInitials } from "@/utils/general";
import DisplayLinks from "./DisplayLinks";

export default function Header() {
  const pathname = usePathname();
  const session = useSession();
  const name = session?.data?.user.name;
  const initials = formInitials(name);
  const [isNavExpanded, setIsNavExpanded] = useState(false);

  const toggleSideNav = () => {
    setIsNavExpanded(!isNavExpanded);
  };

  return (
    <HeaderContainer
      render={() => (
        <CarbonHeader
          aria-label="IBM Integrated Timekeeping"
          data-testid="header-container"
        >
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
          {pathname !== "/" && (
            <>
              <HeaderNavigation
                aria-label="IBM Integrated Timekeeping"
                data-testid="header-navigation"
              >
                <DisplayLinks />
              </HeaderNavigation>
              <HeaderGlobalBar data-testid="header-global-bar">
                <HeaderGlobalAction
                  aria-label={initials}
                  tooltipAlignment="center"
                  data-testid="header-global-action-initials"
                >
                  <p className="border border-white rounded-full px-2">
                    {initials}
                  </p>
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
                  </HeaderSideNavItems>
                </SideNavItems>
              </SideNav>
            </>
          )}
        </CarbonHeader>
      )}
    />
  );
}
