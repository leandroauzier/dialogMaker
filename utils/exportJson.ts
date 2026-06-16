import { DialogueProject, DialogueVariable } from "@/types/dialogue";
import { extractVariableNames } from "./variableParser";

export type ValidationResult = {
  errors: string[];
  warnings: string[];
};

/**
 * Validates a project before export / preview.
 * - errors block export entirely
 * - warnings are informational but don't block export
 */
export function validateProject(project: DialogueProject): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!project.startNodeId || !project.nodes.some((n) => n.id === project.startNodeId)) {
    errors.push("Nenhum bloco inicial definido. Selecione um bloco e marque-o como inicial.");
  }

  const nodeIds = new Set(project.nodes.map((n) => n.id));

  // Disconnected nodes: not the start node and not referenced by any edge/connection target.
  const referencedTargets = new Set<string>();
  project.edges.forEach((e) => referencedTargets.add(e.target));
  project.nodes.forEach((n) => {
    if (n.data.nextNodeId) referencedTargets.add(n.data.nextNodeId);
    n.data.choices?.forEach((c) => {
      if (c.nextNodeId) referencedTargets.add(c.nextNodeId);
    });
    if (n.data.condition?.trueNodeId) referencedTargets.add(n.data.condition.trueNodeId);
    if (n.data.condition?.falseNodeId) referencedTargets.add(n.data.condition.falseNodeId);
    if (n.data.action?.nextNodeId) referencedTargets.add(n.data.action.nextNodeId);
  });

  project.nodes.forEach((n) => {
    if (n.id === project.startNodeId) return;
    if (!referencedTargets.has(n.id)) {
      warnings.push(`O bloco "${n.id}" (${n.type}) está desconectado da árvore.`);
    }
  });

  // Choices without a destination
  project.nodes.forEach((n) => {
    if (n.type === "choice") {
      (n.data.choices ?? []).forEach((c, idx) => {
        if (!c.nextNodeId || !nodeIds.has(c.nextNodeId)) {
          warnings.push(
            `A opção ${idx + 1} ("${c.text || "sem texto"}") do bloco "${n.id}" não aponta para nenhum próximo bloco.`
          );
        }
      });
    }

    if (n.type === "boolean") {
      const cond = n.data.condition;
      if (!cond?.trueNodeId || !nodeIds.has(cond.trueNodeId)) {
        warnings.push(`O bloco de decisão "${n.id}" não define um caminho para "verdadeiro".`);
      }
      if (!cond?.falseNodeId || !nodeIds.has(cond.falseNodeId)) {
        warnings.push(`O bloco de decisão "${n.id}" não define um caminho para "falso".`);
      }
    }

    if ((n.type === "speech" || n.type === "input") && (!n.data.nextNodeId || !nodeIds.has(n.data.nextNodeId))) {
      warnings.push(`O bloco "${n.id}" (${n.type}) não tem um próximo bloco definido.`);
    }

    if (n.type === "action" && n.data.action?.type !== "end_dialogue") {
      const nextId = n.data.action?.nextNodeId;
      if (!nextId || !nodeIds.has(nextId)) {
        warnings.push(`O bloco de ação "${n.id}" não tem um próximo bloco definido.`);
      }
    }
  });

  // Variables used in {{variable}} but never created by input/action
  const definedVariables = new Set(project.variables.map((v) => v.name));
  project.nodes.forEach((n) => {
    if (n.type === "input" && n.data.variableName) definedVariables.add(n.data.variableName);
    if (n.type === "action" && n.data.action?.type === "set_variable" && n.data.action.value) {
      const varName = n.data.action.value.split("=")[0]?.trim();
      if (varName) definedVariables.add(varName);
    }
  });

  const usedVariables = new Set<string>();
  project.nodes.forEach((n) => {
    extractVariableNames(n.data.text).forEach((v) => usedVariables.add(v));
  });

  usedVariables.forEach((name) => {
    if (!definedVariables.has(name)) {
      warnings.push(
        `A variável "{{${name}}}" é usada em uma fala, mas não é criada por nenhum bloco de input ou ação.`
      );
    }
  });

  return { errors, warnings };
}

/** Derives the full variable list (declared + auto-detected from input/action nodes). */
export function deriveVariables(project: DialogueProject): DialogueVariable[] {
  const existing = new Map(project.variables.map((v) => [v.name, v]));

  project.nodes.forEach((n) => {
    if (n.type === "input" && n.data.variableName && !existing.has(n.data.variableName)) {
      existing.set(n.data.variableName, {
        name: n.data.variableName,
        type: "string",
        defaultValue: "",
      });
    }
    if (n.type === "action" && n.data.action?.type === "set_variable" && n.data.action.value) {
      const [varName] = n.data.action.value.split("=").map((s) => s.trim());
      if (varName && !existing.has(varName)) {
        existing.set(varName, { name: varName, type: "string", defaultValue: "" });
      }
    }
  });

  return Array.from(existing.values());
}

/** Triggers a browser download of the project as a formatted JSON file. */
export function downloadProjectAsJson(project: DialogueProject) {
  const fullProject: DialogueProject = {
    ...project,
    variables: deriveVariables(project),
  };

  const json = JSON.stringify(fullProject, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  const safeName = (project.title || "dialogmaker-project").replace(/[^a-z0-9-_]+/gi, "_");
  link.download = `${safeName}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
