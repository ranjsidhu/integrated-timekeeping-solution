import { Form as CarbonForm } from "@carbon/react";

type CarbonFormProps = Readonly<
  React.PropsWithChildren<
    React.ComponentProps<typeof CarbonForm> & { "data-testid"?: string }
  >
>;

export default function Form({ children, ...props }: CarbonFormProps) {
  const dataTestId = props["data-testid"] ?? "form";
  return (
    <CarbonForm {...props} data-testid={dataTestId}>
      {children}
    </CarbonForm>
  );
}
