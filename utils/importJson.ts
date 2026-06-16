import { DialogueProject } from "@/types/dialogue";

export class ImportError extends Error {}

/** Parses and lightly validates a JSON string as a DialogueProject. */
export function parseProjectJson(json: string): DialogueProject {
  let data: unknown;
  try {
    data = JSON.parse(json);
  } catch {
    throw new ImportError("Arquivo JSON inválido: não foi possível interpretar o conteúdo.");
  }

  if (typeof data !== "object" || data === null) {
    throw new ImportError("Arquivo JSON inválido: estrutura inesperada.");
  }

  const project = data as Partial<DialogueProject>;

  if (!Array.isArray(project.nodes) || !Array.isArray(project.edges)) {
    throw new ImportError('Arquivo JSON inválido: campos "nodes" e "edges" são obrigatórios.');
  }

  return {
    id: project.id ?? `project-${Date.now()}`,
    title: project.title ?? "Projeto Importado",
    sceneName: project.sceneName ?? "Cena Importada",
    characters: project.characters ?? [],
    startNodeId: project.startNodeId ?? "",
    nodes: project.nodes,
    edges: project.edges,
    variables: project.variables ?? [],
    createdAt: project.createdAt ?? new Date().toISOString(),
    updatedAt: project.updatedAt ?? new Date().toISOString(),
  };
}

/** Reads a File (from an <input type="file">) and resolves with its DialogueProject contents. */
export function readProjectFile(file: File): Promise<DialogueProject> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        resolve(parseProjectJson(String(reader.result)));
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new ImportError("Não foi possível ler o arquivo."));
    reader.readAsText(file);
  });
}
