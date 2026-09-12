import bcrypt from "bcryptjs";
import { prisma } from "../src/config/prisma";

const main = async () => {
  console.log("🌱 Seeding database...");

  // Clean existing data
  await prisma.refreshToken.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();

  const password = await bcrypt.hash("Password123!", 10);

  // Users
  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@velozity.com",
      password,
      role: "ADMIN",
    },
  });

  const pm1 = await prisma.user.create({
    data: {
      name: "Sarah Manager",
      email: "sarah@velozity.com",
      password,
      role: "PROJECT_MANAGER",
    },
  });

  const pm2 = await prisma.user.create({
    data: {
      name: "John Manager",
      email: "john@velozity.com",
      password,
      role: "PROJECT_MANAGER",
    },
  });

  const developers = await Promise.all(
    [
      ["Alice Developer", "alice@velozity.com"],
      ["Bob Developer", "bob@velozity.com"],
      ["Charlie Developer", "charlie@velozity.com"],
      ["David Developer", "david@velozity.com"],
    ].map(([name, email]) =>
      prisma.user.create({
        data: {
          name,
          email,
          password,
          role: "DEVELOPER",
        },
      })
    )
  );

  // Clients
  const clients = await Promise.all(
    [
      ["Acme Corporation", "client@acme.com"],
      ["Globex Industries", "hello@globex.com"],
      ["Stark Technologies", "contact@stark.com"],
    ].map(([name, email]) =>
      prisma.client.create({
        data: {
          name,
          email,
          company: name,
        },
      })
    )
  );

  // Projects
  const projectData = [
    {
      name: "E-Commerce Platform",
      description: "Modern e-commerce platform development",
      clientId: clients[0].id,
      createdById: pm1.id,
    },
    {
      name: "Mobile Banking App",
      description: "Secure mobile banking application",
      clientId: clients[1].id,
      createdById: pm1.id,
    },
    {
      name: "AI Analytics Dashboard",
      description: "Real-time AI powered analytics dashboard",
      clientId: clients[2].id,
      createdById: pm2.id,
    },
    {
      name: "Customer Portal",
      description: "Customer self-service portal",
      clientId: clients[0].id,
      createdById: pm2.id,
    },
  ];

  const projects = [];

  for (const data of projectData) {
    const project = await prisma.project.create({
      data,
    });

    projects.push(project);
  }

  // Tasks
  const now = new Date();

  const taskTemplates = [
    {
      title: "Design database schema",
      status: "DONE" as const,
      priority: "HIGH" as const,
      dueDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Implement authentication",
      status: "IN_PROGRESS" as const,
      priority: "CRITICAL" as const,
      dueDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Build REST API",
      status: "IN_REVIEW" as const,
      priority: "HIGH" as const,
      dueDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Create dashboard UI",
      status: "TODO" as const,
      priority: "MEDIUM" as const,
      dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Write integration tests",
      status: "TODO" as const,
      priority: "MEDIUM" as const,
      dueDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
    },
  ];

  for (let i = 0; i < projects.length; i++) {
    const project = projects[i];

    for (let j = 0; j < taskTemplates.length; j++) {
      const template = taskTemplates[j];
      const developer = developers[(i + j) % developers.length];

      const task = await prisma.task.create({
        data: {
          title: `${template.title} - ${project.name}`,
          description: `Task for ${project.name}`,
          projectId: project.id,
          assignedDeveloperId: developer.id,
          status: template.status,
          priority: template.priority,
          dueDate: template.dueDate,
        },
      });

      // Activity history
      await prisma.activityLog.create({
        data: {
          type: "TASK_CREATED",
          message: `${task.title} was created`,
          taskId: task.id,
          projectId: project.id,
          userId: project.createdById,
        },
      });

      if (template.status !== "TODO") {
        await prisma.activityLog.create({
          data: {
            type: "TASK_STATUS_CHANGED",
            message: `${task.title} status changed to ${template.status}`,
            taskId: task.id,
            projectId: project.id,
            userId: project.createdById,
            metadata: {
              status: template.status,
            },
          },
        });
      }
    }
  }

  // Notifications
  for (const developer of developers) {
    await prisma.notification.create({
      data: {
        userId: developer.id,
        title: "Welcome to Velozity",
        message: "You have new tasks assigned to you.",
      },
    });
  }

  await prisma.notification.create({
    data: {
      userId: admin.id,
      title: "Dashboard Ready",
      message: "Velozity project dashboard has been initialized.",
    },
  });

  console.log("✅ Seed completed!");
  console.log("");
  console.log("Login accounts:");
  console.log("Admin: admin@velozity.com / Password123!");
  console.log("PM:    sarah@velozity.com / Password123!");
  console.log("PM:    john@velozity.com / Password123!");
  console.log("Dev:   alice@velozity.com / Password123!");
  console.log("Dev:   bob@velozity.com / Password123!");
  console.log("Dev:   charlie@velozity.com / Password123!");
  console.log("Dev:   david@velozity.com / Password123!");
};

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });