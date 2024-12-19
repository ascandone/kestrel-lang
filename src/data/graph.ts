import { LinkedList, linkedListToArray } from "./linkedList";

export type GraphKey = string | number;

/** A readonly view of a directed graph */
export type DirectedGraph<Node, K extends GraphKey = string> = {
  getNodes(): Iterable<Node>;
  toKey(node: Node): K;
  getNeighbours(node: Node): Iterable<Node>;
};

class Topsort<Node, Key extends GraphKey> {
  public output: Node[] = [];

  private visited = new Set<Key>();
  constructor(private graph: DirectedGraph<Node, Key>) {
    for (const node of graph.getNodes()) {
      this.visit(node);
    }
  }

  private visit(node: Node) {
    const nodeKey = this.graph.toKey(node);
    if (this.visited.has(nodeKey)) {
      return;
    }

    this.visited.add(this.graph.toKey(node));
    for (const adj of this.graph.getNeighbours(node)) {
      this.visit(adj);
    }

    this.output.push(node);
  }
}

export function topsort<Node, Key extends GraphKey>(
  graph: DirectedGraph<Node, Key>,
): Node[] {
  return new Topsort(graph).output;
}

class DetectCycles<Node, Key extends GraphKey> {
  constructor(private graph: DirectedGraph<Node, Key>) {}

  private readonly visitedNodes = new Map<Key, "visiting" | "visited">();

  private visitNode(node: Node, path: LinkedList<Node>): Node[] | undefined {
    const nodeKey = this.graph.toKey(node);

    switch (this.visitedNodes.get(nodeKey)) {
      case "visiting":
        return linkedListToArray(path);

      case "visited":
        return;

      case undefined:
        break;
    }

    if (this.visitedNodes.has(nodeKey)) {
      return;
    }

    this.visitedNodes.set(nodeKey, "visiting");
    for (const adj of this.graph.getNeighbours(node)) {
      const cycle = this.visitNode(adj, [adj, path]);
      if (cycle !== undefined) {
        return cycle;
      }
    }
    this.visitedNodes.set(nodeKey, "visited");
    return;
  }

  run(): Node[] | undefined {
    for (const node of this.graph.getNodes()) {
      const cycle = this.visitNode(node, undefined);
      if (cycle !== undefined) {
        return cycle;
      }
    }
    return undefined;
  }
}

export function detectCycles<Node, Key extends GraphKey>(
  graph: DirectedGraph<Node, Key>,
): Node[] | undefined {
  return new DetectCycles(graph).run();
}

export function reverseGraph<Node, Key extends GraphKey>(
  graph: DirectedGraph<Node, Key>,
): DirectedGraph<Node, Key> {
  const d = new Map<Key, Node[]>();

  for (const node of graph.getNodes()) {
    for (const adj of graph.getNeighbours(node)) {
      const key = graph.toKey(adj);
      let lookup = d.get(key);
      if (lookup === undefined) {
        lookup = [];
        d.set(key, lookup);
      }

      lookup.push(node);
    }
  }

  return {
    // TODO will it mess up 'this' ?
    toKey: graph.toKey,
    getNodes: graph.getNodes,
    getNeighbours(node) {
      const k = graph.toKey(node);
      return d.get(k) ?? [];
    },
  };
}

class StronglyConnectedComponentSearch<Node, Key extends GraphKey> {
  private readonly reversedGraph: DirectedGraph<Node, Key>;
  constructor(private graph: DirectedGraph<Node, Key>) {
    this.reversedGraph = reverseGraph(this.graph);
  }

  private readonly returnValue: Node[][] = [];
  private readonly visitedNodes = new Set<Key>();
  private currentScc: Node[] = [];

  private dfs(node: Node) {
    const nodeKey = this.reversedGraph.toKey(node);
    if (this.visitedNodes.has(nodeKey)) {
      return;
    }

    this.currentScc.push(node);
    this.visitedNodes.add(nodeKey);

    for (const adj of this.reversedGraph.getNeighbours(node)) {
      this.dfs(adj);
    }

    return;
  }

  private pushScc() {
    if (this.currentScc.length !== 0) {
      this.returnValue.push(this.currentScc);
      this.currentScc = [];
    }
  }

  run(): Node[][] {
    const sorted = topsort(this.graph);
    sorted.reverse();

    this.visitedNodes.clear();
    for (const node of sorted) {
      this.pushScc();
      this.dfs(node);
    }

    this.pushScc();
    this.returnValue.reverse();
    return this.returnValue;
  }
}

// https://www.programiz.com/dsa/strongly-connected-components
export function findStronglyConnectedComponents<Node, Key extends GraphKey>(
  graph: DirectedGraph<Node, Key>,
): Node[][] {
  return new StronglyConnectedComponentSearch(graph).run();
}

// Utilities

export type RecordGraph = Record<string, Array<string>>;
export function createRecordGraph(graph: RecordGraph): DirectedGraph<string> {
  return {
    toKey: (x) => x,
    getNodes() {
      return Object.keys(graph);
    },
    getNeighbours(node) {
      return graph[node] ?? [];
    },
  };
}

export function toRecordGraph(graph: DirectedGraph<string>): RecordGraph {
  const rg: RecordGraph = {};
  for (const node of graph.getNodes()) {
    rg[graph.toKey(node)] = [...graph.getNeighbours(node)];
  }
  return rg;
}
