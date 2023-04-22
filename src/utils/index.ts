import NodeCollection from "./nodeConnection";

let connection: NodeCollection | undefined = undefined;

export const initializeNodeConnection = (apiKey?: string): NodeCollection => {
  if (!apiKey) {
    throw new Error("Api key was not provided");
  }
  connection = new NodeCollection(apiKey);
  return connection;
};

export const getNodeConnection = (): NodeCollection => {
  if (!connection) {
    throw new Error("Node connection was not initialized");
  }
  return connection;
};

export const isStringArray = (array: unknown): array is string[] => {
  if (!Array.isArray(array)) {
    return false;
  }

  if (array.some((v) => typeof v !== "string")) {
    return false;
  }

  return true;
};
