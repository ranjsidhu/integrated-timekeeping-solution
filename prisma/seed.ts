"use server";
import { prisma } from "./prisma";

// Seed TimesheetWeekEndings for every Friday between 2025-10-01 and 2026-12-26 using upsert logic
const seedTimesheetWeekEndings = async () => {
  try {
    console.log("----Seeding TimesheetWeekEndings----");
    const startDate = new Date("2025-10-01");
    const endDate = new Date("2026-12-26");
    const currentDate = startDate;

    while (currentDate <= endDate) {
      // Check if the current date is a Friday
      if (currentDate.getDay() === 5) {
        await prisma.timesheetWeekEnding.upsert({
          where: {
            week_ending: currentDate,
          },
          update: {},
          create: {
            week_ending: currentDate,
          },
        });
      }
      // Move to the next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    console.log("----Seeding TimesheetWeekEndings completed----");
  } catch (error: unknown) {
    console.error(
      "Error seeding TimesheetWeekEndings:",
      (error as Error).message,
    );
  }
};

// Seed Roles if they don't exist
const seedRoles = async () => {
  try {
    console.log("----Seeding Roles----");
    const roles = [
      { name: "Admin", description: "Administrator role" },
      { name: "Employee", description: "Employee role" },
      { name: "Resource Manager", description: "Resource Manager role" },
    ];

    for (const role of roles) {
      await prisma.role.upsert({
        where: { name: role.name },
        update: {},
        create: role,
      });
    }
    console.log("----Seeding Roles completed----");
  } catch (error: unknown) {
    console.error("Error seeding Roles:", (error as Error).message);
  }
};

// Seed Categories if they don't exist
const seedCategories = async () => {
  try {
    console.log("----Seeding Categories----");
    const categories = [
      {
        category_name: "Billable",
        assignment_type: "Productive",
        description: "Work that is billable to a client",
      },
      {
        category_name: "Holiday",
        assignment_type: "Non-Productive",
        description: "Holiday leave",
      },
      {
        category_name: "Training",
        assignment_type: "Non-Productive",
        description: "Training and development activities",
      },
      {
        category_name: "Apprenticeship learning",
        assignment_type: "Non-Productive",
        description: "Apprenticeship learning activities",
      },
    ];

    for (const category of categories) {
      await prisma.category.upsert({
        where: {
          category_name: category.category_name,
          assignment_type: category.assignment_type,
          description: category.description,
        },
        update: {},
        create: category,
      });
    }
    console.log("----Seeding Categories completed----");
  } catch (error: unknown) {
    console.error("Error seeding Categories:", (error as Error).message);
  }
};

// Seed TimesheetStatuses if they don't exist
const seedTimesheetStatuses = async () => {
  try {
    console.log("----Seeding TimesheetStatuses----");
    const statuses = [
      { name: "Draft", description: "Timesheet is in draft state" },
      { name: "Submitted", description: "Timesheet has been submitted" },
      { name: "Approved", description: "Timesheet has been approved" },
      { name: "Rejected", description: "Timesheet has been rejected" },
    ];

    for (const status of statuses) {
      await prisma.timesheetStatus.upsert({
        where: { name: status.name, description: status.description },
        update: {},
        create: status,
      });
    }
    console.log("----Seeding TimesheetStatuses completed----");
  } catch (error: unknown) {
    console.error("Error seeding TimesheetStatuses:", (error as Error).message);
  }
};

async function main() {
  try {
    await seedTimesheetWeekEndings();
    await seedRoles();
    await seedCategories();
    await seedTimesheetStatuses();
  } catch (error: unknown) {
    console.error("Error during seeding:", error);
  }
}

main();
