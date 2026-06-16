import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DialogueProject } from "@/types/dialogue";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const project = await prisma.project.findFirst({
    where: { id: params.id, userId: session.user.id },
  });

  if (!project) {
    return NextResponse.json({ error: "Projeto não encontrado." }, { status: 404 });
  }

  return NextResponse.json(project);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const existing = await prisma.project.findFirst({
    where: { id: params.id, userId: session.user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Projeto não encontrado." }, { status: 404 });
  }

  const body: DialogueProject = await req.json();

  const updated = await prisma.project.update({
    where: { id: params.id },
    data: {
      title: body.title,
      data: body,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const existing = await prisma.project.findFirst({
    where: { id: params.id, userId: session.user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Projeto não encontrado." }, { status: 404 });
  }

  await prisma.project.delete({ where: { id: params.id } });

  return NextResponse.json({ ok: true });
}
