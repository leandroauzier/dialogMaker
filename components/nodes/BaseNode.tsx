import { ReactNode } from "react";
import { Handle, Position } from "reactflow";
import { Star } from "@/components/icons";

type BaseNodeProps = {
  selected?: boolean;
  isStart?: boolean;
  headerColor: string;
  icon: ReactNode;
  title: string;
  children: ReactNode;
  showTargetHandle?: boolean;
};

export default function BaseNode({
  selected,
  isStart,
  headerColor,
  icon,
  title,
  children,
  showTargetHandle = true,
}: BaseNodeProps) {
  return (
    <div className={`dialog-node ${selected ? "selected" : ""} ${isStart ? "start" : ""}`}>
      {showTargetHandle && (
        <Handle
          type="target"
          position={Position.Top}
          className="!bg-gray-500"
          style={{ top: -5 }}
        />
      )}
      <div className="dialog-node-header" style={{ color: headerColor, borderBottomColor: "#2a313f" }}>
        <span className="flex items-center">{icon}</span>
        <span>{title}</span>
        {isStart && (
          <Star size={12} style={{ color: "#facc15", marginLeft: "auto", fill: "#facc15" }} />
        )}
      </div>
      <div className="dialog-node-body">{children}</div>
    </div>
  );
}

export function truncate(text: string | undefined, max = 80): string {
  if (!text) return "";
  return text.length > max ? `${text.slice(0, max)}...` : text;
}
