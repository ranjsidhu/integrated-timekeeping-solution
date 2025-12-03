import type { TagBaseProps } from "@carbon/react/lib/components/Tag/Tag";

/**
 * Returns the corresponding Tag type for a given forecast status string.
 * @param status - Forecast status string
 * @returns - Corresponding Tag type for Carbon Tag component
 */
const getForecastStatusColour = (status: string): TagBaseProps["type"] => {
  switch (status) {
    case "Submitted":
      return "blue";
    case "Processed":
      return "green";
    default:
      return "gray";
  }
};

const viewModeClassnames = {
  baseClassname: "px-3 py-2 rounded-md transition-all",
  selectedClassname: "bg-white shadow-sm text-[#161616]",
  unselectedClassname: "text-[#525252] hover:text-[#161616]",
};

export { getForecastStatusColour, viewModeClassnames };
