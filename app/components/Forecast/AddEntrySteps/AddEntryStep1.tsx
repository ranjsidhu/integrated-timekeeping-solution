"use client";

import { useState } from "react";
import type { Category } from "@/types/forecast.types";
import Button from "../../Button/Button";

type AddEntryStep1Props = {
  categories: Category[];
  onNext: (data: { category_id: number }) => void;
  onCancel: () => void;
};

export default function AddEntryStep1({
  categories,
  onNext,
  onCancel,
}: AddEntryStep1Props) {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );

  const handleNext = () => {
    if (selectedCategory) {
      onNext({ category_id: selectedCategory.id });
    }
  };

  // Group categories by assignment type
  const productiveCategories = categories.filter(
    (c) => c.assignment_type === "Productive",
  );
  const nonProductiveCategories = categories.filter(
    (c) => c.assignment_type === "Non-Productive",
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
            <button
              key={category.id}
              type="button"
              onClick={() => setSelectedCategory(category)}
              className={`w-full p-4 rounded-md border-2 text-left transition-all ${
                selectedCategory?.id === category.id
                  ? "border-[#0f62fe] bg-[#e0e0e0]"
                  : "border-[#e0e0e0] hover:border-[#8d8d8d] bg-white"
              }`}
            >
              <div className="font-medium text-[#161616]">
                {category.category_name}
              </div>
              <div className="text-sm text-[#525252] mt-1">
                {category.description}
              </div>
            </button>
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
            <button
              key={category.id}
              type="button"
              onClick={() => setSelectedCategory(category)}
              className={`w-full p-4 rounded-md border-2 text-left transition-all ${
                selectedCategory?.id === category.id
                  ? "border-[#8a3ffc] bg-[#e8daff]"
                  : "border-[#e0e0e0] hover:border-[#8d8d8d] bg-white"
              }`}
            >
              <div className="font-medium text-[#161616]">
                {category.category_name}
              </div>
              <div className="text-sm text-[#525252] mt-1">
                {category.description}
              </div>
            </button>
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
