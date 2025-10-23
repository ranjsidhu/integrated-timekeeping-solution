import { Header, HeaderName } from "@carbon/react";
import type { LayoutProps } from "@/types/layout.types";

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex justify-center align-center w-[100vw] m-0">
      <Header aria-label="Integrated Timekeeping">
        <HeaderName href="/" prefix="IBM">
          Integrated Timekeeping
        </HeaderName>
      </Header>
      {children}
    </div>
  );
}
