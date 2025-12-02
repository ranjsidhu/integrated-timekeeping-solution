"use client";

import { useEffect, useState } from "react";
import { searchProjects } from "@/app/actions";
import type { Project } from "@/types/forecast.types";
import Button from "../../Button/Button";
import Input from "../../Input/Input";

type AddEntryStep2Props = {
  categoryId: number | undefined;
  onNext: (data: {
    project_id: number;
    from_date: string;
    to_date: string;
    hours_per_week: number;
    potential_extension?: string;
  }) => void;
  onBack: () => void;
  onCancel: () => void;
};

export default function AddEntryStep2({
  categoryId,
  onNext,
  onBack,
  onCancel,
}: AddEntryStep2Props) {
  const [projectSearch, setProjectSearch] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [hoursPerWeek, setHoursPerWeek] = useState(40);
  const [potentialExtension, setPotentialExtension] = useState("");

  // Search projects
  useEffect(() => {
    const fetchProjects = async () => {
      if (projectSearch.length >= 2 && categoryId !== undefined) {
        const results = await searchProjects(projectSearch, categoryId);
        setProjects(results);
      } else {
        setProjects([]);
      }
    };

    const debounce = setTimeout(fetchProjects, 300);
    return () => clearTimeout(debounce);
  }, [projectSearch, categoryId]);

  const handleNext = () => {
    if (selectedProject && fromDate && toDate && hoursPerWeek > 0) {
      onNext({
        project_id: selectedProject.id,
        from_date: fromDate,
        to_date: toDate,
        hours_per_week: hoursPerWeek,
        potential_extension: potentialExtension || undefined,
      });
    }
  };

  const isValid =
    selectedProject &&
    fromDate &&
    toDate &&
    hoursPerWeek > 0 &&
    hoursPerWeek <= 40;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-[#161616] mb-2">
          Assignment Details
        </h3>
        <p className="text-sm text-[#525252] mb-4">
          Provide details for your forecast entry
        </p>
      </div>

      {/* Project Search */}
      <div>
        <Input
          type="text"
          labelText="Project *"
          id="project-search"
          value={projectSearch}
          onChange={(e) => setProjectSearch(e.target.value)}
          placeholder="Search for a project..."
          data-testid="add-entry-project-search"
          className="w-full rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f62fe]"
        />
        {projects.length > 0 && (
          <div className="mt-2 max-h-48 overflow-y-auto border border-[#e0e0e0] rounded-md">
            {projects.map((project) => (
              <button
                key={project.id}
                type="button"
                onClick={() => {
                  setSelectedProject(project);
                  setProjectSearch(project.project_name);
                  setProjects([]);
                }}
                className="w-full p-3 text-left hover:bg-[#e0e0e0] transition-colors border-b border-[#e0e0e0] last:border-b-0"
              >
                <div className="font-medium text-[#161616]">
                  {project.project_name}
                </div>
                {project.client_name && (
                  <div className="text-sm text-[#525252]">
                    {project.client_name}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
        {selectedProject && (
          <div className="mt-2 p-3 bg-[#e0e0e0] rounded-md">
            <div className="text-sm font-medium text-[#161616]">
              Selected: {selectedProject.project_name}
            </div>
          </div>
        )}
      </div>

      {/* Date Range */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="from-date"
            className="block text-sm font-medium text-[#161616] mb-2"
          >
            Start Date *
          </label>
          <input
            id="from-date"
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-full px-4 py-2 border border-[#8d8d8d] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f62fe]"
          />
        </div>
        <div>
          <label
            htmlFor="to-date"
            className="block text-sm font-medium text-[#161616] mb-2"
          >
            End Date *
          </label>
          <input
            id="to-date"
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-full px-4 py-2 border border-[#8d8d8d] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f62fe]"
          />
        </div>
      </div>

      {/* Hours Per Week */}
      <div>
        <Input
          type="number"
          id="hours-per-week"
          label="Hours Per Week *"
          helperText="Enter hours between 0 and 40"
          min={0}
          max={40}
          value={String(hoursPerWeek)}
          hideSteppers
          onChange={(e) => setHoursPerWeek(Number(e.currentTarget.value))}
          className="w-full rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f62fe]"
        />
      </div>

      {/* Potential Extension (Optional) */}
      <div>
        <label
          htmlFor="extension-date"
          className="block text-sm font-medium text-[#161616] mb-2"
        >
          Potential Extension (Optional)
        </label>
        <input
          id="extension-date"
          type="date"
          value={potentialExtension}
          onChange={(e) => setPotentialExtension(e.target.value)}
          className="w-full px-4 py-2 border border-[#8d8d8d] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f62fe]"
        />
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-4 border-t border-[#e0e0e0]">
        <Button kind="secondary" size="md" onClick={onBack}>
          Back
        </Button>
        <div className="flex gap-3">
          <Button kind="secondary" size="md" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            kind="primary"
            size="md"
            onClick={handleNext}
            disabled={!isValid}
          >
            Create Entry
          </Button>
        </div>
      </div>
    </div>
  );
}
