"use client";

import { useEffect, useMemo, useState } from "react";
import { useDialogueStore } from "@/store/dialogueStore";
import {
  PreviewState,
  advancePreview,
  createInitialPreviewState,
  getResolvedText,
} from "@/utils/dialoguePreviewEngine";
import { endTypeLabels } from "@/components/nodes/EndNode";
import { Play, X, AlertTriangle, Flag, ArrowRight, RotateCcw } from "@/components/icons";

export default function PreviewModal() {
  const isOpen = useDialogueStore((s) => s.isPreviewOpen);
  const setOpen = useDialogueStore((s) => s.setPreviewOpen);
  const getProject = useDialogueStore((s) => s.getProject);

  const project = useMemo(() => (isOpen ? getProject() : null), [isOpen, getProject]);

  const [state, setState] = useState<PreviewState | null>(null);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    if (isOpen && project) {
      setState(createInitialPreviewState(project));
      setInputValue("");
    }
  }, [isOpen, project]);

  if (!isOpen || !project || !state) return null;

  const currentNode = project.nodes.find((n) => n.id === state.currentNodeId);
  const character = currentNode ? project.characters.find((c) => c.id === currentNode.data.characterId) : undefined;

  const handleRestart = () => {
    setState(createInitialPreviewState(project));
    setInputValue("");
  };

  const handleContinue = () => {
    if (!currentNode) return;
    setState((prev) => prev && advancePreview(project, prev, currentNode.data.nextNodeId ?? null));
  };

  const handleChoice = (nextNodeId?: string) => {
    setState((prev) => prev && advancePreview(project, prev, nextNodeId ?? null));
  };

  const handleSubmitInput = () => {
    if (!currentNode) return;
    const variableName = currentNode.data.variableName;
    const update = variableName ? { [variableName]: inputValue } : {};
    setState((prev) => prev && advancePreview(project, prev, currentNode.data.nextNodeId ?? null, update));
    setInputValue("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-bg-800 border border-bg-500 rounded-2xl w-full max-w-md max-h-[85vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-bg-500">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Play size={18} /> Modo Preview
          </h2>
          <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-200 leading-none">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 flex-1 overflow-y-auto min-h-[220px]">
          {state.loopDetected && (
            <div className="bg-amber-950/80 border border-amber-700 text-amber-200 rounded-lg p-3 text-sm mb-4 flex items-start gap-2">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <span>
                Loop infinito detectado na árvore de diálogo. A execução automática foi interrompida para evitar
                travamento.
              </span>
            </div>
          )}

          {!currentNode && state.finished && (
            <div className="text-center py-10">
              <Flag size={36} className="mx-auto mb-2 text-gray-400" />
              <p className="text-lg font-semibold">O diálogo terminou.</p>
            </div>
          )}

          {currentNode && currentNode.type === "speech" && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span
                  className="inline-block w-3 h-3 rounded-full"
                  style={{ backgroundColor: character?.color ?? "#6b7280" }}
                />
                <span className="font-semibold">{character?.name ?? "Personagem"}</span>
              </div>
              <p className="bg-bg-700 border border-bg-500 rounded-lg p-3 leading-relaxed">
                {getResolvedText(currentNode.data.text, state.variables)}
              </p>
              <button onClick={handleContinue} className="btn btn-primary self-end">
                Continuar <ArrowRight size={14} />
              </button>
            </div>
          )}

          {currentNode && currentNode.type === "choice" && (
            <div className="flex flex-col gap-3">
              <p className="bg-bg-700 border border-bg-500 rounded-lg p-3 leading-relaxed">
                {getResolvedText(currentNode.data.text, state.variables)}
              </p>
              <div className="flex flex-col gap-2">
                {(currentNode.data.choices ?? []).map((choice) => (
                  <button
                    key={choice.id}
                    onClick={() => handleChoice(choice.nextNodeId)}
                    disabled={!choice.nextNodeId}
                    className="btn btn-secondary justify-start disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {getResolvedText(choice.text, state.variables)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentNode && currentNode.type === "input" && (
            <div className="flex flex-col gap-3">
              <p className="bg-bg-700 border border-bg-500 rounded-lg p-3 leading-relaxed">
                {getResolvedText(currentNode.data.text, state.variables)}
              </p>
              <input
                className="input-field"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={currentNode.data.placeholder}
                onKeyDown={(e) => e.key === "Enter" && handleSubmitInput()}
                autoFocus
              />
              <button onClick={handleSubmitInput} className="btn btn-primary self-end">
                Enviar <ArrowRight size={14} />
              </button>
            </div>
          )}

          {currentNode && currentNode.type === "end" && (
            <div className="text-center py-6">
              <Flag size={36} className="mx-auto mb-2 text-gray-400" />
              {currentNode.data.text && (
                <p className="bg-bg-700 border border-bg-500 rounded-lg p-3 leading-relaxed mb-2">
                  {getResolvedText(currentNode.data.text, state.variables)}
                </p>
              )}
              <p className="text-sm text-gray-500">
                Encerramento: {endTypeLabels[currentNode.data.endType ?? "default"]}
              </p>
            </div>
          )}
        </div>

        <div className="px-5 py-4 border-t border-bg-500 flex items-center justify-between">
          <details className="text-xs text-gray-500">
            <summary className="cursor-pointer">Variáveis</summary>
            <pre className="mt-2 bg-bg-900 rounded p-2 max-w-xs overflow-x-auto">
              {JSON.stringify(state.variables, null, 2)}
            </pre>
          </details>
          <button onClick={handleRestart} className="btn btn-secondary">
            <RotateCcw size={14} /> Reiniciar preview
          </button>
        </div>
      </div>
    </div>
  );
}
