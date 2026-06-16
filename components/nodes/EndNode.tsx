import { NodeProps } from "reactflow";
import { DialogueNodeData, EndType } from "@/types/dialogue";
import { Flag } from "@/components/icons";
import { useDialogueStore } from "@/store/dialogueStore";
import BaseNode, { truncate } from "./BaseNode";

export const endTypeLabels: Record<EndType, string> = {
  default: "Padrão",
  success: "Sucesso",
  failure: "Falha",
  custom: "Personalizado",
};

export default function EndNode({ id, data, selected }: NodeProps<DialogueNodeData>) {
  const isStart = useDialogueStore((s) => s.startNodeId === id);
  return (
    <BaseNode selected={selected} isStart={isStart} headerColor="#f87171" icon={<Flag size={14} />} title="Fim">
      <p className="text-gray-300 leading-snug">{truncate(data.text) || "Fim da conversa."}</p>
      <p className="text-[11px] text-red-300 mt-1">{endTypeLabels[data.endType ?? "default"]}</p>
    </BaseNode>
  );
}
