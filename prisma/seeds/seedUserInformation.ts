// npx tsx prisma/seeds/seedUserInformation.ts
import { createAndHashPassword } from "../createAndHashPasswords";
import { prisma } from "../prisma";

// Seed users
const USERS = [
  {
    email: "ranjeet.sidhu@ibm.com",
    password_hash: "",
    name: "Ranj Sidhu",
    availability_date: new Date("2026-03-31").toISOString(),
  },
  {
    email: "kaspars@ibm.com",
    password_hash: "",
    name: "Kaspars Strods",
    availability_date: new Date("2026-03-31").toISOString(),
  },
  {
    email: "n.defaux@ibm.com",
    password_hash: "",
    name: "Nicolaas Defaux",
    availability_date: new Date("2026-03-31").toISOString(),
  },
  {
    email: "mehtabsbassi-cic@ibm.com",
    password_hash: "",
    name: "Mehtab Bassi",
    availability_date: new Date("2026-03-31").toISOString(),
  },
  {
    email: "ben.smith3@ibm.com",
    password_hash: "",
    name: "Ben Smith",
    availability_date: new Date("2026-03-31").toISOString(),
  },

  //   Project Owners
  {
    email: "dwpasknexus@ibm.com",
    password_hash: "",
    name: "DWP Ask Nexus",
    availability_date: new Date("2026-03-31").toISOString(),
  },
  {
    email: "nonchargeableoverhead@ibm.com",
    password_hash: "",
    name: "Non-Chargeable Overhead",
    availability_date: new Date("2026-03-31").toISOString(),
  },
  {
    email: "gailnexus@ibm.com",
    password_hash: "",
    name: "Gail Nexus",
    availability_date: new Date("2026-03-31").toISOString(),
  },
  {
    email: "generalindirectoverhead@ibm.com",
    password_hash: "",
    name: "General Indirect Overhead",
    availability_date: new Date("2026-03-31").toISOString(),
  },
  {
    email: "contract4242065@ibm.com",
    password_hash: "",
    name: "Contract 4242065",
    availability_date: new Date("2026-03-31").toISOString(),
  },
  {
    email: "pmcassd@ibm.com",
    password_hash: "",
    name: "PMCA SSD",
    availability_date: new Date("2026-03-31").toISOString(),
  },
];

const USERS_WITH_PASSWORDS = async () => {
  const usersWithPasswords = [];
  for (const user of USERS) {
    const hashedPassword = await createAndHashPassword(user.name);
    usersWithPasswords.push({ ...user, password_hash: hashedPassword });
  }
  return usersWithPasswords;
};

async function seedUsers() {
  const users = await USERS_WITH_PASSWORDS();
  const createdUsers = [];

  for (const userData of users) {
    const { email, password_hash, name, availability_date } = userData;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!existingUser) {
      const createdUser = await prisma.user.create({
        data: {
          email,
          password_hash,
          name,
          availability_date: availability_date,
        },
      });
      console.log(`Created user: ${email}`);
      createdUsers.push(createdUser);
    } else {
      console.log(`User already exists: ${email}`);
    }
  }
  return createdUsers;
}

// Seed User Roles
async function seedUserRoles() {
  const allUsers = await prisma.user.findMany();
  const employeeRole = await prisma.role.findFirst({
    where: { name: "Employee" },
  });

  if (!employeeRole) {
    console.error("Employee role not found. Please seed roles first.");
    return;
  }

  for (const user of allUsers) {
    const existingUserRole = await prisma.userRoles.findFirst({
      where: {
        user_id: user.id,
        role_id: employeeRole.id,
      },
    });

    if (!existingUserRole) {
      await prisma.userRoles.create({
        data: {
          user_id: user.id,
          role_id: employeeRole.id,
        },
      });
      console.log(`Assigned Employee role to user: ${user.email}`);
    } else {
      console.log(`User already has Employee role: ${user.email}`);
    }
  }
}

// Seed Projects
const PROJECTS = [
  {
    project_name: "SOWOO3 - DWP Ask Nexus",
    owner_email: "dwpasknexus@ibm.com",
  },
  {
    project_name: "Non-Chargeable Overhead",
    owner_email: "nonchargeableoverhead@ibm.com",
  },
  { project_name: "SOW002 - Gail Nexus", owner_email: "gailnexus@ibm.com" },
  {
    project_name: "General Indirect Overhead",
    owner_email: "generalindirectoverhead@ibm.com",
  },
  {
    project_name: "Contract Number: 4242065",
    owner_email: "contract4242065@ibm.com",
  },
  { project_name: "PMCA SSD", owner_email: "pmcassd@ibm.com" },
];

async function seedProjects() {
  for (const projectData of PROJECTS) {
    const { project_name, owner_email } = projectData;

    const owner = await prisma.user.findUnique({
      where: { email: owner_email },
      select: { id: true },
    });

    if (!owner) {
      console.error(
        `Owner with email ${owner_email} not found. Skipping project ${project_name}.`,
      );
      continue;
    }

    const existingProject = await prisma.project.findFirst({
      where: { project_name },
    });

    if (!existingProject) {
      await prisma.project.create({
        data: {
          project_name,
          owner_user_id: owner.id,
        },
      });
      console.log(`Created project: ${project_name}`);
    } else {
      console.log(`Project already exists: ${project_name}`);
    }
  }
}

// Seed codes
const CODES = [
  {
    code: "UKAIDEG",
    description: "DWPASK",
    is_system_code: false,
    start_date: new Date("2025-10-01").toISOString(),
    expiry_date: new Date("2026-03-31").toISOString(),
    project: "SOWOO3 - DWP Ask Nexus",
  },
  {
    code: "SK77",
    description: "Non-Chargeable Overhead",
    is_system_code: false,
    start_date: new Date("2025-10-01").toISOString(),
    expiry_date: new Date("2026-03-31").toISOString(),
    project: "Non-Chargeable Overhead",
  },
  {
    code: "UKAIDEK",
    description: "SOW002 - Gail Nexus",
    is_system_code: false,
    start_date: new Date("2025-10-01").toISOString(),
    expiry_date: new Date("2026-03-31").toISOString(),
    project: "SOW002 - Gail Nexus",
  },
  {
    code: "SKSI",
    description: "General Indirect Overhead",
    is_system_code: true,
    start_date: new Date("2025-10-01").toISOString(),
    expiry_date: new Date("2026-03-31").toISOString(),
    project: "General Indirect Overhead",
  },
  {
    code: "UKAIAVL",
    description: "Contract",
    is_system_code: false,
    start_date: new Date("2025-10-01").toISOString(),
    expiry_date: new Date("2026-03-31").toISOString(),
    project: "Contract Number: 4242065",
  },
  {
    code: "QNGBBAA",
    description: "PMCA",
    is_system_code: false,
    start_date: new Date("2025-10-01").toISOString(),
    expiry_date: new Date("2026-03-31").toISOString(),
    project: "PMCA SSD",
  },
];

async function seedCodes() {
  for (const c of CODES) {
    const {
      code,
      description,
      is_system_code,
      start_date,
      expiry_date,
      project,
    } = c;

    const projectInDB = await prisma.project.findFirst({
      where: { project_name: project },
    });

    if (!projectInDB) {
      console.error(
        `Project with name ${project} not found. Skipping code ${code}.`,
      );
      continue;
    }

    const existingCode = await prisma.code.findFirst({
      where: { code },
    });

    if (!existingCode) {
      await prisma.code.create({
        data: {
          code,
          description,
          is_system_code,
          start_date,
          expiry_date,
          project_id: projectInDB.id,
        },
      });
      console.log(`Created code: ${code}`);
    } else {
      console.log(`Code already exists: ${code}`);
    }
  }
}

// Seed WorkItems
const WORK_ITEMS = [];

async function seedWorkItems() {}

async function main() {
  await seedUsers();
  await seedUserRoles();
  await seedProjects();
  await seedCodes();
  await seedWorkItems();
}

main();
