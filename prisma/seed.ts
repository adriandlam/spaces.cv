import { PrismaClient, type ContactType } from "../src/app/generated/prisma";

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
      username: "adrianlam",
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

  // Create profile preferences
  await prisma.profilePreferences.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      id: "cme6k818n0001u24rb60deu30",
      userId: user.id,
      hidden: false,
      googleIndexing: true,
      fontFamily: "SANS",
      theme: "DARK",
      createdAt: new Date("2025-08-11T10:35:27.048Z"),
      updatedAt: new Date("2025-08-11T10:35:27.048Z"),
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
        type: contact.type as ContactType,
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
      fieldOfStudy: "Mathematics",
      degree: "Bachelor of Science",
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
      from: "2025",
      to: null,
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
      from: "2024",
      to: "2025",
      description:
        "An intelligent email platform reimagined for the AI era, designed to help users process emails faster with AI-powered assistance.",
      skills: ["Next.js", "Supabase", "TypeScript", "TailwindCSS"],
      collaborators: "Michael Han, Shubhaankar Sharma",
    },
    {
      id: "obsidian-vercel",
      title: "Obsidian Vercel",
      from: "2025",
      to: null,
      description:
        "A tool for Obsidian users to avoid paying for publish/sync and host their notes on Vercel via a CI/CD pipeline.",
      skills: ["Next.js", "TypeScript", "TailwindCSS"],
    },
    {
      id: "ubc-purity-test",
      title: "UBC Purity Test",
      from: "2024",
      to: "2025",
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
        from: project.from,
        to: project.to,
        description: project.description,
        skills: project.skills,
        collaborators: project.collaborators,
        userId: user.id,
      },
    });
  }

  // Create Shubhaankar's user profile
  const shubUser = await prisma.user.upsert({
    where: { email: "shubhaankar@hotmail.com" },
    update: {},
    create: {
      id: "Shub3oy0pBhC50C2I8SMbXGqw4GvmjL8vJ",
      name: "Shubhaankar Sharma",
      email: "shubhaankar@hotmail.com",
      emailVerified: true,
      username: "shubhaankar",
      onboarded: true,
      title: "CS student at UBC researching Distributed Systems and ML",
      about: `I'm passionate about building systems that solve real problems. My approach is guided by "rejecting artificial bounds" - exceptional versatility is possible when you focus on continuous learning and building.

I've been programming since I was 9, starting with QBasic. I enjoy tackling challenging, often obscure problems. I believe in contributing to communities and creating tools that help people work more effectively.

Currently doing research on real-time guarantees for edge computing.

Also :p other than this, I'm a huge cinephile and music nerd. I play guitar and the Blues - my favourite artist is John Mayer. I'm still unsure about my favourite director though (Wes Anderson seems pick me lol maybe Imtiaz Ali).`,
      location: "Vancouver, BC",
      website: "https://notes.spongeboi.com",
      createdAt: new Date("2025-08-11T10:00:00.000Z"),
      updatedAt: new Date("2025-08-11T10:00:00.000Z"),
      onboardedAt: new Date("2025-08-11T10:00:00.000Z"),
    },
  });

  // Create Shubhaankar's profile preferences
  await prisma.profilePreferences.upsert({
    where: { userId: shubUser.id },
    update: {},
    create: {
      id: "shub6k818n0001u24rb60deu30",
      userId: shubUser.id,
      hidden: false,
      googleIndexing: true,
      fontFamily: "SANS",
      theme: "LIGHT",
      createdAt: new Date("2025-08-11T10:00:00.000Z"),
      updatedAt: new Date("2025-08-11T10:00:00.000Z"),
    },
  });

  // Create Shubhaankar's contacts
  const shubContacts = [
    {
      type: "EMAIL",
      value: "shubhaankar@hotmail.com",
      href: "mailto:shubhaankar@hotmail.com",
      hidden: false,
    },
    {
      type: "GITHUB",
      value: "github.com/Shubhaankar-Sharma",
      href: "https://github.com/Shubhaankar-Sharma",
      hidden: false,
    },
    {
      type: "WEBSITE",
      value: "notes.spongeboi.com",
      href: "https://notes.spongeboi.com",
      hidden: false,
    },
    {
      type: "X",
      value: "x.com/__spongeboi",
      href: "https://x.com/__spongeboi",
      hidden: false,
    },
    {
      type: "LINKEDIN",
      value: "linkedin.com/in/shubhaankar-sharma",
      href: "https://linkedin.com/in/shubhaankar-sharma",
      hidden: false,
    },
  ];

  for (const contact of shubContacts) {
    await prisma.contact.upsert({
      where: {
        id:
          contact.type === "EMAIL"
            ? "shub53eww20003u2emb3c52anh"
            : contact.type === "GITHUB"
            ? "shub53f8na0005u2eme3db22n5"
            : contact.type === "WEBSITE"
            ? "shub53ffri0007u2emyhx7xajn"
            : contact.type === "X"
            ? "shub53ffri0008u2emyhx7xajn"
            : "shub53ffri0009u2emyhx7xajn",
      },
      update: {},
      create: {
        id:
          contact.type === "EMAIL"
            ? "shub53eww20003u2emb3c52anh"
            : contact.type === "GITHUB"
            ? "shub53f8na0005u2eme3db22n5"
            : contact.type === "WEBSITE"
            ? "shub53ffri0007u2emyhx7xajn"
            : contact.type === "X"
            ? "shub53ffri0008u2emyhx7xajn"
            : "shub53ffri0009u2emyhx7xajn",
        type: contact.type as ContactType,
        value: contact.value,
        href: contact.href,
        hidden: contact.hidden,
        userId: shubUser.id,
        createdAt: new Date("2025-08-11T10:00:00.000Z"),
        updatedAt: new Date("2025-08-11T10:00:00.000Z"),
      },
    });
  }

  // Create Shubhaankar's work experience
  const shubWorkExperience = [
    {
      id: "ubc-research-intern",
      title: "Research Intern",
      company: "University of British Columbia - Systopia Labs",
      from: "May 2025",
      to: "Present",
      location: "Vancouver, BC",
      description:
        "Working under Dr. Arpan Gujarati in collaboration with NVIDIA on real time systems research related to the Holoscan SDK (AI applications in Hospitals and Surgery Tables). This internship is supported by the Work Learn International Undergraduate Research Award",
    },
    {
      id: "sequence-backend-dev",
      title: "Backend Developer",
      company: "Sequence Inc",
      from: "Sep 2021",
      to: "Sep 2024",
      location: "Toronto, ON",
      description:
        "Joined when I was 17 years old and worked on: Migrated DevOps stack to Kubernetes and Pulumi, Built webhook notification service in Go for EVM chain events, Developed Grafana-Prometheus dashboards for monitoring all microservices across multiple environments, Maintained metadata service handling 1.5k requests/minute, serving and indexing metadata of blockchain assets, Contributed to ethwal's filter index optimization, allows you to search through millions of events in milliseconds",
    },
  ];

  for (const work of shubWorkExperience) {
    await prisma.workExperience.upsert({
      where: { id: work.id },
      update: {},
      create: {
        id: work.id,
        title: work.title,
        company: work.company,
        from: work.from,
        to: work.to,
        location: work.location,
        description: work.description,
        userId: shubUser.id,
      },
    });
  }

  // Create Shubhaankar's education
  await prisma.education.upsert({
    where: { id: "shub-ubc-education" },
    update: {},
    create: {
      id: "shub-ubc-education",
      fieldOfStudy: "Computer Science",
      degree: "Bachelor of Science",
      institution: "University of British Columbia",
      from: "2022",
      to: "2026",
      location: "Vancouver, BC",
      description:
        "Majoring in Computer Science with focus on distributed systems. Key courses: Systems Programming, Algorithms, Databases, Software Engineering. Additional coursework: Numerical Computation, Linear Algebra, Probability, Cinema, Philosophy",
      userId: shubUser.id,
    },
  });

  // Create Shubhaankar's projects
  const shubProjects = [
    {
      id: "lilgrad",
      title: "lilgrad",
      from: "2025",
      to: null,
      description:
        "Micrograd-like neural network library built from scratch in Python and NumPy. Implemented in numpy and python from scratch without inspiration from existing libraries. Currently supports ReLU and Softmax activations with cross-entropy loss. Future plans include GPU support for accelerated computation",
      skills: ["Python", "NumPy", "Neural Networks"],
    },
    {
      id: "obsidian-brain",
      title: "obsidian-brain",
      from: "2024",
      to: null,
      description:
        "MCP Server for Obsidian with BM25, NLP, and Vector Search capabilities. Advanced search and knowledge management system for Obsidian notes",
      skills: ["Python", "NLP", "Vector Search", "MCP", "BM25 Search"],
    },
    {
      id: "doomsday-messenger",
      title: "doomsday-messenger",
      from: "2024",
      to: null,
      description:
        "LoRa mesh network for end-to-end encrypted messaging. Decentralized communication system for scenarios without internet infrastructure. Built for emergency and off-grid communication",
      skills: ["LoRa", "Arduino", "Soldering", "C"],
    },
    {
      id: "peersafe",
      title: "peersafe",
      from: "2023",
      to: null,
      description:
        "P2P end-to-end encrypted file storage with Shamir key splitting. Distributed file storage system across multiple peers. Focuses on security and redundancy",
      skills: ["Go", "P2P", "Cryptography", "Shamir Key Splitting"],
    },
    {
      id: "rfs-blockchain",
      title: "rfs-blockchain",
      from: "2023",
      to: null,
      description:
        "Distributed file system on blockchain built from scratch. Custom blockchain implementation for decentralized file storage. Includes consensus mechanisms and file integrity guarantees",
      skills: ["Go", "Blockchain"],
    },
    {
      id: "solo",
      title: "solo",
      from: "2023",
      to: null,
      description:
        "Decentralized marketplace to collect limited edition pre-releases signed by artists. Part of buildspace nights and weekends S2. Focus on artist-fan connections through blockchain collectibles",
      skills: ["Solidity", "Web3", "React", "Go"],
    },
    {
      id: "simpl-ai",
      title: "simpl.ai",
      from: "2022",
      to: null,
      description:
        "2nd place at Hack the Valley UofT hackathon. Document simplification using BART transformer model. AI-powered tool for better readability and comprehension",
      skills: ["Python", "NLP", "BART", "React", "FastAPI"],
    },
    {
      id: "authdeck",
      title: "authdeck",
      from: "2022",
      to: null,
      description:
        "Decentralized identity verification based on reputation scores. Two-way solution to verify humanity without losing anonymity. EthIndia grantee ($5k) and top project at buildspace S1 demo day",
      skills: ["Solidity", "Web3", "TypeScript"],
    },
    {
      id: "timathon-website",
      title: "Timathon - Website for hackathons",
      from: "2021",
      to: null,
      description:
        "Built Django website for hosting hackathons in TWT Discord server (36k+ members). Community collaboration project with multiple developers. Hosted hackathons sponsored by repl.it and AlgoExpert",
      skills: ["Django", "Python"],
    },
    {
      id: "p2p-ping-pong",
      title: "P2P Multiplayer Ping Pong",
      from: "2020",
      to: null,
      description:
        "Built multiplayer ping pong game from scratch using Pygame. Implemented P2P networking using only Python built-in libraries",
      skills: ["Python", "Pygame"],
    },
    {
      id: "line-follower-robot",
      title: "Line Follower & Obstacle Avoider Robot",
      from: "2017",
      to: null,
      description:
        "Built at age 13 using Arduino, LDR sensors, and ultrasonic sensors. Robot follows black lines and avoids obstacles in its path",
      skills: ["Arduino", "C"],
    },
    {
      id: "plant-watering-system",
      title: "Automatic Plant Watering System",
      from: "2017",
      to: null,
      description:
        "Built at age 13 using Arduino and conductivity sensors. Measures soil moisture levels and automatically waters plants. Used motor to intake water from bottle when soil is dry",
      skills: ["Arduino", "C"],
    },
  ];

  for (const project of shubProjects) {
    await prisma.project.upsert({
      where: { id: project.id },
      update: {},
      create: {
        id: project.id,
        title: project.title,
        from: project.from,
        to: project.to,
        description: project.description,
        skills: project.skills,
        collaborators: project.collaborators,
        userId: shubUser.id,
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
