import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DialogueProject } from "@/types/dialogue";
import DialogueEditor from "@/components/editor/DialogueEditor";

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  const project = await prisma.project.findFirst({
    where: { id: params.id, userId: session.user.id },
  });

  if (!project) {
    notFound();
  }

  return (
    <DialogueEditor
      projectId={project.id}
      initialProject={project.data as unknown as DialogueProject}
      initialTitle={project.title}
    />
  );
}
