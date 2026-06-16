import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProjectList from "@/components/dashboard/ProjectList";
import SignOutButton from "@/components/dashboard/SignOutButton";
import { MessagesSquare } from "@/components/icons";

export default async function ProjectsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  const projects = await prisma.project.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, updatedAt: true },
  });

  return (
    <div className="h-screen w-screen overflow-y-auto bg-bg-900">
      <header className="h-14 flex items-center justify-between gap-4 px-4 border-b border-bg-500 bg-bg-800">
        <div className="flex items-center gap-2">
          <MessagesSquare size={20} className="text-accent" />
          <span className="font-bold text-lg tracking-tight">DialogMaker</span>
        </div>
        <div className="flex items-center gap-3">
          {session.user.name && <span className="text-sm text-gray-400">{session.user.name}</span>}
          <SignOutButton />
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-6">
        <h1 className="text-xl font-bold mb-4">Meus Projetos</h1>
        <ProjectList
          projects={projects.map((p) => ({ id: p.id, title: p.title, updatedAt: p.updatedAt.toISOString() }))}
        />
      </main>
    </div>
  );
}
