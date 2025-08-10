import { PrismaClient } from "../src/app/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  // Create Adrian's user profile
  const user = await prisma.user.upsert({
    where: { email: "me@adriandlam.com" },
    update: {},
    create: {
      id: "Xz3oy0pBhC50C2I8SMbXGqw4GvmjL8vJ",
      name: "Adrian Lam",
      email: "me@adriandlam.com",
      emailVerified: true,
      username: "adriandlam",
      onboarded: true,
      title: "Math student at UBC. I like AI, building, and learning.",
      about: `I'm super passionate about building stuff that either solves real problems or helps me learn new concepts (super firm believer in project-based learning).

I also enjoy reflecting deeply about society, one's place in it, and where we're all heading. I think reflecting is a good way to improve oneself since it's important to have an outlook on life that isn't just about the present, but also considers the bigger picture.

When I'm not building or reflecting, I love venturing outdoors (preferably roadtrips in the mountains with no plans). After doing a bunch of these sidequests, I discovered that I really enjoy photography, it feels like a way to capture memories and share a glimpse of what I felt in the moment with others.`,
      location: "Vancouver, BC",
      website: "https://adriandlam.com",
      createdAt: new Date("2025-08-10T09:57:08.355Z"),
      updatedAt: new Date("2025-08-10T09:57:08.355Z"),
      onboardedAt: new Date("2025-08-10T09:57:08.355Z"),
    },
  });

  // Create contacts
  const contacts = [
    {
      type: "EMAIL",
      value: "me@adriandlam.com",
      href: "mailto:me@adriandlam.com",
      hidden: false,
    },
    {
      type: "GITHUB",
      value: "github.com/adriandlam",
      href: "https://github.com/adriandlam",
      hidden: false,
    },
    {
      type: "WEBSITE",
      value: "adriandlam.com",
      href: "https://adriandlam.com",
      hidden: false,
    },
    {
      type: "X",
      value: "x.com/adriandlam_",
      href: "https://x.com/adriandlam_",
      hidden: false,
    },
  ];

  for (const contact of contacts) {
    await prisma.contact.upsert({
      where: {
        id:
          contact.type === "EMAIL"
            ? "cme53eww20003u2emb3c52anh"
            : contact.type === "GITHUB"
            ? "cme53f8na0005u2eme3db22n5"
            : "cme53ffri0007u2emyhx7xajn",
      },
      update: {},
      create: {
        id:
          contact.type === "EMAIL"
            ? "cme53eww20003u2emb3c52anh"
            : contact.type === "GITHUB"
            ? "cme53f8na0005u2eme3db22n5"
            : "cme53ffri0007u2emyhx7xajn",
        type: contact.type as any,
        value: contact.value,
        href: contact.href,
        hidden: contact.hidden,
        userId: user.id,
        createdAt: new Date("2025-08-10T09:57:08.355Z"),
        updatedAt: new Date("2025-08-10T09:57:08.355Z"),
      },
    });
  }

  // Create work experience
  await prisma.workExperience.upsert({
    where: { id: "vercel-internship" },
    update: {},
    create: {
      id: "vercel-internship",
      title: "Software Engineer Intern",
      company: "Vercel",
      from: "Sep 2025",
      to: "Dec 2025",
      location: "San Francisco, CA",
      userId: user.id,
    },
  });

  // Create education
  await prisma.education.upsert({
    where: { id: "ubc-education" },
    update: {},
    create: {
      id: "ubc-education",
      degree: "Bachelor of Science, Mathematics",
      institution: "University of British Columbia",
      from: "2022",
      to: "2026",
      location: "Vancouver, BC",
      userId: user.id,
    },
  });

  // Create projects
  const projects = [
    {
      id: "spec2mcp",
      title: "Spec2MCP",
      year: "2025",
      description:
        "Turn any API docs (OpenAPI) into ready-to-use MCP server schemasno deep technical setup needed. <� Top 3 at YC MCP Hackathon.",
      skills: [
        "Next.js",
        "TypeScript",
        "TailwindCSS",
        "Supabase",
        "FastAPI",
        "Python",
      ],
      collaborators: "Shreyas Goyal, Yash Arya, Daniel Lima",
    },
    {
      id: "merin",
      title: "Merin",
      year: "2025",
      description:
        "An intelligent email platform reimagined for the AI era, designed to help users process emails faster with AI-powered assistance.",
      skills: ["Next.js", "Supabase", "TypeScript", "TailwindCSS"],
      collaborators: "Michael Han, Shubhaankar Sharma",
    },
    {
      id: "obsidian-vercel",
      title: "Obsidian Vercel",
      year: "2025",
      description:
        "A tool for Obsidian users to avoid paying for publish/sync and host their notes on Vercel via a CI/CD pipeline.",
      skills: ["Next.js", "TypeScript", "TailwindCSS"],
    },
    {
      id: "ubc-purity-test",
      title: "UBC Purity Test",
      year: "2025",
      description:
        "A fun platform that allows UBC students to test their innocence level with custom surveys for different faculties.",
      skills: ["Next.js", "TailwindCSS", "TypeScript", "Supabase"],
      collaborators: "Ryan Haraki",
    },
  ];

  for (const project of projects) {
    await prisma.project.upsert({
      where: { id: project.id },
      update: {},
      create: {
        id: project.id,
        title: project.title,
        year: project.year,
        description: project.description,
        skills: project.skills,
        collaborators: project.collaborators,
        userId: user.id,
      },
    });
  }

  console.log("Seed completed successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
