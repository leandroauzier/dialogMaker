"use client";

import { useEffect } from "react";
import { useDialogueStore } from "@/store/dialogueStore";
import { DialogueProject } from "@/types/dialogue";
import TopBar from "./TopBar";
import DialogueCanvas from "./DialogueCanvas";
import RightSidebar from "./RightSidebar";
import SceneSettingsModal from "./SceneSettingsModal";
import PreviewModal from "./PreviewModal";

type DialogueEditorProps = {
  projectId: string;
  initialProject: DialogueProject;
  initialTitle: string;
};

export default function DialogueEditor({ projectId, initialProject, initialTitle }: DialogueEditorProps) {
  const loadProject = useDialogueStore((s) => s.loadProject);

  useEffect(() => {
    loadProject({ ...initialProject, title: initialTitle });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  return (
    <div className="h-screen w-screen flex flex-col bg-bg-900">
      <TopBar projectId={projectId} />
      <div className="flex-1 flex overflow-hidden">
        <div className="w-[80%] h-full">
          <DialogueCanvas />
        </div>
        <div className="w-[20%] h-full">
          <RightSidebar />
        </div>
      </div>
      <SceneSettingsModal />
      <PreviewModal />
    </div>
  );
}
