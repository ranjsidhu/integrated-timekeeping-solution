"use client";

import { useMemo, useState } from "react";
import type {
  AddEntryStep1Props,
  Category as CategoryType,
} from "@/types/forecast.types";
import Button from "../../Button/Button";
import Category from "../../Category/Category";

export default function AddEntryStep1({
  categories,
  onNext,
  onCancel,
}: AddEntryStep1Props) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(
    null,
  );

  const handleNext = () => {
    if (selectedCategory) {
      onNext({ category_id: selectedCategory.id });
    }
  };

  // Group categories by assignment type
  const productiveCategories = useMemo(
    () => categories.filter((c) => c.assignment_type === "Productive"),
    [categories.filter],
  );

  const nonProductiveCategories = useMemo(
    () => categories.filter((c) => c.assignment_type === "Non-Productive"),
    [categories.filter],
  );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-[#161616] mb-2">
          Select Assignment Type
        </h3>
        <p className="text-sm text-[#525252] mb-4">
          Choose whether this is productive work or non-productive time
        </p>
      </div>

      {/* Productive */}
      <div>
        <p className="block text-sm font-medium text-[#161616] mb-2">
          Productive
        </p>
        <div className="space-y-2">
          {productiveCategories.map((category) => (
            <Category
              key={category.id}
              category={category}
              onSelect={setSelectedCategory}
              isSelected={selectedCategory?.id === category.id}
            />
          ))}
        </div>
      </div>

      {/* Non-Productive */}
      <div>
        <p className="block text-sm font-medium text-[#161616] mb-2">
          Non-Productive or Timeaway
        </p>
        <div className="space-y-2">
          {nonProductiveCategories.map((category) => (
            <Category
              key={category.id}
              category={category}
              onSelect={setSelectedCategory}
              isSelected={selectedCategory?.id === category.id}
            />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-[#e0e0e0]">
        <Button kind="secondary" size="md" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          kind="primary"
          size="md"
          onClick={handleNext}
          disabled={!selectedCategory}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
