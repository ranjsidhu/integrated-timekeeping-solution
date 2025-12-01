import { Search as CarbonSearch } from "@carbon/react";

type CarbonSearchProps = Readonly<
  React.PropsWithChildren<
    React.ComponentProps<typeof CarbonSearch> & { "data-testid"?: string }
  >
>;

export default function Search({ ...props }: CarbonSearchProps) {
  const dataTestId = props["data-testid"] ?? "search";
  return <CarbonSearch {...props} data-testid={dataTestId} />;
}
