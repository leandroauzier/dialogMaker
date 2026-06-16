"use client";

import { useCallback, useMemo } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlowProvider,
  useReactFlow,
} from "reactflow";
import { useDialogueStore } from "@/store/dialogueStore";
import { NodeType } from "@/types/dialogue";
import { nodeTypeLabels } from "@/store/dialogueStore";
import { MessageCircle, GitFork, HelpCircle, Keyboard, Zap, Flag } from "@/components/icons";
import SpeechNode from "@/components/nodes/SpeechNode";
import ChoiceNode from "@/components/nodes/ChoiceNode";
import BooleanNode from "@/components/nodes/BooleanNode";
import InputNode from "@/components/nodes/InputNode";
import ActionNode from "@/components/nodes/ActionNode";
import EndNode from "@/components/nodes/EndNode";

const nodeTypes = {
  speech: SpeechNode,
  choice: ChoiceNode,
  boolean: BooleanNode,
  input: InputNode,
  action: ActionNode,
  end: EndNode,
};

const NODE_PALETTE: { type: NodeType; icon: typeof MessageCircle }[] = [
  { type: "speech", icon: MessageCircle },
  { type: "choice", icon: GitFork },
  { type: "boolean", icon: HelpCircle },
  { type: "input", icon: Keyboard },
  { type: "action", icon: Zap },
  { type: "end", icon: Flag },
];

function CanvasInner() {
  const nodes = useDialogueStore((s) => s.nodes);
  const edges = useDialogueStore((s) => s.edges);
  const onNodesChange = useDialogueStore((s) => s.onNodesChange);
  const onEdgesChange = useDialogueStore((s) => s.onEdgesChange);
  const onConnect = useDialogueStore((s) => s.onConnect);
  const addNode = useDialogueStore((s) => s.addNode);
  const setSelectedNodeId = useDialogueStore((s) => s.setSelectedNodeId);
  const selectedNodeId = useDialogueStore((s) => s.selectedNodeId);
  const startNodeId = useDialogueStore((s) => s.startNodeId);

  const { screenToFlowPosition } = useReactFlow();

  const styledNodes = useMemo(
    () =>
      nodes.map((n) => ({
        ...n,
        selected: n.id === selectedNodeId,
        data: { ...n.data, isStart: n.id === startNodeId },
      })),
    [nodes, selectedNodeId, startNodeId]
  );

  const handlePaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, [setSelectedNodeId]);

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: { id: string }) => {
      setSelectedNodeId(node.id);
    },
    [setSelectedNodeId]
  );

  const handleAddNode = useCallback(
    (type: NodeType) => {
      const position = screenToFlowPosition({
        x: window.innerWidth * 0.4 + Math.random() * 80,
        y: window.innerHeight * 0.3 + Math.random() * 80,
      });
      const id = addNode(type, position);
      setSelectedNodeId(id);
    },
    [addNode, screenToFlowPosition, setSelectedNodeId]
  );

  return (
    <div className="relative h-full w-full">
      <ReactFlow
        nodes={styledNodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        nodeTypes={nodeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{ style: { strokeWidth: 2 } }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#2a313f" />
        <Controls className="!bg-bg-700 !border-bg-500 [&>button]:!bg-bg-700 [&>button]:!border-bg-500 [&>button]:!text-gray-300 [&>button:hover]:!bg-bg-600" />
        <MiniMap
          pannable
          zoomable
          style={{ backgroundColor: "#171b24" }}
          maskColor="rgba(11,13,18,0.6)"
          nodeColor="#2a313f"
          nodeBorderRadius={6}
        />
      </ReactFlow>

      <div className="absolute top-4 left-4 z-10 bg-bg-700/95 border border-bg-500 rounded-xl p-2 shadow-lg backdrop-blur-sm">
        <p className="text-[11px] uppercase font-semibold text-gray-500 px-1.5 pb-1.5 tracking-wide">
          Adicionar Rápido
        </p>
        <div className="flex flex-col gap-1">
          {NODE_PALETTE.map(({ type, icon: Icon }) => (
            <button
              key={type}
              onClick={() => handleAddNode(type)}
              className="btn btn-secondary justify-start text-left"
            >
              <Icon size={14} />
              <span>{nodeTypeLabels[type]}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DialogueCanvas() {
  return (
    <ReactFlowProvider>
      <CanvasInner />
    </ReactFlowProvider>
  );
}
