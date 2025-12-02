import { DatePickerInput as CarbonDatePickerInput } from "@carbon/react";

type CarbonDatePickerInputProps = Readonly<
  React.PropsWithChildren<
    React.ComponentProps<typeof CarbonDatePickerInput> & {
      "data-testid"?: string;
    }
  >
>;

export default function DatePickerInput({
  children,
  ...props
}: CarbonDatePickerInputProps) {
  const dataTestId = props["data-testid"] ?? "date-picker-input";
  return <CarbonDatePickerInput {...props} data-testid={dataTestId} />;
}
