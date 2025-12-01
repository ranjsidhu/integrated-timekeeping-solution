import { Tag as CarbonTag } from "@carbon/react";

type CarbonTagProps = Readonly<
  React.PropsWithChildren<
    React.ComponentProps<typeof CarbonTag> & { "data-testid"?: string }
  >
>;

export default function Tag({ ...props }: CarbonTagProps) {
  const dataTestId = props["data-testid"] ?? "tag";
  return <CarbonTag {...props} data-testid={dataTestId} />;
}
