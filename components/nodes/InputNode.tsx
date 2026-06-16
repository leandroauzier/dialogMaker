import { Handle, NodeProps, Position } from "reactflow";
import { DialogueNodeData } from "@/types/dialogue";
import { Keyboard } from "@/components/icons";
import { useDialogueStore } from "@/store/dialogueStore";
import BaseNode, { truncate } from "./BaseNode";

export default function InputNode({ id, data, selected }: NodeProps<DialogueNodeData>) {
  const isStart = useDialogueStore((s) => s.startNodeId === id);
  return (
    <BaseNode selected={selected} isStart={isStart} headerColor="#2dd4bf" icon={<Keyboard size={14} />} title="Input do Jogador">
      <p className="text-gray-300 leading-snug mb-1.5">{truncate(data.text) || "Sem texto..."}</p>
      <p className="text-[11px] text-teal-300 font-mono">
        → {data.variableName ? `{{${data.variableName}}}` : "(variável não definida)"}
      </p>
      <Handle type="source" position={Position.Bottom} className="!bg-teal-400" style={{ bottom: -5 }} />
    </BaseNode>
  );
}
