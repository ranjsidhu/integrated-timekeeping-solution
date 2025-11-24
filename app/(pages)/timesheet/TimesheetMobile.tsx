export default function TimesheetMobile() {
  return (
    <div>
      {/* Mobile View - Cards Layout */}
      {/* <div className="sm:hidden">
              {billCodes.map((billCode) => {
                const isExpanded = expandedRows.has(billCode.id.toString());
                const entries = timeEntries.filter(
                  (e) => e.billCodeId === billCode.id,
                );

                return (
                  <div key={billCode.id} className="border-b border-slate-200">
                    <button
                      type="button"
                      className="w-full text-left p-4 bg-white cursor-pointer active:bg-slate-50 focus:outline-none"
                      onClick={() => toggleExpanded(billCode.id)}
                      aria-expanded={isExpanded}
                    >
                      <div className="flex items-start gap-3">
                        <div className="pt-1">
                          {isExpanded ? (
                            <ChevronDown size={20} className="text-slate-600" />
                          ) : (
                            <ChevronRight
                              size={20}
                              className="text-slate-600"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-[#0f62fe] text-sm">
                            {billCode.code}
                          </div>
                          <div className="text-slate-600 text-xs mt-1">
                            {billCode.description}
                          </div>
                        </div>
                      </div>
                    </button>

                    {isExpanded &&
                      billCode.workItems?.map((workItem: WorkItem) => {
                        const entry = entries.find(
                          (e) => e.subCodeId === workItem.id,
                        );
                        if (!entry) return null;

                        return (
                          <div
                            key={entry.id}
                            className="bg-slate-50 border-t border-slate-200"
                          >
                            <div className="p-4">
                              <div className="flex items-start justify-between gap-3 mb-3">
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-sm">
                                    {workItem.workItemCode}
                                  </div>
                                  <div className="text-slate-600 text-xs mt-0.5">
                                    {workItem.description}
                                  </div>
                                </div>
                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    entry.id && deleteEntry(entry.id);
                                  }}
                                  className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                  aria-label="Delete entry"
                                >
                                  <TrashCan size={16} />
                                </Button>
                              </div>

                              <div className="grid grid-cols-3 gap-2 mb-3">
                                {(
                                  [
                                    "mon",
                                    "tue",
                                    "wed",
                                    "thu",
                                    "fri",
                                  ] as DayOfWeek[]
                                ).map((day, index) => {
                                  const dayInfo = getDayInfo(
                                    index,
                                    selectedWeek,
                                  );
                                  return (
                                    <div
                                      key={day}
                                      className="bg-white rounded-lg p-2 border border-slate-200"
                                    >
                                      <div className="text-xs text-slate-600 font-medium mb-1">
                                        {dayInfo.shortDay}
                                      </div>
                                      <div className="text-[0.625rem] text-slate-500 mb-1">
                                        {dayInfo.date}
                                      </div>
                                      <input
                                        id={`${entry.id}-${day}-mobile`}
                                        type="number"
                                        inputMode="decimal"
                                        min={0}
                                        max={24}
                                        step="0.5"
                                        value={entry.hours[day] ?? 0}
                                        onChange={(e) =>
                                          entry.id &&
                                          updateHours(
                                            entry.id,
                                            day,
                                            e.target.value,
                                          )
                                        }
                                        className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                      />
                                    </div>
                                  );
                                })}
                              </div>

                              <div className="flex items-center justify-between bg-white rounded-lg p-3 border border-slate-200">
                                <span className="text-xs font-semibold text-slate-600 uppercase">
                                  Total
                                </span>
                                <span className="text-sm font-bold">
                                  {calculateTotal(entry.hours)}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                );
              })}

              <div className="bg-slate-200 p-4">
                <div className="font-semibold text-sm mb-3">Week Totals</div>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {(["mon", "tue", "wed", "thu", "fri"] as DayOfWeek[]).map(
                    (day, index) => {
                      const dayInfo = getDayInfo(index, selectedWeek);
                      return (
                        <div
                          key={day}
                          className="bg-white rounded-lg p-2 border border-slate-300"
                        >
                          <div className="text-xs text-slate-600 font-medium">
                            {dayInfo.shortDay}
                          </div>
                          <div className="text-sm font-bold mt-1">
                            {calculateDayTotal(day, timeEntries)}
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
                <div className="flex items-center justify-between bg-slate-700 text-white rounded-lg p-3">
                  <span className="text-sm font-semibold uppercase">
                    Grand Total
                  </span>
                  <span className="text-lg font-bold">
                    {timeEntries.reduce(
                      (sum, entry) => sum + calculateTotal(entry.hours),
                      0,
                    )}
                  </span>
                </div>
              </div>
            </div> */}
    </div>
  );
}
