/**
 * Fully Responsive Timesheet Component
 * Adapts layout for mobile, tablet, and desktop views
 */

"use client";

import { Add, ChevronDown, ChevronRight, TrashCan } from "@carbon/icons-react";
import {
  Button,
  Column,
  Dropdown,
  Grid,
  IconButton,
  InlineNotification,
  Tag,
} from "@carbon/react";
import React, { useState } from "react";
import type {
  BillCode,
  DayOfWeek,
  SubCode,
  TimeEntry,
  WeekEnding,
} from "@/types/timesheet.types";

const TimesheetPageResponsive: React.FC = () => {
  // Generate week ending dates
  const generateWeekEndings = (): WeekEnding[] => {
    const weeks: WeekEnding[] = [];
    const today = new Date();

    for (let i = 0; i < 12; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - (today.getDay() + 7 * i - 5));

      weeks.push({
        id: `week-${i}`,
        label: date.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
        date: date,
        status: i === 0 ? "draft" : i === 1 ? "submitted" : "approved",
      });
    }

    return weeks;
  };

  const [weekEndings] = useState<WeekEnding[]>(generateWeekEndings());
  const [selectedWeek, setSelectedWeek] = useState<WeekEnding>(weekEndings[0]);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(
    new Set(["1", "2"]),
  );
  const [showNotification, setShowNotification] = useState<boolean>(false);

  const [billCodes] = useState<BillCode[]>([
    {
      id: "1",
      code: "UKAIDEG – SOW003",
      description: "DWP Ask Nexus Training",
      projectName: "DWP Project",
      subCodes: [
        { id: "1-1", code: "GB0020", description: "General Billable" },
      ],
    },
    {
      id: "2",
      code: "SK77",
      description: "NON-CHARGEABLE OVERHEAD",
      subCodes: [
        {
          id: "2-1",
          code: "L1LEARN",
          description: "Approved Non-IBM Learning",
        },
        { id: "2-2", code: "XLOH00", description: "NON-IBM LEARNING" },
      ],
    },
  ]);

  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([
    {
      id: "entry-1",
      billCodeId: "1",
      subCodeId: "1-1",
      hours: { mon: 8, tue: 8, wed: 8, thu: 0, fri: 8 },
    },
    {
      id: "entry-2",
      billCodeId: "2",
      subCodeId: "2-1",
      hours: { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0 },
    },
    {
      id: "entry-3",
      billCodeId: "2",
      subCodeId: "2-2",
      hours: { mon: 0, tue: 0, wed: 0, thu: 8, fri: 0 },
    },
  ]);

  const toggleExpanded = (id: string): void => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const getDayInfo = (
    offset: number,
  ): { shortDay: string; date: string; fullDate: string } => {
    const date = new Date(selectedWeek.date);
    date.setDate(date.getDate() - (4 - offset));
    return {
      shortDay: date.toLocaleDateString("en-US", { weekday: "short" }),
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      fullDate: date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
      }),
    };
  };

  const calculateTotal = (hours: TimeEntry["hours"]): number => {
    return hours.mon + hours.tue + hours.wed + hours.thu + hours.fri;
  };

  const calculateDayTotal = (day: DayOfWeek): number => {
    return timeEntries.reduce((sum, entry) => sum + (entry.hours[day] || 0), 0);
  };

  const updateHours = (
    entryId: string,
    day: DayOfWeek,
    value: string,
  ): void => {
    const numValue = parseFloat(value) || 0;
    setTimeEntries((prev) =>
      prev.map((entry) =>
        entry.id === entryId
          ? { ...entry, hours: { ...entry.hours, [day]: numValue } }
          : entry,
      ),
    );
  };

  const handleSave = (): void => {
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
    console.log("Saving timesheet...", { selectedWeek, timeEntries });
  };

  const handleSubmit = (): void => {
    console.log("Submitting timesheet...", { selectedWeek, timeEntries });
  };

  const deleteEntry = (entryId: string): void => {
    setTimeEntries((prev) => prev.filter((entry) => entry.id !== entryId));
  };

  const getStatusColor = (status?: WeekEnding["status"]) => {
    switch (status) {
      case "submitted":
        return "blue";
      case "saved":
        return "gray";
      default:
        return "gray";
    }
  };

  return (
    <div
      className="w-screen pt-12"
      style={{ background: "#f4f4f4", minHeight: "100vh" }}
    >
      <Grid fullWidth>
        <Column lg={16} md={8} sm={4}>
          {/* Header */}
          <div
            style={{
              background: "white",
              padding: "1.5rem",
              borderBottom: "1px solid #e0e0e0",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "1rem",
              }}
            >
              <h1
                style={{
                  fontSize: "clamp(1.5rem, 4vw, 2rem)",
                  fontWeight: "400",
                  color: "#161616",
                  margin: 0,
                }}
              >
                Timesheets
              </h1>
              {selectedWeek.status && (
                <Tag type={getStatusColor(selectedWeek.status)} size="md">
                  {selectedWeek.status.charAt(0).toUpperCase() +
                    selectedWeek.status.slice(1)}
                </Tag>
              )}
            </div>
          </div>

          {/* Notification */}
          {showNotification && (
            <div style={{ padding: "1rem" }}>
              <InlineNotification
                kind="success"
                title="Timesheet saved"
                subtitle="Your changes have been saved successfully"
                hideCloseButton={false}
                onClose={() => setShowNotification(false)}
                lowContrast
              />
            </div>
          )}

          {/* Controls */}
          <div
            style={{
              background: "white",
              padding: "1.5rem",
              borderBottom: "1px solid #e0e0e0",
            }}
          >
            <Grid narrow>
              <Column lg={4} md={4} sm={4} style={{ marginBottom: "1rem" }}>
                <Dropdown
                  id="week-ending"
                  titleText="Week ending"
                  label={selectedWeek.label}
                  items={weekEndings}
                  itemToString={(item) => (item ? item.label : "")}
                  onChange={({ selectedItem }) => {
                    if (selectedItem) setSelectedWeek(selectedItem);
                  }}
                  size="lg"
                />
              </Column>

              <Column lg={12} md={4} sm={4}>
                <div
                  style={{
                    display: "flex",
                    gap: "0.75rem",
                    flexWrap: "wrap",
                    alignItems: "flex-end",
                  }}
                >
                  <Button kind="primary" renderIcon={Add} size="md">
                    <span className="button-text">Add bill code</span>
                  </Button>

                  <Button
                    kind="tertiary"
                    size="md"
                    style={{ whiteSpace: "nowrap" }}
                  >
                    <span className="button-text-short">Copy template</span>
                  </Button>

                  <Button
                    kind="tertiary"
                    size="md"
                    style={{ whiteSpace: "nowrap" }}
                  >
                    <span className="button-text-short">Copy prev week</span>
                  </Button>
                </div>
              </Column>
            </Grid>
          </div>

          {/* Timesheet Table - Responsive Container */}
          <div
            style={{
              background: "white",
              minHeight: "400px",
            }}
          >
            {/* Desktop/Tablet View */}
            <div
              style={{
                overflowX: "auto",
                WebkitOverflowScrolling: "touch",
              }}
            >
              <table
                style={{
                  width: "100%",
                  minWidth: "800px",
                  borderCollapse: "collapse",
                  fontSize: "0.875rem",
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: "#f4f4f4",
                      borderBottom: "1px solid #e0e0e0",
                    }}
                  >
                    <th
                      style={{
                        padding: "1rem",
                        textAlign: "left",
                        fontWeight: "600",
                        fontSize: "0.75rem",
                        color: "#525252",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        minWidth: "250px",
                        position: "sticky",
                        left: 0,
                        background: "#f4f4f4",
                        zIndex: 10,
                      }}
                    >
                      Project / Activity
                    </th>
                    {[0, 1, 2, 3, 4].map((offset) => {
                      const dayInfo = getDayInfo(offset);
                      return (
                        <th
                          key={offset}
                          style={{
                            padding: "0.75rem 0.5rem",
                            textAlign: "center",
                            fontWeight: "600",
                            fontSize: "0.75rem",
                            color: "#525252",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                            minWidth: "90px",
                            maxWidth: "120px",
                          }}
                        >
                          <div>{dayInfo.shortDay}</div>
                          <div
                            style={{
                              fontWeight: "400",
                              marginTop: "0.25rem",
                              fontSize: "0.6875rem",
                            }}
                          >
                            {dayInfo.date}
                          </div>
                        </th>
                      );
                    })}
                    <th
                      style={{
                        padding: "0.75rem 0.5rem",
                        textAlign: "center",
                        fontWeight: "600",
                        fontSize: "0.75rem",
                        color: "#525252",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        minWidth: "80px",
                      }}
                    >
                      Total
                    </th>
                    <th
                      style={{
                        minWidth: "60px",
                        position: "sticky",
                        right: 0,
                        background: "#f4f4f4",
                        zIndex: 10,
                      }}
                    ></th>
                  </tr>
                </thead>
                <tbody>
                  {billCodes.map((billCode) => {
                    const isExpanded = expandedRows.has(billCode.id);
                    const entries = timeEntries.filter(
                      (e) => e.billCodeId === billCode.id,
                    );

                    return (
                      <React.Fragment key={billCode.id}>
                        {/* Bill Code Row */}
                        <tr
                          style={{
                            background: "#ffffff",
                            borderBottom: "1px solid #e0e0e0",
                            cursor: "pointer",
                          }}
                          onClick={() => toggleExpanded(billCode.id)}
                        >
                          <td
                            style={{
                              padding: "1rem",
                              position: "sticky",
                              left: 0,
                              background: "#ffffff",
                              zIndex: 5,
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                              }}
                            >
                              {isExpanded ? (
                                <ChevronDown
                                  size={20}
                                  style={{ flexShrink: 0 }}
                                />
                              ) : (
                                <ChevronRight
                                  size={20}
                                  style={{ flexShrink: 0 }}
                                />
                              )}
                              <div style={{ minWidth: 0 }}>
                                <div
                                  style={{
                                    fontWeight: "600",
                                    color: "#0f62fe",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {billCode.code}
                                </div>
                                <div
                                  style={{
                                    color: "#525252",
                                    fontSize: "0.8125rem",
                                    marginTop: "0.25rem",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {billCode.description}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td colSpan={7}></td>
                        </tr>

                        {/* Sub Code Rows */}
                        {isExpanded &&
                          billCode.subCodes?.map((subCode: SubCode) => {
                            const entry = entries.find(
                              (e) => e.subCodeId === subCode.id,
                            );
                            if (!entry) return null;

                            return (
                              <tr
                                key={entry.id}
                                style={{
                                  background: "#fafafa",
                                  borderBottom: "1px solid #e0e0e0",
                                }}
                              >
                                <td
                                  style={{
                                    padding: "0.75rem 1rem 0.75rem 3rem",
                                    position: "sticky",
                                    left: 0,
                                    background: "#fafafa",
                                    zIndex: 5,
                                  }}
                                >
                                  <div style={{ minWidth: 0 }}>
                                    <div
                                      style={{
                                        fontWeight: "500",
                                        fontSize: "0.875rem",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                      }}
                                    >
                                      {subCode.code}
                                    </div>
                                    <div
                                      style={{
                                        color: "#525252",
                                        fontSize: "0.8125rem",
                                        marginTop: "0.125rem",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                      }}
                                    >
                                      {subCode.description}
                                    </div>
                                  </div>
                                </td>
                                {(
                                  [
                                    "mon",
                                    "tue",
                                    "wed",
                                    "thu",
                                    "fri",
                                  ] as DayOfWeek[]
                                ).map((day) => (
                                  <td
                                    key={day}
                                    style={{
                                      padding: "0.5rem",
                                      textAlign: "center",
                                    }}
                                  >
                                    <input
                                      type="number"
                                      min="0"
                                      max="24"
                                      step="0.5"
                                      value={entry.hours[day] || 0}
                                      onChange={(e) =>
                                        entry.id &&
                                        updateHours(
                                          entry.id,
                                          day,
                                          e.target.value,
                                        )
                                      }
                                      style={{
                                        width: "100%",
                                        maxWidth: "70px",
                                        padding: "0.5rem 0.25rem",
                                        border: "1px solid #8d8d8d",
                                        borderRadius: "0",
                                        textAlign: "center",
                                        fontSize: "0.875rem",
                                        fontFamily: "inherit",
                                      }}
                                      onFocus={(e) => {
                                        e.target.style.outline =
                                          "2px solid #0f62fe";
                                        e.target.style.outlineOffset = "-2px";
                                      }}
                                      onBlur={(e) => {
                                        e.target.style.outline = "none";
                                      }}
                                    />
                                  </td>
                                ))}
                                <td
                                  style={{
                                    padding: "0.75rem 0.5rem",
                                    textAlign: "center",
                                    fontWeight: "600",
                                    fontSize: "0.875rem",
                                  }}
                                >
                                  {calculateTotal(entry.hours)}
                                </td>
                                <td
                                  style={{
                                    padding: "0.5rem",
                                    textAlign: "center",
                                    position: "sticky",
                                    right: 0,
                                    background: "#fafafa",
                                    zIndex: 5,
                                  }}
                                >
                                  <IconButton
                                    label="Delete entry"
                                    kind="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      entry.id && deleteEntry(entry.id);
                                    }}
                                  >
                                    <TrashCan size={16} />
                                  </IconButton>
                                </td>
                              </tr>
                            );
                          })}
                      </React.Fragment>
                    );
                  })}

                  {/* Totals Row */}
                  <tr
                    style={{
                      background: "#e0e0e0",
                      fontWeight: "600",
                      borderTop: "2px solid #525252",
                    }}
                  >
                    <td
                      style={{
                        padding: "1rem",
                        fontSize: "0.875rem",
                        position: "sticky",
                        left: 0,
                        background: "#e0e0e0",
                        zIndex: 5,
                      }}
                    >
                      Total
                    </td>
                    {(["mon", "tue", "wed", "thu", "fri"] as DayOfWeek[]).map(
                      (day) => (
                        <td
                          key={day}
                          style={{
                            padding: "1rem 0.5rem",
                            textAlign: "center",
                            fontSize: "0.875rem",
                          }}
                        >
                          {calculateDayTotal(day)}
                        </td>
                      ),
                    )}
                    <td
                      style={{
                        padding: "1rem 0.5rem",
                        textAlign: "center",
                        fontSize: "0.875rem",
                      }}
                    >
                      {timeEntries.reduce(
                        (sum, entry) => sum + calculateTotal(entry.hours),
                        0,
                      )}
                    </td>
                    <td
                      style={{
                        position: "sticky",
                        right: 0,
                        background: "#e0e0e0",
                        zIndex: 5,
                      }}
                    ></td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Action Buttons */}
            <div
              style={{
                display: "flex",
                gap: "1rem",
                padding: "1.5rem",
                borderTop: "1px solid #e0e0e0",
                background: "white",
                flexWrap: "wrap",
              }}
            >
              <Button
                kind="secondary"
                size="lg"
                onClick={handleSave}
                style={{ flex: "1 1 auto", minWidth: "120px" }}
              >
                Save
              </Button>

              <Button
                kind="primary"
                size="lg"
                onClick={handleSubmit}
                style={{ flex: "1 1 auto", minWidth: "120px" }}
              >
                Submit
              </Button>
            </div>
          </div>
        </Column>
      </Grid>

      <style>{`
        /* Responsive text adjustments */
        @media (max-width: 672px) {
          .button-text {
            font-size: 0.8125rem;
          }
          .button-text-short {
            font-size: 0.75rem;
          }
        }

        /* Ensure inputs don't zoom on mobile Safari */
        input[type="number"] {
          font-size: 16px !important;
        }

        @media (min-width: 673px) {
          input[type="number"] {
            font-size: 0.875rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default TimesheetPageResponsive;
