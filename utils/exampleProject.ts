import { DialogueProject } from "@/types/dialogue";

export function createBlankProject(id: string, title = "Novo Projeto"): DialogueProject {
  const now = new Date().toISOString();
  return {
    id,
    title,
    sceneName: "Nova Cena",
    characters: [],
    startNodeId: "",
    nodes: [],
    edges: [],
    variables: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function createExampleProject(): DialogueProject {
  const now = new Date().toISOString();

  return {
    id: "example-project",
    title: "Projeto de Exemplo",
    sceneName: "Entrada da Vila",
    characters: [
      { id: "char-guard", name: "Guarda", color: "#6366f1", description: "Guarda da entrada da vila" },
      { id: "char-player", name: "Jogador", color: "#22c55e", description: "Personagem controlado pelo jogador" },
    ],
    startNodeId: "node-1",
    variables: [
      { name: "playerName", type: "string", defaultValue: "" },
      { name: "hasKey", type: "boolean", defaultValue: false },
    ],
    nodes: [
      {
        id: "node-1",
        type: "speech",
        position: { x: 0, y: 0 },
        data: {
          characterId: "char-guard",
          text: "Olá, viajante! Bem-vindo à Entrada da Vila.",
          nextNodeId: "node-2",
        },
      },
      {
        id: "node-2",
        type: "choice",
        position: { x: 0, y: 200 },
        data: {
          text: "O que você deseja fazer?",
          choices: [
            { id: "choice-1", text: "Conversar com o guarda", nextNodeId: "node-3" },
            { id: "choice-2", text: "Ir embora", nextNodeId: "node-8" },
          ],
        },
      },
      {
        id: "node-3",
        type: "input",
        position: { x: -260, y: 400 },
        data: {
          text: "Antes de mais nada, qual é o seu nome?",
          variableName: "playerName",
          placeholder: "Digite seu nome",
          nextNodeId: "node-4",
        },
      },
      {
        id: "node-4",
        type: "speech",
        position: { x: -260, y: 600 },
        data: {
          characterId: "char-guard",
          text: "Prazer em conhecer você, {{playerName}}!",
          nextNodeId: "node-5",
        },
      },
      {
        id: "node-5",
        type: "boolean",
        position: { x: -260, y: 800 },
        data: {
          condition: {
            variable: "hasKey",
            operator: "==",
            value: true,
            trueNodeId: "node-6",
            falseNodeId: "node-9",
          },
        },
      },
      {
        id: "node-6",
        type: "speech",
        position: { x: -420, y: 1000 },
        data: {
          characterId: "char-guard",
          text: "Você possui a chave. Pode entrar na vila!",
          nextNodeId: "node-7",
        },
      },
      {
        id: "node-9",
        type: "speech",
        position: { x: -100, y: 1000 },
        data: {
          characterId: "char-guard",
          text: "Você precisa de uma chave para entrar na vila.",
          nextNodeId: "node-7",
        },
      },
      {
        id: "node-7",
        type: "end",
        position: { x: -260, y: 1200 },
        data: {
          text: "Fim da conversa.",
          endType: "default",
        },
      },
      {
        id: "node-8",
        type: "end",
        position: { x: 260, y: 400 },
        data: {
          text: "Você foi embora.",
          endType: "default",
        },
      },
    ],
    edges: [
      { id: "edge-1", source: "node-1", target: "node-2" },
      { id: "edge-2", source: "node-2", target: "node-3", sourceHandle: "choice-1", label: "Conversar com o guarda" },
      { id: "edge-3", source: "node-2", target: "node-8", sourceHandle: "choice-2", label: "Ir embora" },
      { id: "edge-4", source: "node-3", target: "node-4" },
      { id: "edge-5", source: "node-4", target: "node-5" },
      { id: "edge-6", source: "node-5", target: "node-6", sourceHandle: "true", label: "Verdadeiro" },
      { id: "edge-7", source: "node-5", target: "node-9", sourceHandle: "false", label: "Falso" },
      { id: "edge-8", source: "node-6", target: "node-7" },
      { id: "edge-9", source: "node-9", target: "node-7" },
    ],
    createdAt: now,
    updatedAt: now,
  };
}
