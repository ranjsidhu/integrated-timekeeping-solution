"use client";

import { useEffect, useRef, useState } from "react";
import { searchProjects } from "@/app/actions";
import type { AddEntryStep2Props, Project } from "@/types/forecast.types";
import Button from "../../Button/Button";
import DatePicker from "../../DatePicker/DatePicker";
import DatePickerInput from "../../DatePickerInput/DatePickerInput";
import Input from "../../Input/Input";

export default function AddEntryStep2({
  categoryId,
  onNext,
  onBack,
  onCancel,
  initialData,
}: AddEntryStep2Props) {
  const [projectSearch, setProjectSearch] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [fromDate, setFromDate] = useState<Date[]>(
    initialData?.from_date || [],
  );
  const [toDate, setToDate] = useState<Date[]>(initialData?.to_date || []);
  const [hoursPerWeek, setHoursPerWeek] = useState(
    initialData?.hours_per_week || 40,
  );
  const [potentialExtension, setPotentialExtension] = useState<Date[]>(
    initialData?.potential_extension || [],
  );

  const hasInitialized = useRef(false);
  // Store initial data in ref to avoid dependency issues
  const initialDataRef = useRef(initialData);

  // Update ref when initialData changes
  useEffect(() => {
    initialDataRef.current = initialData;
  }, [initialData]);

  // Load initial project if editing
  useEffect(() => {
    const loadInitialProject = async () => {
      const currentInitialData = initialDataRef.current;

      if (
        currentInitialData?.project_id &&
        categoryId !== undefined &&
        !hasInitialized.current
      ) {
        try {
          // Search for all projects to find the one we need
          const results = await searchProjects("", categoryId);
          const project = results.find(
            (p) => p.id === currentInitialData.project_id,
          );
          if (project) {
            setSelectedProject(project);
            setFromDate(currentInitialData.from_date || []);
            setToDate(currentInitialData.to_date || []);
            setPotentialExtension(currentInitialData.potential_extension || []);
            setHoursPerWeek(currentInitialData.hours_per_week || 40);
          }
          hasInitialized.current = true;
        } catch (error) {
          console.error("Error loading initial project:", error);
        }
      }
    };

    loadInitialProject();
  }, [categoryId]); // Only depend on categoryId

  // Reset initialization flag when initialData changes
  useEffect(() => {
    hasInitialized.current = false;
  }, []);

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
    if (
      selectedProject &&
      fromDate.length > 0 &&
      toDate.length > 0 &&
      hoursPerWeek > 0
    ) {
      onNext({
        project_id: selectedProject.id,
        from_date: fromDate,
        to_date: toDate,
        hours_per_week: hoursPerWeek,
        potential_extension: potentialExtension,
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
          <div
            className="mt-2 max-h-48 overflow-y-auto border border-[#e0e0e0] rounded-md"
            role="listbox"
            aria-label="Project results"
          >
            {projects.map((project) => (
              <button
                role="option"
                key={project.id}
                type="button"
                onClick={() => {
                  setSelectedProject(project);
                  setProjectSearch("");
                  setProjects([]);
                }}
                className="w-full p-3 text-left hover:bg-[#e0e0e0] transition-colors border-b border-[#e0e0e0] last:border-b-0"
              >
                <div className="font-medium text-[#161616]">
                  {project.project_name}
                </div>
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
          <DatePicker
            datePickerType="single"
            className="w-full"
            onChange={(dates) => setFromDate(dates)}
            value={fromDate}
          >
            <DatePickerInput
              id="from-date"
              size="lg"
              labelText="Start date *"
              className="w-full px-4 py-2 border border-[#8d8d8d] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f62fe]"
              placeholder="mm/dd/yyyy"
            />
          </DatePicker>
        </div>
        <div>
          <DatePicker
            datePickerType="single"
            onChange={(dates) => setToDate(dates)}
            value={toDate}
          >
            <DatePickerInput
              id="to-date"
              size="lg"
              labelText="End date *"
              className="w-full px-4 py-2 border border-[#8d8d8d] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f62fe]"
              placeholder="mm/dd/yyyy"
            />
          </DatePicker>
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
        <DatePicker
          datePickerType="single"
          onChange={(dates) => setPotentialExtension(dates)}
          value={potentialExtension}
        >
          <DatePickerInput
            id="extension-date"
            size="lg"
            labelText="Potential Extension (Optional)"
            className="w-full px-4 py-2 border border-[#8d8d8d] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f62fe]"
            placeholder="mm/dd/yyyy"
          />
        </DatePicker>
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
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
