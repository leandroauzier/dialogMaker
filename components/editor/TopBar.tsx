"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useDialogueStore } from "@/store/dialogueStore";
import { downloadProjectAsJson, validateProject } from "@/utils/exportJson";
import { readProjectFile, ImportError } from "@/utils/importJson";
import {
  MessagesSquare,
  Save,
  FolderOpen,
  Download,
  Play,
  X,
  LayoutDashboard,
} from "@/components/icons";

export default function TopBar({ projectId }: { projectId: string }) {
  const title = useDialogueStore((s) => s.title);
  const setTitle = useDialogueStore((s) => s.setTitle);
  const getProject = useDialogueStore((s) => s.getProject);
  const loadProject = useDialogueStore((s) => s.loadProject);
  const setPreviewOpen = useDialogueStore((s) => s.setPreviewOpen);
  const router = useRouter();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [notice, setNotice] = useState<{ type: "info" | "warning" | "error"; messages: string[] } | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const project = getProject();
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(project),
      });
      if (!res.ok) throw new Error("Falha ao salvar.");
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 1500);
    } catch {
      setNotice({ type: "error", messages: ["Não foi possível salvar o projeto."] });
    } finally {
      setSaving(false);
    }
  };

  const handleExport = () => {
    const project = getProject();
    const { errors, warnings } = validateProject(project);

    if (errors.length > 0) {
      setNotice({ type: "error", messages: errors });
      return;
    }

    if (warnings.length > 0) {
      setNotice({ type: "warning", messages: warnings });
    } else {
      setNotice(null);
    }

    downloadProjectAsJson(project);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const project = await readProjectFile(file);
      loadProject(project);
      setNotice({ type: "info", messages: ["Projeto importado com sucesso."] });
    } catch (err) {
      const message = err instanceof ImportError ? err.message : "Erro ao importar o arquivo.";
      setNotice({ type: "error", messages: [message] });
    } finally {
      e.target.value = "";
    }
  };

  const handleBackToProjects = () => {
    router.push("/projects");
  };

  const handlePreview = () => {
    const project = getProject();
    const { errors } = validateProject(project);
    if (errors.length > 0) {
      setNotice({ type: "error", messages: errors });
      return;
    }
    setPreviewOpen(true);
  };

  return (
    <div className="relative">
      <header className="h-14 flex items-center justify-between gap-4 px-4 border-b border-bg-500 bg-bg-800">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2 shrink-0">
            <MessagesSquare size={20} className="text-accent" />
            <span className="font-bold text-lg tracking-tight">DialogMaker</span>
          </div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-field max-w-xs"
            placeholder="Nome do projeto"
          />
        </div>

        <div className="flex items-center gap-2">
          {savedFlash && <span className="text-xs text-green-400 mr-1">Salvo!</span>}
          <button onClick={handleBackToProjects} className="btn btn-secondary">
            <LayoutDashboard size={14} /> Meus Projetos
          </button>
          <button onClick={handleSave} disabled={saving} className="btn btn-secondary">
            <Save size={14} /> {saving ? "Salvando..." : "Salvar"}
          </button>
          <button onClick={handleImportClick} className="btn btn-secondary">
            <FolderOpen size={14} /> Importar JSON
          </button>
          <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={handleFileChange} />
          <button onClick={handleExport} className="btn btn-secondary">
            <Download size={14} /> Exportar JSON
          </button>
          <button onClick={handlePreview} className="btn btn-primary">
            <Play size={14} /> Preview
          </button>
        </div>
      </header>

      {notice && (
        <div
          className={`absolute right-4 top-16 z-50 w-96 max-h-72 overflow-y-auto rounded-xl border p-3 shadow-xl text-sm ${
            notice.type === "error"
              ? "bg-red-950/90 border-red-700 text-red-200"
              : notice.type === "warning"
              ? "bg-amber-950/90 border-amber-700 text-amber-200"
              : "bg-bg-700 border-bg-500 text-gray-200"
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-semibold">
              {notice.type === "error" ? "Não é possível exportar" : notice.type === "warning" ? "Avisos" : "Info"}
            </span>
            <button onClick={() => setNotice(null)} className="text-gray-400 hover:text-gray-200">
              <X size={16} />
            </button>
          </div>
          <ul className="list-disc pl-4 space-y-1">
            {notice.messages.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
