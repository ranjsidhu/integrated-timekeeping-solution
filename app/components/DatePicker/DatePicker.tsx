import { DatePicker as CarbonDatePicker } from "@carbon/react";

type CarbonDatePickerProps = Readonly<
  React.PropsWithChildren<
    React.ComponentProps<typeof CarbonDatePicker> & {
      "data-testid"?: string;
    }
  >
>;

export default function DatePicker({
  children,
  ...props
}: CarbonDatePickerProps) {
  const dataTestId = props["data-testid"] ?? "date-picker";
  return (
    <CarbonDatePicker {...props} data-testid={dataTestId}>
      {children}
    </CarbonDatePicker>
  );
}
