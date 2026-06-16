import { DialogueNode, DialogueProject, ConditionOperator } from "@/types/dialogue";
import { resolveVariables } from "./variableParser";

export type PreviewVariables = Record<string, string | number | boolean>;

export type PreviewState = {
  currentNodeId: string | null;
  variables: PreviewVariables;
  finished: boolean;
  loopDetected: boolean;
  history: string[];
};

const MAX_AUTO_STEPS = 200;

function toComparable(value: string | number | boolean): string | number | boolean {
  if (typeof value === "string") {
    if (value === "true") return true;
    if (value === "false") return false;
    if (value !== "" && !Number.isNaN(Number(value))) return Number(value);
  }
  return value;
}

export function evaluateCondition(
  variables: PreviewVariables,
  variableName: string,
  operator: ConditionOperator,
  expected: string | number | boolean
): boolean {
  const rawCurrent = variables[variableName];
  const current = toComparable(rawCurrent ?? "");
  const target = toComparable(expected);

  switch (operator) {
    case "==":
      return current === target;
    case "!=":
      return current !== target;
    case ">":
      return Number(current) > Number(target);
    case "<":
      return Number(current) < Number(target);
    case ">=":
      return Number(current) >= Number(target);
    case "<=":
      return Number(current) <= Number(target);
    default:
      return false;
  }
}

function applyAction(node: DialogueNode, variables: PreviewVariables): PreviewVariables {
  const action = node.data.action;
  if (!action || action.type !== "set_variable" || !action.value) return variables;

  const [name, rawValue] = action.value.split("=").map((s) => s.trim());
  if (!name) return variables;

  let value: string | number | boolean = rawValue ?? "";
  if (value === "true") value = true;
  else if (value === "false") value = false;
  else if (value !== "" && !Number.isNaN(Number(value))) value = Number(value);

  return { ...variables, [name]: value };
}

function getNextNodeId(node: DialogueNode, variables: PreviewVariables): string | null {
  switch (node.type) {
    case "boolean": {
      const cond = node.data.condition;
      if (!cond) return null;
      const result = evaluateCondition(variables, cond.variable, cond.operator, cond.value);
      return (result ? cond.trueNodeId : cond.falseNodeId) ?? null;
    }
    case "action":
      if (node.data.action?.type === "end_dialogue") return null;
      return node.data.action?.nextNodeId ?? null;
    default:
      return null;
  }
}

/**
 * Starting from `startId`, automatically resolves boolean / set-variable action nodes
 * until reaching a node that requires user interaction (speech, choice, input),
 * an end node, or a dead end. Stops early (with `loopDetected: true`) if it
 * exceeds MAX_AUTO_STEPS, to guard against infinite loops in the graph.
 */
export function autoResolve(
  project: DialogueProject,
  startId: string,
  initialVariables: PreviewVariables
): { nodeId: string | null; variables: PreviewVariables; loopDetected: boolean } {
  let currentId: string | null = startId;
  let variables = { ...initialVariables };
  let steps = 0;

  while (currentId) {
    const node = project.nodes.find((n) => n.id === currentId);
    if (!node) return { nodeId: null, variables, loopDetected: false };

    if (node.type === "action" && node.data.action?.type === "set_variable") {
      variables = applyAction(node, variables);
      const next = getNextNodeId(node, variables);
      if (next === null) return { nodeId: node.id, variables, loopDetected: false };
      currentId = next;
    } else if (node.type === "boolean") {
      const next = getNextNodeId(node, variables);
      if (next === null) return { nodeId: node.id, variables, loopDetected: false };
      currentId = next;
    } else {
      return { nodeId: node.id, variables, loopDetected: false };
    }

    steps += 1;
    if (steps > MAX_AUTO_STEPS) {
      return { nodeId: currentId, variables, loopDetected: true };
    }
  }

  return { nodeId: null, variables, loopDetected: false };
}

export function buildInitialVariables(project: DialogueProject): PreviewVariables {
  const variables: PreviewVariables = {};
  project.variables.forEach((v) => {
    variables[v.name] = v.defaultValue ?? (v.type === "number" ? 0 : v.type === "boolean" ? false : "");
  });
  return variables;
}

export function createInitialPreviewState(project: DialogueProject): PreviewState {
  const variables = buildInitialVariables(project);
  if (!project.startNodeId) {
    return { currentNodeId: null, variables, finished: true, loopDetected: false, history: [] };
  }

  const resolved = autoResolve(project, project.startNodeId, variables);
  return {
    currentNodeId: resolved.nodeId,
    variables: resolved.variables,
    finished: resolved.nodeId === null,
    loopDetected: resolved.loopDetected,
    history: resolved.nodeId ? [resolved.nodeId] : [],
  };
}

/** Advances the preview after the user interacts with the current node (continue/choice/input). */
export function advancePreview(
  project: DialogueProject,
  state: PreviewState,
  nextNodeId: string | null,
  variablesUpdate: PreviewVariables = {}
): PreviewState {
  const variables = { ...state.variables, ...variablesUpdate };

  if (!nextNodeId) {
    return { ...state, currentNodeId: null, variables, finished: true };
  }

  const resolved = autoResolve(project, nextNodeId, variables);
  return {
    currentNodeId: resolved.nodeId,
    variables: resolved.variables,
    finished: resolved.nodeId === null,
    loopDetected: resolved.loopDetected,
    history: resolved.nodeId ? [...state.history, resolved.nodeId] : state.history,
  };
}

export function getResolvedText(text: string | undefined, variables: PreviewVariables): string {
  return resolveVariables(text, variables);
}
