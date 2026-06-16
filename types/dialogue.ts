export type NodeType =
  | "speech"
  | "choice"
  | "boolean"
  | "input"
  | "action"
  | "end";

export type Character = {
  id: string;
  name: string;
  color: string;
  description?: string;
};

export type DialogueChoice = {
  id: string;
  text: string;
  nextNodeId?: string;
};

export type ConditionOperator = "==" | "!=" | ">" | "<" | ">=" | "<=";

export type DialogueCondition = {
  variable: string;
  operator: ConditionOperator;
  value: string | number | boolean;
  trueNodeId?: string;
  falseNodeId?: string;
};

export type ActionType =
  | "start_quest"
  | "finish_quest"
  | "give_item"
  | "remove_item"
  | "open_shop"
  | "set_variable"
  | "end_dialogue";

export type DialogueAction = {
  type: ActionType;
  value?: string;
  nextNodeId?: string;
};

export type EndType = "default" | "success" | "failure" | "custom";

export type DialogueNodeData = {
  label?: string;
  characterId?: string;
  text?: string;
  choices?: DialogueChoice[];
  nextNodeId?: string;
  variableName?: string;
  placeholder?: string;
  condition?: DialogueCondition;
  action?: DialogueAction;
  endType?: EndType;
};

export type DialogueNode = {
  id: string;
  type: NodeType;
  position: {
    x: number;
    y: number;
  };
  data: DialogueNodeData;
};

export type DialogueEdge = {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  label?: string;
};

export type VariableType = "string" | "number" | "boolean";

export type DialogueVariable = {
  name: string;
  type: VariableType;
  defaultValue?: string | number | boolean;
};

export type DialogueProject = {
  id: string;
  title: string;
  sceneName: string;
  characters: Character[];
  startNodeId: string;
  nodes: DialogueNode[];
  edges: DialogueEdge[];
  variables: DialogueVariable[];
  createdAt: string;
  updatedAt: string;
};
