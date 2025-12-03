const formInitials = (name: string | null | undefined) => {
  return (
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() ?? ""
  );
};

const ROUTES = [
  { href: "/timesheet", label: "Timesheets" },
  { href: "/forecast", label: "Forecast" },
];

export { formInitials, ROUTES };
