"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus, Trash, MessagesSquare } from "@/components/icons";

type Project = { id: string; title: string; updatedAt: string };

export default function ProjectList({ projects }: { projects: Project[] }) {
  const router = useRouter();
  const [items, setItems] = useState(projects);
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const res = await fetch("/api/projects", { method: "POST" });
      if (!res.ok) throw new Error("Falha ao criar projeto.");
      const { id } = await res.json();
      router.push(`/projects/${id}`);
    } catch {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este projeto? Essa ação não pode ser desfeita.")) return;
    const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
    if (res.ok) {
      setItems((prev) => prev.filter((p) => p.id !== id));
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <button onClick={handleCreate} disabled={creating} className="btn btn-primary self-start">
        <Plus size={14} /> Novo Projeto
      </button>

      {items.length === 0 && (
        <p className="text-sm text-gray-500 italic mt-4">Nenhum projeto ainda. Crie o primeiro acima.</p>
      )}

      <div className="flex flex-col gap-2 mt-2">
        {items.map((project) => (
          <div
            key={project.id}
            className="flex items-center justify-between gap-3 bg-bg-800 border border-bg-500 rounded-xl px-4 py-3 hover:border-accent transition-colors"
          >
            <button
              onClick={() => router.push(`/projects/${project.id}`)}
              className="flex items-center gap-3 flex-1 text-left min-w-0"
            >
              <MessagesSquare size={18} className="text-accent shrink-0" />
              <span className="font-medium truncate">{project.title}</span>
              <span className="text-xs text-gray-500 shrink-0">
                Atualizado em {new Date(project.updatedAt).toLocaleString("pt-BR")}
              </span>
            </button>
            <button
              onClick={() => handleDelete(project.id)}
              className="btn btn-danger px-2"
              title="Excluir projeto"
            >
              <Trash size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
