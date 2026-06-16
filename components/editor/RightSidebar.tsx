"use client";

import { useDialogueStore, nodeTypeLabels, FlowNode } from "@/store/dialogueStore";
import { ConditionOperator, ActionType, EndType, DialogueChoice } from "@/types/dialogue";
import { actionTypeLabels } from "@/components/nodes/ActionNode";
import { endTypeLabels } from "@/components/nodes/EndNode";
import { Settings, X, Star, Copy, Trash2 } from "@/components/icons";
import { v4 as uuidv4 } from "uuid";

const OPERATORS: ConditionOperator[] = ["==", "!=", ">", "<", ">=", "<="];
const ACTION_TYPES: ActionType[] = [
  "start_quest",
  "finish_quest",
  "give_item",
  "remove_item",
  "open_shop",
  "set_variable",
  "end_dialogue",
];
const END_TYPES: EndType[] = ["default", "success", "failure", "custom"];

function nodeSummary(node: FlowNode): string {
  switch (node.type) {
    case "speech":
      return node.data.text?.slice(0, 24) || "(sem texto)";
    case "choice":
      return node.data.text?.slice(0, 24) || "(escolha)";
    case "boolean":
      return node.data.condition?.variable ? `se ${node.data.condition.variable}...` : "(condição)";
    case "input":
      return node.data.variableName ? `→ {{${node.data.variableName}}}` : "(input)";
    case "action":
      return node.data.action ? actionTypeLabels[node.data.action.type] : "(ação)";
    case "end":
      return node.data.text?.slice(0, 24) || "(fim)";
    default:
      return "";
  }
}

function NodeSelect({
  value,
  onChange,
  excludeId,
  allowEmpty = true,
}: {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  excludeId?: string;
  allowEmpty?: boolean;
}) {
  const nodes = useDialogueStore((s) => s.nodes);

  return (
    <select
      className="input-field"
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value || undefined)}
    >
      {allowEmpty && <option value="">-- Nenhum --</option>}
      {nodes
        .filter((n) => n.id !== excludeId)
        .map((n) => (
          <option key={n.id} value={n.id}>
            [{nodeTypeLabels[n.type as keyof typeof nodeTypeLabels]}] {nodeSummary(n)}
          </option>
        ))}
    </select>
  );
}

function NodeActionsFooter({ nodeId }: { nodeId: string }) {
  const startNodeId = useDialogueStore((s) => s.startNodeId);
  const setStartNodeId = useDialogueStore((s) => s.setStartNodeId);
  const duplicateNode = useDialogueStore((s) => s.duplicateNode);
  const deleteNode = useDialogueStore((s) => s.deleteNode);
  const setSelectedNodeId = useDialogueStore((s) => s.setSelectedNodeId);

  const isStart = startNodeId === nodeId;

  return (
    <div className="flex flex-col gap-2 pt-3 mt-3 border-t border-bg-500">
      <button
        onClick={() => setStartNodeId(nodeId)}
        disabled={isStart}
        className={`btn ${isStart ? "btn-secondary opacity-60" : "btn-secondary"}`}
      >
        <Star size={14} fill={isStart ? "currentColor" : "none"} />
        {isStart ? "Bloco inicial" : "Marcar como bloco inicial"}
      </button>
      <div className="flex gap-2">
        <button onClick={() => duplicateNode(nodeId)} className="btn btn-secondary flex-1">
          <Copy size={14} /> Duplicar
        </button>
        <button
          onClick={() => {
            if (confirm("Excluir este bloco?")) {
              deleteNode(nodeId);
              setSelectedNodeId(null);
            }
          }}
          className="btn btn-danger flex-1"
        >
          <Trash2 size={14} /> Excluir
        </button>
      </div>
    </div>
  );
}

function CreateAndConnectRow({ onCreate }: { onCreate: (type: string) => void }) {
  const defaultNextNodeType = useDialogueStore((s) => s.defaultNextNodeType);
  const setDefaultNextNodeType = useDialogueStore((s) => s.setDefaultNextNodeType);
  return (
    <div className="flex items-center gap-2 mt-1">
      <select
        className="input-field flex-1"
        value={defaultNextNodeType}
        onChange={(e) => setDefaultNextNodeType(e.target.value as any)}
      >
        {(Object.keys(nodeTypeLabels) as (keyof typeof nodeTypeLabels)[]).map((type) => (
          <option key={type} value={type}>
            {nodeTypeLabels[type]}
          </option>
        ))}
      </select>
      <button className="btn btn-primary text-xs shrink-0" onClick={() => onCreate(defaultNextNodeType)}>
        Criar e conectar
      </button>
    </div>
  );
}

function SpeechEditor({ node }: { node: FlowNode }) {
  const characters = useDialogueStore((s) => s.characters);
  const updateNodeData = useDialogueStore((s) => s.updateNodeData);
  const addNode = useDialogueStore((s) => s.addNode);
  const setSelectedNodeId = useDialogueStore((s) => s.setSelectedNodeId);

  return (
    <div className="flex flex-col gap-3">
      <div>
        <label className="input-label">Personagem</label>
        <select
          className="input-field"
          value={node.data.characterId ?? ""}
          onChange={(e) => updateNodeData(node.id, { characterId: e.target.value || undefined })}
        >
          <option value="">-- Selecionar --</option>
          {characters.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="input-label">Texto da fala</label>
        <textarea
          className="input-field min-h-[100px] resize-y"
          value={node.data.text ?? ""}
          onChange={(e) => updateNodeData(node.id, { text: e.target.value })}
          placeholder="Digite a fala... use {{variavel}} para inserir variáveis"
        />
      </div>
      <div>
        <label className="input-label">Linkar com bloco Existente</label>
        <NodeSelect
          value={node.data.nextNodeId}
          excludeId={node.id}
          onChange={(value) => updateNodeData(node.id, { nextNodeId: value })}
        />
      </div>
      <div>
        <label className="input-label">Configurar Próximo bloco</label>
        <CreateAndConnectRow onCreate={(type) => {
          const newId = addNode(type as any, { x: node.position.x + 240, y: node.position.y + 40 });
          updateNodeData(node.id, { nextNodeId: newId });
          setSelectedNodeId(newId);
        }} />
      </div>
    </div >
  );
}

function ChoiceEditor({ node }: { node: FlowNode }) {
  const updateNodeData = useDialogueStore((s) => s.updateNodeData);
  const choices = node.data.choices ?? [];
  const addNode = useDialogueStore((s) => s.addNode);
  const setSelectedNodeId = useDialogueStore((s) => s.setSelectedNodeId);
  const updateChoice = (id: string, patch: Partial<DialogueChoice>) => {
    updateNodeData(node.id, {
      choices: choices.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    });
  };

  const removeChoice = (id: string) => {
    updateNodeData(node.id, { choices: choices.filter((c) => c.id !== id) });
  };

  const addChoice = () => {
    updateNodeData(node.id, {
      choices: [...choices, { id: `choice-${uuidv4()}`, text: "Nova opção" }],
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <div>
        <label className="input-label">Texto principal / pergunta</label>
        <textarea
          className="input-field min-h-[80px] resize-y"
          value={node.data.text ?? ""}
          onChange={(e) => updateNodeData(node.id, { text: e.target.value })}
          placeholder="Ex: O que você deseja fazer?"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="input-label">Opções</label>
        {choices.map((choice, idx) => (
          <div key={choice.id} className="border border-bg-500 rounded-lg p-2 flex flex-col gap-2 bg-bg-700">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Opção {idx + 1}</span>
              <button onClick={() => removeChoice(choice.id)} className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1">
                <X size={12} /> remover
              </button>
            </div>
            <input
              className="input-field"
              value={choice.text}
              onChange={(e) => updateChoice(choice.id, { text: e.target.value })}
              placeholder="Texto da opção"
            />
            <NodeSelect
              value={choice.nextNodeId}
              excludeId={node.id}
              onChange={(value) => updateChoice(choice.id, { nextNodeId: value })}
            />
            <CreateAndConnectRow onCreate={(type) => {
              const newId = addNode(type as any, { x: node.position.x + 240, y: node.position.y + 40 + idx * 40 });
              updateChoice(choice.id, { nextNodeId: newId });
              setSelectedNodeId(newId);
            }} />
          </div>
        ))}
        <button onClick={addChoice} className="btn btn-secondary">
          + Adicionar opção
        </button>
      </div>
    </div>
  );
}

function BooleanEditor({ node }: { node: FlowNode }) {
  const updateNodeData = useDialogueStore((s) => s.updateNodeData);
  const condition = node.data.condition ?? { variable: "", operator: "==" as ConditionOperator, value: "" };

  const update = (patch: Partial<typeof condition>) => {
    updateNodeData(node.id, { condition: { ...condition, ...patch } });
  };
  const addNode = useDialogueStore((s) => s.addNode);
  const setSelectedNodeId = useDialogueStore((s) => s.setSelectedNodeId);

  return (
    <div className="flex flex-col gap-3">
      <div>
        <label className="input-label">Variável</label>
        <input
          className="input-field font-mono"
          value={condition.variable}
          onChange={(e) => update({ variable: e.target.value })}
          placeholder="hasKey"
        />
      </div>
      <div>
        <label className="input-label">Operador</label>
        <select
          className="input-field"
          value={condition.operator}
          onChange={(e) => update({ operator: e.target.value as ConditionOperator })}
        >
          {OPERATORS.map((op) => (
            <option key={op} value={op}>
              {op}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="input-label">Valor esperado</label>
        <input
          className="input-field font-mono"
          value={String(condition.value)}
          onChange={(e) => update({ value: e.target.value })}
          placeholder="true / false / 10 / texto"
        />
      </div>
      <div>
        <label className="input-label">Caminho se verdadeiro</label>
        <NodeSelect
          value={condition.trueNodeId}
          excludeId={node.id}
          onChange={(value) => update({ trueNodeId: value })}
        />
        <CreateAndConnectRow onCreate={(type) => {
          const newId = addNode(type as any, { x: node.position.x + 240, y: node.position.y + 40 });
          update({ trueNodeId: newId });
          setSelectedNodeId(newId);
        }} />
      </div>
      <div>
        <label className="input-label">Caminho se falso</label>
        <NodeSelect
          value={condition.falseNodeId}
          excludeId={node.id}
          onChange={(value) => update({ falseNodeId: value })}
        />
        <CreateAndConnectRow onCreate={(type) => {
          const newId = addNode(type as any, { x: node.position.x + 240, y: node.position.y + 40 });
          update({ falseNodeId: newId });
          setSelectedNodeId(newId);
        }} />
      </div>
    </div>
  );
}

function InputEditor({ node }: { node: FlowNode }) {
  const updateNodeData = useDialogueStore((s) => s.updateNodeData);
  const addNode = useDialogueStore((s) => s.addNode);
  const setSelectedNodeId = useDialogueStore((s) => s.setSelectedNodeId);
  const defaultNextNodeType = useDialogueStore((s) => s.defaultNextNodeType);

  return (
    <div className="flex flex-col gap-3">
      <div>
        <label className="input-label">Texto exibido antes do input</label>
        <textarea
          className="input-field min-h-[80px] resize-y"
          value={node.data.text ?? ""}
          onChange={(e) => updateNodeData(node.id, { text: e.target.value })}
          placeholder="Ex: Informe seu nome"
        />
      </div>
      <div>
        <label className="input-label">Nome da variável</label>
        <input
          className="input-field font-mono"
          value={node.data.variableName ?? ""}
          onChange={(e) => updateNodeData(node.id, { variableName: e.target.value })}
          placeholder="playerName"
        />
        <p className="text-[11px] text-gray-500 mt-1">
          Use <code className="text-teal-300">{`{{${node.data.variableName || "variavel"}}}`}</code> em falas futuras
          para exibir o valor digitado.
        </p>
      </div>
      <div>
        <label className="input-label">Placeholder do input</label>
        <input
          className="input-field"
          value={node.data.placeholder ?? ""}
          onChange={(e) => updateNodeData(node.id, { placeholder: e.target.value })}
          placeholder="Digite seu nome..."
        />
      </div>
      <div>
        <label className="input-label">Próximo bloco</label>
        <div className="flex items-center gap-2">
          <NodeSelect
            value={node.data.nextNodeId}
            excludeId={node.id}
            onChange={(value) => updateNodeData(node.id, { nextNodeId: value })}
          />
          <button
            className="btn btn-primary text-xs"
            onClick={() => {
              const newId = addNode(defaultNextNodeType as any, { x: node.position.x + 240, y: node.position.y + 40 });
              updateNodeData(node.id, { nextNodeId: newId });
              setSelectedNodeId(newId);
            }}
          >
            Criar e conectar
          </button>
        </div>
      </div>
    </div>
  );
}

function ActionEditor({ node }: { node: FlowNode }) {
  const updateNodeData = useDialogueStore((s) => s.updateNodeData);
  const action = node.data.action ?? { type: "set_variable" as ActionType, value: "" };

  const addNode = useDialogueStore((s) => s.addNode);
  const setSelectedNodeId = useDialogueStore((s) => s.setSelectedNodeId);
  const defaultNextNodeType = useDialogueStore((s) => s.defaultNextNodeType);

  const update = (patch: Partial<typeof action>) => {
    updateNodeData(node.id, { action: { ...action, ...patch } });
  };

  return (
    <div className="flex flex-col gap-3">
      <div>
        <label className="input-label">Tipo da ação</label>
        <select
          className="input-field"
          value={action.type}
          onChange={(e) => update({ type: e.target.value as ActionType })}
        >
          {ACTION_TYPES.map((type) => (
            <option key={type} value={type}>
              {actionTypeLabels[type]}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="input-label">Valor</label>
        <input
          className="input-field font-mono"
          value={action.value ?? ""}
          onChange={(e) => update({ value: e.target.value })}
          placeholder={action.type === "set_variable" ? "variavel=valor" : "id ou nome do item/missão"}
        />
        {action.type === "set_variable" && (
          <p className="text-[11px] text-gray-500 mt-1">
            Formato: <code className="text-teal-300">nomeDaVariavel=valor</code>
          </p>
        )}
      </div>
      {action.type !== "end_dialogue" && (
        <div>
          <label className="input-label">Próximo bloco</label>
          <div className="flex items-center gap-2">
            <NodeSelect
              value={action.nextNodeId}
              excludeId={node.id}
              onChange={(value) => update({ nextNodeId: value })}
            />
            <button
              className="btn btn-primary text-xs"
              onClick={() => {
                const newId = addNode(defaultNextNodeType as any, { x: node.position.x + 240, y: node.position.y + 40 });
                update({ nextNodeId: newId });
                setSelectedNodeId(newId);
              }}
            >
              Criar e conectar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function EndEditor({ node }: { node: FlowNode }) {
  const updateNodeData = useDialogueStore((s) => s.updateNodeData);

  return (
    <div className="flex flex-col gap-3">
      <div>
        <label className="input-label">Texto final (opcional)</label>
        <textarea
          className="input-field min-h-[80px] resize-y"
          value={node.data.text ?? ""}
          onChange={(e) => updateNodeData(node.id, { text: e.target.value })}
          placeholder="Ex: O diálogo terminou."
        />
      </div>
      <div>
        <label className="input-label">Tipo de encerramento</label>
        <select
          className="input-field"
          value={node.data.endType ?? "default"}
          onChange={(e) => updateNodeData(node.id, { endType: e.target.value as EndType })}
        >
          {END_TYPES.map((type) => (
            <option key={type} value={type}>
              {endTypeLabels[type]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function SceneOverview() {
  const sceneName = useDialogueStore((s) => s.sceneName);
  const characters = useDialogueStore((s) => s.characters);
  const nodes = useDialogueStore((s) => s.nodes);
  const addNode = useDialogueStore((s) => s.addNode);
  const setSelectedNodeId = useDialogueStore((s) => s.setSelectedNodeId);
  const setSceneSettingsOpen = useDialogueStore((s) => s.setSceneSettingsOpen);

  const handleAdd = (type: keyof typeof nodeTypeLabels) => {
    const id = addNode(type, { x: 100 + Math.random() * 100, y: 100 + Math.random() * 100 });
    setSelectedNodeId(id);
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-sm font-semibold text-gray-300 mb-1">Cena</h2>
        <p className="text-lg font-bold">{sceneName || "(sem nome)"}</p>
        <p className="text-xs text-gray-500 mt-1">{nodes.length} bloco(s) no total</p>
      </div>

      <div>
        <label className="input-label">Adicionar novo bloco</label>
        <div className="grid grid-cols-2 gap-1.5">
          {(Object.keys(nodeTypeLabels) as (keyof typeof nodeTypeLabels)[]).map((type) => (
            <button key={type} onClick={() => handleAdd(type)} className="btn btn-secondary text-xs">
              + {nodeTypeLabels[type]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="input-label">Personagens</label>
        <div className="flex flex-col gap-1.5">
          {characters.length === 0 && <p className="text-xs text-gray-500 italic">Nenhum personagem definido.</p>}
          {characters.map((c) => (
            <div key={c.id} className="flex items-center gap-2 bg-bg-700 border border-bg-500 rounded-lg px-2 py-1.5">
              <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
              <span className="text-sm">{c.name}</span>
            </div>
          ))}
        </div>
      </div>

      <button onClick={() => setSceneSettingsOpen(true)} className="btn btn-primary">
        <Settings size={14} /> Configurações da cena
      </button>
    </div>
  );
}

export default function RightSidebar() {
  const selectedNodeId = useDialogueStore((s) => s.selectedNodeId);
  const node = useDialogueStore((s) => s.nodes.find((n) => n.id === selectedNodeId));
  const defaultNextNodeType = useDialogueStore((s) => s.defaultNextNodeType);
  const setDefaultNextNodeType = useDialogueStore((s) => s.setDefaultNextNodeType);

  return (
    <aside className="h-full flex flex-col bg-bg-800 border-l border-bg-500">
      <div className="flex-1 overflow-y-auto p-4">
        {!node ? (
          <SceneOverview />
        ) : (
          <div className="flex flex-col">
            <div className="mb-3 pb-3 border-b border-bg-500">
              <span className="text-[11px] uppercase tracking-wide text-gray-500">
                {nodeTypeLabels[node.type as keyof typeof nodeTypeLabels]}
              </span>
              <p className="text-xs text-gray-600 font-mono mt-0.5">{node.id}</p>
            </div>

            <div className="mb-3 pb-3 border-b border-bg-500">
              <label className="input-label">Tipo para "Criar e conectar"</label>
              <select
                className="input-field"
                value={defaultNextNodeType}
                onChange={(e) => setDefaultNextNodeType(e.target.value as any)}
              >
                {(Object.keys(nodeTypeLabels) as (keyof typeof nodeTypeLabels)[]).map((type) => (
                  <option key={type} value={type}>
                    {nodeTypeLabels[type]}
                  </option>
                ))}
              </select>
            </div>

            {node.type === "speech" && <SpeechEditor node={node} />}
            {node.type === "choice" && <ChoiceEditor node={node} />}
            {node.type === "boolean" && <BooleanEditor node={node} />}
            {node.type === "input" && <InputEditor node={node} />}
            {node.type === "action" && <ActionEditor node={node} />}
            {node.type === "end" && <EndEditor node={node} />}

            <NodeActionsFooter nodeId={node.id} />
          </div>
        )}
      </div>
      <div className="shrink-0 border-t border-bg-500 px-4 py-2 text-center text-[11px] text-gray-600">
        Criado por Leandro Sobrinho · leandroauzier02@gmail.com
      </div>
    </aside>
  );
}
