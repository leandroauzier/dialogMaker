import { Handle, NodeProps, Position } from "reactflow";
import { DialogueNodeData } from "@/types/dialogue";
import { HelpCircle, Check, X } from "@/components/icons";
import { useDialogueStore } from "@/store/dialogueStore";
import BaseNode from "./BaseNode";

export default function BooleanNode({ id, data, selected }: NodeProps<DialogueNodeData>) {
  const condition = data.condition;
  const isStart = useDialogueStore((s) => s.startNodeId === id);

  return (
    <BaseNode selected={selected} isStart={isStart} headerColor="#c084fc" icon={<HelpCircle size={14} />} title="Decisão Booleana">
      {condition?.variable ? (
        <p className="text-gray-300 font-mono leading-snug">
          {condition.variable} <span className="text-purple-300">{condition.operator}</span>{" "}
          {String(condition.value)}
        </p>
      ) : (
        <p className="text-gray-500 italic">Condição não definida</p>
      )}
      <div className="flex justify-between mt-2 text-[11px]">
        <span className="text-green-400 flex items-center gap-1">
          <Check size={12} /> Verdadeiro
        </span>
        <span className="text-red-400 flex items-center gap-1">
          <X size={12} /> Falso
        </span>
      </div>
      <Handle
        type="source"
        id="true"
        position={Position.Bottom}
        className="!bg-green-400"
        style={{ left: "25%", bottom: -5 }}
      />
      <Handle
        type="source"
        id="false"
        position={Position.Bottom}
        className="!bg-red-400"
        style={{ left: "75%", bottom: -5 }}
      />
    </BaseNode>
  );
}
