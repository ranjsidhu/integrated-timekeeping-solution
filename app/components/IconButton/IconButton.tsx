import { IconButton as CarbonIconButton } from "@carbon/react";

type CarbonIconButtonProps = Readonly<
  React.PropsWithChildren<
    React.ComponentProps<typeof CarbonIconButton> & { "data-testid"?: string }
  >
>;

export default function IconButton({
  children,
  ...props
}: CarbonIconButtonProps) {
  const dataTestId = props["data-testid"] ?? "icon-button";
  return (
    <CarbonIconButton {...props} data-testid={dataTestId}>
      {children}
    </CarbonIconButton>
  );
}
