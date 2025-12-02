import type { CategoryProps } from "@/types/forecast.types";

export default function Category({
  category,
  onSelect,
  isSelected,
}: CategoryProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(category)}
      className={`w-full p-4 rounded-md border-2 text-left transition-all ${
        isSelected
          ? "border-[#0f62fe] bg-[#e0e0e0]"
          : "border-[#e0e0e0] hover:border-[#8d8d8d] bg-white"
      }`}
    >
      <div className="font-medium text-[#161616]">{category.category_name}</div>
      <div className="text-sm text-[#525252] mt-1">{category.description}</div>
    </button>
  );
}
