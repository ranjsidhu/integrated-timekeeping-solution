"use client";

import { Link as CarbonLink } from "@carbon/react";

type CarbonLinkProps = Readonly<
  React.PropsWithChildren<
    React.ComponentProps<typeof CarbonLink> & {
      children: React.ReactNode;
      "data-testid"?: string;
    }
  >
>;

export default function Link({ children, ...props }: CarbonLinkProps) {
  const dataTestId = props["data-testid"] ?? "link";
  return (
    <CarbonLink {...props} data-testid={dataTestId}>
      {children}
    </CarbonLink>
  );
}
