import { Modal as CarbonModal } from "@carbon/react";

type CarbonModalProps = Readonly<
  React.PropsWithChildren<
    React.ComponentProps<typeof CarbonModal> & { "data-testid"?: string }
  >
>;

export default function Modal({ ...props }: CarbonModalProps) {
  const dataTestId = props["data-testid"] ?? "modal";
  return <CarbonModal {...props} data-testid={dataTestId} />;
}
