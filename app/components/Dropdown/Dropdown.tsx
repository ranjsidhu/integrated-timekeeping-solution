import type { DropdownProps } from "@carbon/react";
import { Dropdown as CarbonDropdown } from "@carbon/react";

type Props<T> = Readonly<
  React.PropsWithChildren<DropdownProps<T> & { "data-testid"?: string }>
>;

export default function Dropdown<T = unknown>({ ...props }: Props<T>) {
  const dataTestId = props["data-testid"] ?? "dropdown";
  return (
    <CarbonDropdown {...(props as DropdownProps<T>)} data-testid={dataTestId} />
  );
}
