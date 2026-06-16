import { create } from "zustand";
import {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  applyEdgeChanges,
  applyNodeChanges,
} from "reactflow";
import { v4 as uuidv4 } from "uuid";
import {
  Character,
  DialogueNodeData,
  DialogueProject,
  DialogueVariable,
  NodeType,
} from "@/types/dialogue";
import { createExampleProject } from "@/utils/exampleProject";

export type FlowNode = Node<DialogueNodeData>;
export type FlowEdge = Edge;

type DesiredEdge = { sourceHandle: string | null; target: string; label?: string };

/** Derives the outgoing connections a node's data implies, so the canvas can stay in sync with sidebar edits. */
function computeDesiredEdges(node: FlowNode): DesiredEdge[] {
  switch (node.type) {
    case "speech":
    case "input":
      return node.data.nextNodeId ? [{ sourceHandle: null, target: node.data.nextNodeId }] : [];
    case "action":
      if (node.data.action?.type === "end_dialogue") return [];
      return node.data.action?.nextNodeId ? [{ sourceHandle: null, target: node.data.action.nextNodeId }] : [];
    case "choice":
      return (node.data.choices ?? [])
        .filter((c) => c.nextNodeId)
        .map((c) => ({ sourceHandle: c.id, target: c.nextNodeId!, label: c.text }));
    case "boolean": {
      const edges: DesiredEdge[] = [];
      if (node.data.condition?.trueNodeId) {
        edges.push({ sourceHandle: "true", target: node.data.condition.trueNodeId, label: "Verdadeiro" });
      }
      if (node.data.condition?.falseNodeId) {
        edges.push({ sourceHandle: "false", target: node.data.condition.falseNodeId, label: "Falso" });
      }
      return edges;
    }
    default:
      return [];
  }
}

/** Rebuilds the outgoing edges of `node`, replacing whatever edges previously originated from it. */
function syncNodeEdges(edges: FlowEdge[], node: FlowNode): FlowEdge[] {
  const remaining = edges.filter((e) => e.source !== node.id);
  const desired = computeDesiredEdges(node).map((d) => ({
    id: `edge-${uuidv4()}`,
    source: node.id,
    target: d.target,
    sourceHandle: d.sourceHandle,
    label: d.label,
    type: "default" as const,
  }));
  return [...remaining, ...desired];
}

function projectToFlow(project: DialogueProject): { nodes: FlowNode[]; edges: FlowEdge[] } {
  const nodes: FlowNode[] = project.nodes.map((n) => ({
    id: n.id,
    type: n.type,
    position: n.position,
    data: n.data,
  }));

  const edges: FlowEdge[] = project.edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    sourceHandle: e.sourceHandle ?? null,
    label: e.label,
    type: "default",
  }));

  return { nodes, edges };
}

const defaultNodeData: Record<NodeType, DialogueNodeData> = {
  speech: { text: "Nova fala...", characterId: undefined, nextNodeId: undefined },
  choice: { text: "Pergunta...", choices: [] },
  boolean: {
    condition: { variable: "", operator: "==", value: "", trueNodeId: undefined, falseNodeId: undefined },
  },
  input: { text: "Digite algo...", variableName: "", placeholder: "" },
  action: { action: { type: "set_variable", value: "" } },
  end: { text: "Fim da conversa.", endType: "default" },
};

export const nodeTypeLabels: Record<NodeType, string> = {
  speech: "Fala",
  choice: "Múltipla Escolha",
  boolean: "Decisão Booleana",
  input: "Input do Jogador",
  action: "Ação",
  end: "Fim",
};

type DialogueState = {
  id: string;
  title: string;
  sceneName: string;
  characters: Character[];
  variables: DialogueVariable[];
  startNodeId: string;
  createdAt: string;
  updatedAt: string;

  nodes: FlowNode[];
  edges: FlowEdge[];

  selectedNodeId: string | null;
  isPreviewOpen: boolean;
  isSceneSettingsOpen: boolean;

  // Flow handlers
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;

  // Node operations
  addNode: (type: NodeType, position: { x: number; y: number }) => string;
  updateNodeData: (id: string, data: Partial<DialogueNodeData>) => void;
  deleteNode: (id: string) => void;
  duplicateNode: (id: string) => void;
  setSelectedNodeId: (id: string | null) => void;

  // Edge operations
  removeEdge: (id: string) => void;

  // Scene operations
  setTitle: (title: string) => void;
  setSceneName: (name: string) => void;
  addCharacter: (character: Omit<Character, "id">) => void;
  updateCharacter: (id: string, character: Partial<Omit<Character, "id">>) => void;
  removeCharacter: (id: string) => void;
  setStartNodeId: (id: string) => void;

  // Variable operations
  addVariable: (variable: DialogueVariable) => void;
  updateVariable: (name: string, variable: Partial<DialogueVariable>) => void;
  removeVariable: (name: string) => void;

  // Project operations
  loadProject: (project: DialogueProject) => void;
  getProject: () => DialogueProject;

  // UI
  setPreviewOpen: (open: boolean) => void;
  setSceneSettingsOpen: (open: boolean) => void;
  // UI defaults
  defaultNextNodeType: NodeType;
  setDefaultNextNodeType: (type: NodeType) => void;
};

function buildInitialState(project: DialogueProject) {
  const { nodes, edges } = projectToFlow(project);
  return {
    id: project.id,
    title: project.title,
    sceneName: project.sceneName,
    characters: project.characters,
    variables: project.variables,
    startNodeId: project.startNodeId,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    nodes,
    edges,
  };
}

export const useDialogueStore = create<DialogueState>()(
  (set, get) => ({
      ...buildInitialState(createExampleProject()),
      // default type used when creating a "next" node via sidebar button
      defaultNextNodeType: "speech",
      selectedNodeId: null,
      isPreviewOpen: false,
      isSceneSettingsOpen: false,

      onNodesChange: (changes) => {
        set({ nodes: applyNodeChanges(changes, get().nodes) });
      },

      onEdgesChange: (changes) => {
        set({ edges: applyEdgeChanges(changes, get().edges) });
      },

      onConnect: (connection) => {
        const { source, target, sourceHandle } = connection;
        if (!source || !target) return;

        set((state) => {
          let updatedNode: FlowNode | undefined;
          const nodes = state.nodes.map((n) => {
            if (n.id !== source) return n;

            if (n.type === "speech" || n.type === "input") {
              updatedNode = { ...n, data: { ...n.data, nextNodeId: target } };
            } else if (n.type === "action") {
              const action = n.data.action ?? { type: "set_variable" as const, value: "" };
              updatedNode = { ...n, data: { ...n.data, action: { ...action, nextNodeId: target } } };
            } else if (n.type === "choice" && sourceHandle) {
              const choices = (n.data.choices ?? []).map((c) =>
                c.id === sourceHandle ? { ...c, nextNodeId: target } : c
              );
              updatedNode = { ...n, data: { ...n.data, choices } };
            } else if (n.type === "boolean" && (sourceHandle === "true" || sourceHandle === "false")) {
              const condition = n.data.condition ?? {
                variable: "",
                operator: "==" as const,
                value: "",
              };
              const key = sourceHandle === "true" ? "trueNodeId" : "falseNodeId";
              updatedNode = { ...n, data: { ...n.data, condition: { ...condition, [key]: target } } };
            } else {
              return n;
            }

            return updatedNode;
          });

          if (!updatedNode) return { nodes };
          return { nodes, edges: syncNodeEdges(state.edges, updatedNode) };
        });
      },

      addNode: (type, position) => {
        const id = `node-${uuidv4()}`;
        const newNode: FlowNode = {
          id,
          type,
          position,
          data: structuredClone(defaultNodeData[type]),
        };
        set((state) => ({ nodes: [...state.nodes, newNode] }));
        return id;
      },

      updateNodeData: (id, data) => {
        set((state) => {
          let updatedNode: FlowNode | undefined;
          const nodes = state.nodes.map((n) => {
            if (n.id !== id) return n;
            updatedNode = { ...n, data: { ...n.data, ...data } };
            return updatedNode;
          });
          if (!updatedNode) return { nodes };
          return { nodes, edges: syncNodeEdges(state.edges, updatedNode) };
        });
      },

      deleteNode: (id) => {
        set((state) => ({
          nodes: state.nodes.filter((n) => n.id !== id),
          edges: state.edges.filter((e) => e.source !== id && e.target !== id),
          selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
          startNodeId: state.startNodeId === id ? "" : state.startNodeId,
        }));
      },

      duplicateNode: (id) => {
        const node = get().nodes.find((n) => n.id === id);
        if (!node) return;
        const newId = `node-${uuidv4()}`;
        const newNode: FlowNode = {
          ...node,
          id: newId,
          position: { x: node.position.x + 40, y: node.position.y + 40 },
          data: structuredClone(node.data),
          selected: false,
        };
        set((state) => ({ nodes: [...state.nodes, newNode] }));
      },

      setSelectedNodeId: (id) => set({ selectedNodeId: id }),

      removeEdge: (id) => {
        set((state) => ({ edges: state.edges.filter((e) => e.id !== id) }));
      },

      setTitle: (title) => set({ title }),
      setSceneName: (sceneName) => set({ sceneName }),

      addCharacter: (character) => {
        set((state) => ({
          characters: [...state.characters, { ...character, id: `char-${uuidv4()}` }],
        }));
      },

      updateCharacter: (id, character) => {
        set((state) => ({
          characters: state.characters.map((c) => (c.id === id ? { ...c, ...character } : c)),
        }));
      },

      removeCharacter: (id) => {
        set((state) => ({
          characters: state.characters.filter((c) => c.id !== id),
          nodes: state.nodes.map((n) =>
            n.data.characterId === id ? { ...n, data: { ...n.data, characterId: undefined } } : n
          ),
        }));
      },

      setStartNodeId: (id) => set({ startNodeId: id }),

      setDefaultNextNodeType: (type) => set({ defaultNextNodeType: type }),

      addVariable: (variable) => {
        set((state) => {
          if (state.variables.some((v) => v.name === variable.name)) return state;
          return { variables: [...state.variables, variable] };
        });
      },

      updateVariable: (name, variable) => {
        set((state) => ({
          variables: state.variables.map((v) => (v.name === name ? { ...v, ...variable } : v)),
        }));
      },

      removeVariable: (name) => {
        set((state) => ({ variables: state.variables.filter((v) => v.name !== name) }));
      },

      loadProject: (project) => {
        set({ ...buildInitialState(project), selectedNodeId: null });
      },

      getProject: () => {
        const state = get();
        return {
          id: state.id,
          title: state.title,
          sceneName: state.sceneName,
          characters: state.characters,
          startNodeId: state.startNodeId,
          variables: state.variables,
          nodes: state.nodes.map((n) => ({
            id: n.id,
            type: n.type as NodeType,
            position: n.position,
            data: n.data,
          })),
          edges: state.edges.map((e) => ({
            id: e.id,
            source: e.source,
            target: e.target,
            sourceHandle: e.sourceHandle,
            label: typeof e.label === "string" ? e.label : undefined,
          })),
          createdAt: state.createdAt,
          updatedAt: new Date().toISOString(),
        };
      },

      setPreviewOpen: (open) => set({ isPreviewOpen: open }),
      setSceneSettingsOpen: (open) => set({ isSceneSettingsOpen: open }),
  })
);
