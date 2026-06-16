import { Handle, NodeProps, Position } from "reactflow";
import { ActionType, DialogueNodeData } from "@/types/dialogue";
import { Zap } from "@/components/icons";
import { useDialogueStore } from "@/store/dialogueStore";
import BaseNode, { truncate } from "./BaseNode";

export const actionTypeLabels: Record<ActionType, string> = {
  start_quest: "Iniciar missão",
  finish_quest: "Finalizar missão",
  give_item: "Entregar item",
  remove_item: "Remover item",
  open_shop: "Abrir loja",
  set_variable: "Alterar variável",
  end_dialogue: "Encerrar diálogo",
};

export default function ActionNode({ id, data, selected }: NodeProps<DialogueNodeData>) {
  const action = data.action;
  const isStart = useDialogueStore((s) => s.startNodeId === id);

  return (
    <BaseNode selected={selected} isStart={isStart} headerColor="#fb923c" icon={<Zap size={14} />} title="Ação">
      <p className="text-gray-300 font-medium leading-snug">
        {action ? actionTypeLabels[action.type] : "Tipo não definido"}
      </p>
      {action?.value && <p className="text-[11px] text-orange-300 font-mono mt-1">{truncate(action.value, 60)}</p>}
      {action?.type !== "end_dialogue" && (
        <Handle type="source" position={Position.Bottom} className="!bg-orange-400" style={{ bottom: -5 }} />
      )}
    </BaseNode>
  );
}
