import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { v4 as uuidv4 } from "uuid";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createBlankProject } from "@/utils/exampleProject";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const id = `project-${uuidv4()}`;
  const project = createBlankProject(id);

  const created = await prisma.project.create({
    data: {
      id,
      userId: session.user.id,
      title: project.title,
      data: project,
    },
  });

  return NextResponse.json({ id: created.id });
}
