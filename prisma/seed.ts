import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // --- Admin account ---
  const email = process.env.ADMIN_EMAIL || "you@example.com";
  const password = process.env.ADMIN_PASSWORD || "change-this-password";
  const name = process.env.ADMIN_NAME || "Tajul Islam";
  const hashed = await bcrypt.hash(password, 10);

  await prisma.admin.upsert({
    where: { email },
    update: {},
    create: { email, password: hashed, name },
  });
  console.log(`Admin account ready: ${email}`);

  // --- Profile (migrated from the original index.html) ---
  await prisma.profile.upsert({
    where: { id: "profile" },
    update: {},
    create: {
      id: "profile",
      name: "Tajul Islam",
      title: "Merchandiser & Industrial Engineer | RMG Sector",
      shortBio:
        "I will be an asset for a company wherever I work and whatever my responsibilities, as I am self-motivated, hard-working, creative, and ingenious.",
      objective:
        "Merchandiser at Amantex Limited (Gazipur, Bangladesh) with a background in both Electrical & Electronic Engineering and apparel merchandising, currently pursuing an MBA in Apparel Merchandising & Fashion Management.",
      location: "Gazipur, Bangladesh",
      email: "contact@tajulislam.com",
      phone: "+8801979713004",
      facebook: "https://facebook.com/ilovetajul",
      twitter: "https://twitter.com/ilovetajul",
      instagram: "https://www.instagram.com/ilovetajul/",
      linkedin: "https://www.linkedin.com/in/ilovetajul/",
      whatsapp: "https://wa.me/message/7LYE5NFTIE2ID1",
      skype: "https://join.skype.com/invite/tyWmnBu43wno",
      telegram: "https://t.me/Ilovetajul",
      messenger: "https://m.me/140306343463276",
    },
  });
  console.log("Profile seeded (edit freely from /admin/profile)");

  // --- Skill category + skills (migrated from original About section) ---
  const techCat = await prisma.skillCategory.upsert({
    where: { name: "Technical Skills" },
    update: {},
    create: { name: "Technical Skills", sortOrder: 1 },
  });
  const originalSkills = [
    "PLC",
    "HMI",
    "CNC",
    "Servo Motor & Drive",
    "AC Drive/Inverter",
    "Motor/Transformer",
    "Substation",
    "Low Voltage Device",
  ];
  for (const [i, s] of originalSkills.entries()) {
    await prisma.skill.upsert({
      where: { id: `seed-skill-${i}` },
      update: {},
      create: {
        id: `seed-skill-${i}`,
        name: s,
        categoryId: techCat.id,
        level: "Intermediate",
        sortOrder: i,
      },
    });
  }
  console.log("Skills seeded");

  // --- Education (migrated from original timeline) ---
  const educationSeed = [
    {
      id: "seed-edu-0",
      institution: "Bangladesh Automation Technology",
      degree: "Industrial Attachment on Industrial Automation & Instrumentation",
      startDate: new Date("2021-01-01"),
      endDate: new Date("2021-03-01"),
      status: "completed",
      sortOrder: 0,
    },
    {
      id: "seed-edu-1",
      institution: "Urban Social Services Office",
      degree: "Computer Office Application",
      description:
        "Basic computer office application training from the skill development training center, Urban Social Services Office, Maltinagar, Bogra.",
      startDate: new Date("2019-01-01"),
      endDate: new Date("2019-06-01"),
      status: "completed",
      sortOrder: 1,
    },
    {
      id: "seed-edu-2",
      institution: "Skills for Employment Investment Program (SEIP)",
      degree: "Electrical Installation & Maintenance",
      startDate: new Date("2018-07-01"),
      endDate: new Date("2018-09-01"),
      status: "completed",
      sortOrder: 2,
    },
    {
      id: "seed-edu-3",
      institution: "North-Bengal Institute Of Technology (NIT)",
      degree: "Diploma",
      subject: "Electrical Technology",
      startDate: new Date("2017-01-01"),
      endDate: new Date("2021-01-01"),
      location: "Bogra, Bangladesh",
      status: "completed",
      sortOrder: 3,
    },
    {
      id: "seed-edu-4",
      institution: "Bogra Poura High School",
      degree: "Secondary School Certificate (SSC)",
      startDate: new Date("2012-01-01"),
      endDate: new Date("2017-01-01"),
      location: "Bogra, Bangladesh",
      status: "completed",
      sortOrder: 4,
    },
    {
      id: "seed-edu-5",
      institution: "Natai Government Primary School",
      degree: "Junior School Certificate (JSC)",
      startDate: new Date("2007-01-01"),
      endDate: new Date("2011-01-01"),
      location: "Bogra, Bangladesh",
      status: "completed",
      sortOrder: 5,
    },
  ];
  for (const edu of educationSeed) {
    await prisma.education.upsert({ where: { id: edu.id }, update: {}, create: edu });
  }
  console.log("Education timeline seeded");

  // --- Experience (migrated + a placeholder for the current Amantex role) ---
  await prisma.experience.upsert({
    where: { id: "seed-exp-0" },
    update: {},
    create: {
      id: "seed-exp-0",
      company: "Amantex Limited",
      position: "Merchandiser",
      startDate: new Date("2023-01-01"),
      current: true,
      responsibilities:
        "Add your day-to-day merchandising and production-monitoring responsibilities here from /admin/experience.",
      sortOrder: 0,
    },
  });
  await prisma.experience.upsert({
    where: { id: "seed-exp-1" },
    update: {},
    create: {
      id: "seed-exp-1",
      company: "Freelance",
      position: "Freelancer",
      startDate: new Date("2013-01-01"),
      endDate: new Date("2016-01-01"),
      sortOrder: 1,
    },
  });
  console.log("Experience seeded");

  // --- Project categories ---
  const categories = [
    "Web Development",
    "Automation",
    "AI",
    "Garments/Textile",
    "Data/Analytics",
    "Personal Projects",
    "Other",
  ];
  for (const [i, c] of categories.entries()) {
    await prisma.projectCategory.upsert({
      where: { name: c },
      update: {},
      create: { name: c, slug: c.toLowerCase().replace(/[^a-z0-9]+/g, "-") },
    });
  }
  console.log("Project categories seeded");

  // --- One example draft project so the admin UI isn't empty on first login ---
  const gtCat = await prisma.projectCategory.findUnique({ where: { name: "Web Development" } });
  await prisma.project.upsert({
    where: { id: "seed-project-welcome" },
    update: {},
    create: {
      id: "seed-project-welcome",
      title: "Welcome — edit or delete this sample project",
      slug: "welcome-sample-project",
      shortDesc: "This is a placeholder project. Edit it from /admin/projects or delete it.",
      description:
        "Go to /admin/projects to edit this project's details, upload real images, and click Publish when it's ready to appear on your live site.",
      categoryId: gtCat?.id,
      status: "draft",
      sortOrder: 0,
    },
  });
  console.log("Sample draft project seeded (unpublished)");

  // --- Site settings ---
  await prisma.siteSetting.upsert({
    where: { id: "settings" },
    update: {},
    create: {
      id: "settings",
      siteTitle: "Tajul Islam",
      siteDesc:
        "Merchandiser & Industrial Engineer — portfolio, projects and thoughts on the RMG industry, IE, and technology.",
      contactEmail: "contact@tajulislam.com",
      contactPhone: "+8801979713004",
      footerText: `© ${new Date().getFullYear()} Tajul Islam. All rights reserved.`,
    },
  });
  console.log("Site settings seeded");

  console.log("\nSeed complete. Log in at /admin/login with the ADMIN_EMAIL / ADMIN_PASSWORD from your .env file.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
