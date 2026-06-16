import { Handle, NodeProps, Position } from "reactflow";
import { DialogueNodeData } from "@/types/dialogue";
import { useDialogueStore } from "@/store/dialogueStore";
import { MessageCircle } from "@/components/icons";
import BaseNode, { truncate } from "./BaseNode";

export default function SpeechNode({ id, data, selected }: NodeProps<DialogueNodeData>) {
  const character = useDialogueStore((s) => s.characters.find((c) => c.id === data.characterId));
  const isStart = useDialogueStore((s) => s.startNodeId === id);

  return (
    <BaseNode selected={selected} isStart={isStart} headerColor="#818cf8" icon={<MessageCircle size={14} />} title="Fala">
      <div className="flex items-center gap-2 mb-1.5">
        <span
          className="inline-block w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: character?.color ?? "#6b7280" }}
        />
        <span className="font-semibold text-gray-200">{character?.name ?? "Sem personagem"}</span>
      </div>
      <p className="text-gray-400 leading-snug">{truncate(data.text) || "Sem texto..."}</p>
      <Handle type="source" position={Position.Bottom} className="!bg-indigo-400" style={{ bottom: -5 }} />
    </BaseNode>
  );
}
