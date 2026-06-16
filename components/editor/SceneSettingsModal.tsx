"use client";

import { useDialogueStore } from "@/store/dialogueStore";
import { Settings, X, Trash2 } from "@/components/icons";

const PRESET_COLORS = ["#6366f1", "#22c55e", "#f97316", "#ec4899", "#06b6d4", "#eab308", "#ef4444", "#a855f7"];

export default function SceneSettingsModal() {
  const isOpen = useDialogueStore((s) => s.isSceneSettingsOpen);
  const setOpen = useDialogueStore((s) => s.setSceneSettingsOpen);
  const sceneName = useDialogueStore((s) => s.sceneName);
  const setSceneName = useDialogueStore((s) => s.setSceneName);
  const characters = useDialogueStore((s) => s.characters);
  const addCharacter = useDialogueStore((s) => s.addCharacter);
  const updateCharacter = useDialogueStore((s) => s.updateCharacter);
  const removeCharacter = useDialogueStore((s) => s.removeCharacter);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-bg-800 border border-bg-500 rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-bg-500">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Settings size={18} /> Configurações da Cena
          </h2>
          <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-200 leading-none">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          <div>
            <label className="input-label">Nome da cena</label>
            <input
              className="input-field"
              value={sceneName}
              onChange={(e) => setSceneName(e.target.value)}
              placeholder="Ex: Entrada da Vila"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="input-label !mb-0">Personagens ({characters.length})</label>
              <button
                onClick={() => addCharacter({ name: "Novo Personagem", color: PRESET_COLORS[characters.length % PRESET_COLORS.length] })}
                className="btn btn-secondary text-xs"
              >
                + Adicionar personagem
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {characters.length === 0 && (
                <p className="text-xs text-gray-500 italic">Nenhum personagem definido ainda.</p>
              )}
              {characters.map((c) => (
                <div key={c.id} className="border border-bg-500 rounded-lg p-3 bg-bg-700 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={c.color}
                      onChange={(e) => updateCharacter(c.id, { color: e.target.value })}
                      className="w-9 h-9 rounded-md border border-bg-500 bg-bg-600 cursor-pointer"
                    />
                    <input
                      className="input-field"
                      value={c.name}
                      onChange={(e) => updateCharacter(c.id, { name: e.target.value })}
                      placeholder="Nome do personagem"
                    />
                    <button
                      onClick={() => {
                        if (confirm(`Remover o personagem "${c.name}"?`)) removeCharacter(c.id);
                      }}
                      className="btn btn-danger px-2"
                      title="Remover personagem"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <input
                    className="input-field"
                    value={c.description ?? ""}
                    onChange={(e) => updateCharacter(c.id, { description: e.target.value })}
                    placeholder="Descrição (opcional)"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-bg-500 flex justify-end">
          <button onClick={() => setOpen(false)} className="btn btn-primary">
            Concluído
          </button>
        </div>
      </div>
    </div>
  );
}
