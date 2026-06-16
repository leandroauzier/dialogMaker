import { Handle, NodeProps, Position } from "reactflow";
import { DialogueNodeData } from "@/types/dialogue";
import { GitFork } from "@/components/icons";
import { useDialogueStore } from "@/store/dialogueStore";
import BaseNode, { truncate } from "./BaseNode";

export default function ChoiceNode({ id, data, selected }: NodeProps<DialogueNodeData>) {
  const choices = data.choices ?? [];
  const isStart = useDialogueStore((s) => s.startNodeId === id);

  return (
    <BaseNode selected={selected} isStart={isStart} headerColor="#fbbf24" icon={<GitFork size={14} />} title="Múltipla Escolha">
      <p className="text-gray-300 font-medium mb-2 leading-snug">{truncate(data.text) || "Sem texto..."}</p>
      <div className="flex flex-col gap-1">
        {choices.length === 0 && <p className="text-gray-500 italic">Nenhuma opção definida</p>}
        {choices.map((choice, idx) => (
          <div
            key={choice.id}
            className="text-[11px] bg-bg-600 rounded px-2 py-1 flex items-center justify-between gap-2"
          >
            <span className="truncate">
              {idx + 1}. {choice.text || "Sem texto"}
            </span>
          </div>
        ))}
      </div>
      {choices.map((choice, idx) => (
        <Handle
          key={choice.id}
          type="source"
          id={choice.id}
          position={Position.Bottom}
          className="!bg-amber-400"
          style={{
            left: `${((idx + 1) / (choices.length + 1)) * 100}%`,
            bottom: -5,
          }}
        />
      ))}
    </BaseNode>
  );
}
