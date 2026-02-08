"use client";

import { useState, useCallback } from "react";
import { SimulatorDetails } from "./SimulatorDetails";
import {
  type DatabaseMode,
  type DatabaseCategory,
  DATABASE_CATEGORIES,
  DATABASE_MODE_INFO,
  SQL_QUERY_EXAMPLES,
  NOSQL_EXAMPLES,
} from "@/data/databaseTypes";

const MODES: { key: DatabaseMode; label: string }[] = [
  { key: "sqlConcepts", label: "SQL Concepts" },
  { key: "nosqlConcepts", label: "NoSQL" },
  { key: "btree", label: "B-Tree Index" },
  { key: "types", label: "Types" },
];

const SVG_WIDTH = 600;
const SVG_HEIGHT = 280;

// ===================== B-TREE =====================

interface BTreeNode {
  keys: number[];
  children: BTreeNode[];
}

function insertIntoBTree(root: BTreeNode, value: number, maxKeys: number): BTreeNode {
  const newRoot = structuredClone(root);

  function splitChild(parent: BTreeNode, index: number) {
    const child = parent.children[index];
    const mid = Math.floor(maxKeys / 2);
    const midKey = child.keys[mid];
    const leftNode: BTreeNode = { keys: child.keys.slice(0, mid), children: child.children.slice(0, mid + 1) };
    const rightNode: BTreeNode = { keys: child.keys.slice(mid + 1), children: child.children.slice(mid + 1) };
    parent.keys.splice(index, 0, midKey);
    parent.children.splice(index, 1, leftNode, rightNode);
  }

  function insertNonFull(node: BTreeNode, key: number) {
    if (node.children.length === 0) {
      const index = node.keys.findIndex((k) => k > key);
      if (index === -1) node.keys.push(key);
      else node.keys.splice(index, 0, key);
      return;
    }
    let childIndex = node.keys.findIndex((k) => k > key);
    if (childIndex === -1) childIndex = node.keys.length;
    if (node.children[childIndex].keys.length >= maxKeys) {
      splitChild(node, childIndex);
      if (key > node.keys[childIndex]) childIndex++;
    }
    insertNonFull(node.children[childIndex], key);
  }

  if (newRoot.keys.length >= maxKeys) {
    const newParent: BTreeNode = { keys: [], children: [newRoot] };
    splitChild(newParent, 0);
    insertNonFull(newParent, value);
    return newParent;
  }
  insertNonFull(newRoot, value);
  return newRoot;
}

function BTreeVisualization({ root, searchValue }: { root: BTreeNode; searchValue: number | null }) {
  const nodeHeight = 28;
  const levelGap = 55;
  const nodeWidth = 50;

  interface PositionedNode {
    node: BTreeNode;
    x: number;
    y: number;
    children: PositionedNode[];
  }

  function layoutTree(node: BTreeNode, depth: number, minX: number): { positioned: PositionedNode; width: number } {
    if (node.children.length === 0) {
      const width = Math.max(nodeWidth, node.keys.length * 22 + 10);
      return { positioned: { node, x: minX + width / 2, y: 30 + depth * levelGap, children: [] }, width };
    }
    let totalWidth = 0;
    const childPositions: PositionedNode[] = [];
    for (const child of node.children) {
      const { positioned, width } = layoutTree(child, depth + 1, minX + totalWidth);
      childPositions.push(positioned);
      totalWidth += width + 10;
    }
    totalWidth -= 10;
    const width = Math.max(nodeWidth, totalWidth, node.keys.length * 22 + 10);
    return { positioned: { node, x: minX + width / 2, y: 30 + depth * levelGap, children: childPositions }, width };
  }

  const { positioned: tree, width: totalWidth } = layoutTree(root, 0, 10);
  const viewWidth = Math.max(SVG_WIDTH, totalWidth + 20);

  function renderNode(positioned: PositionedNode): React.ReactNode {
    const { node, x, y, children } = positioned;
    const keyCount = node.keys.length;
    const rectWidth = Math.max(nodeWidth, keyCount * 22 + 10);

    return (
      <g key={`${x}-${y}`}>
        {children.map((child, index) => (
          <line key={index} x1={x} y1={y + nodeHeight / 2} x2={child.x} y2={child.y - nodeHeight / 2}
            stroke="rgba(109,90,207,0.3)" strokeWidth={1.5} />
        ))}
        <rect x={x - rectWidth / 2} y={y - nodeHeight / 2} width={rectWidth} height={nodeHeight}
          rx={4} fill="rgba(109,90,207,0.15)" stroke="#6d5acf" strokeWidth={1.5} />
        {node.keys.map((key, index) => {
          const keyX = x - (keyCount - 1) * 11 + index * 22;
          const isSearched = searchValue === key;
          return (
            <g key={index}>
              {index > 0 && (
                <line x1={keyX - 11} y1={y - nodeHeight / 2 + 4} x2={keyX - 11} y2={y + nodeHeight / 2 - 4}
                  stroke="rgba(109,90,207,0.3)" strokeWidth={1} />
              )}
              <text x={keyX} y={y + 4} textAnchor="middle"
                className={`text-[10px] font-mono ${isSearched ? "fill-emerald-400 font-bold" : "fill-foreground"}`}>{key}</text>
              {isSearched && (
                <circle cx={keyX} cy={y} r={12} fill="none" stroke="#22c55e" strokeWidth={2} opacity={0.6}>
                  <animate attributeName="r" values="12;16;12" dur="1s" repeatCount="indefinite" />
                </circle>
              )}
            </g>
          );
        })}
        {children.map((child) => renderNode(child))}
      </g>
    );
  }

  return (
    <svg viewBox={`0 0 ${viewWidth} ${SVG_HEIGHT}`} className="w-full max-w-[600px] mx-auto">
      {renderNode(tree)}
    </svg>
  );
}

// ===================== SQL CONCEPTS VIEW =====================

function SqlConceptsView() {
  const [selectedQuery, setSelectedQuery] = useState(0);
  const example = SQL_QUERY_EXAMPLES[selectedQuery];

  // Simulated table data for visualization
  const sampleTable = [
    { id: 1, name: "Alice", email: "alice@mail.com", age: 28, dept: "Engineering" },
    { id: 2, name: "Bob", email: "bob@mail.com", age: 24, dept: "Design" },
    { id: 3, name: "Carol", email: "carol@mail.com", age: 32, dept: "Engineering" },
    { id: 4, name: "Dave", email: "dave@mail.com", age: 22, dept: "Marketing" },
    { id: 5, name: "Eve", email: "eve@mail.com", age: 30, dept: "Engineering" },
  ];

  const highlightedRows = selectedQuery === 0
    ? sampleTable.filter((row) => row.age > 25).map((row) => row.id)
    : selectedQuery === 2
      ? [1, 3, 5] // Engineering department
      : [];

  return (
    <div className="space-y-3">
      {/* Query selector */}
      <div className="flex flex-wrap gap-1">
        {SQL_QUERY_EXAMPLES.map((queryExample, index) => (
          <button key={index} onClick={() => setSelectedQuery(index)}
            className={`px-2 py-1 text-[10px] font-mono rounded cursor-pointer transition-colors ${
              selectedQuery === index
                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                : "text-muted/60 hover:text-muted border border-card-border"
            }`}>{queryExample.title}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Query panel */}
        <div className="bg-card-border/10 rounded-lg p-3 border border-card-border/30">
          <h4 className="text-[11px] font-semibold text-blue-400 mb-1">{example.title}</h4>
          <p className="text-[9px] text-muted/60 mb-2">{example.description}</p>
          <pre className="bg-black/30 rounded p-2 text-[9px] font-mono text-blue-300 whitespace-pre-wrap leading-relaxed">
            {example.query}
          </pre>
          <p className="text-[8px] text-muted/50 mt-2">→ {example.resultDescription}</p>
        </div>

        {/* Table visualization */}
        <div className="bg-card-border/10 rounded-lg p-3 border border-card-border/30">
          <h4 className="text-[10px] text-muted/60 mb-2">users table</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-[8px]">
              <thead>
                <tr className="border-b border-card-border/30">
                  {["id", "name", "email", "age", "dept"].map((col) => (
                    <th key={col} className="px-1.5 py-1 text-left font-mono text-muted/50">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sampleTable.map((row) => {
                  const isHighlighted = highlightedRows.includes(row.id);
                  return (
                    <tr key={row.id} className={isHighlighted ? "bg-blue-500/10" : ""}>
                      <td className="px-1.5 py-0.5 font-mono text-muted/70">{row.id}</td>
                      <td className={`px-1.5 py-0.5 ${isHighlighted ? "text-blue-400" : "text-foreground/70"}`}>{row.name}</td>
                      <td className="px-1.5 py-0.5 text-muted/60">{row.email}</td>
                      <td className="px-1.5 py-0.5 font-mono text-muted/70">{row.age}</td>
                      <td className="px-1.5 py-0.5 text-muted/60">{row.dept}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {highlightedRows.length > 0 && (
            <p className="text-[8px] text-blue-400/60 mt-1">Highlighted rows match the query condition</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ===================== NOSQL CONCEPTS VIEW =====================

function NoSqlConceptsView() {
  const [selectedExample, setSelectedExample] = useState(0);
  const example = NOSQL_EXAMPLES[selectedExample];

  const typeColors: Record<string, { background: string; text: string; border: string }> = {
    document: { background: "bg-green-500/10", text: "text-green-400", border: "border-green-500/30" },
    keyValue: { background: "bg-yellow-500/10", text: "text-yellow-400", border: "border-yellow-500/30" },
    graph: { background: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/30" },
  };

  const colors = typeColors[example.type];

  return (
    <div className="space-y-3">
      {/* Example selector */}
      <div className="flex flex-wrap gap-1">
        {NOSQL_EXAMPLES.map((noSqlExample, index) => {
          const typeColor = typeColors[noSqlExample.type];
          return (
            <button key={index} onClick={() => setSelectedExample(index)}
              className={`px-2 py-1 text-[10px] font-mono rounded cursor-pointer transition-colors ${
                selectedExample === index
                  ? `${typeColor.background} ${typeColor.text} border ${typeColor.border}`
                  : "text-muted/60 hover:text-muted border border-card-border"
              }`}>{noSqlExample.title}</button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Operation panel */}
        <div className={`bg-card-border/10 rounded-lg p-3 border border-card-border/30`}>
          <div className="flex items-center gap-2 mb-1">
            <h4 className={`text-[11px] font-semibold ${colors.text}`}>{example.title}</h4>
            <span className={`text-[8px] px-1.5 py-0.5 rounded ${colors.background} ${colors.text} border ${colors.border}`}>
              {example.type}
            </span>
          </div>
          <p className="text-[9px] text-muted/60 mb-2">{example.description}</p>
          <pre className={`bg-black/30 rounded p-2 text-[9px] font-mono ${colors.text} whitespace-pre-wrap leading-relaxed`}>
            {example.operation}
          </pre>
          <p className="text-[8px] text-muted/50 mt-2">→ {example.resultDescription}</p>
        </div>

        {/* Visual representation */}
        <div className="bg-card-border/10 rounded-lg p-3 border border-card-border/30">
          <NoSqlDataVisualization type={example.type} />
        </div>
      </div>
    </div>
  );
}

function NoSqlDataVisualization({ type }: { type: string }) {
  if (type === "document") {
    return (
      <div>
        <h4 className="text-[10px] text-muted/60 mb-2">Document Model (JSON)</h4>
        <pre className="bg-black/30 rounded p-2 text-[8px] font-mono text-green-300 whitespace-pre-wrap leading-relaxed">
{`{
  "_id": "user_1001",
  "name": "Alice",
  "age": 28,
  "address": {
    "city": "NYC",
    "zip": "10001"
  },
  "orders": [
    { "id": "ord_1", "total": 59.99 },
    { "id": "ord_2", "total": 124.50 }
  ]
}`}
        </pre>
        <p className="text-[8px] text-muted/50 mt-1">Nested documents — no JOINs needed</p>
      </div>
    );
  }

  if (type === "keyValue") {
    const pairs = [
      { key: "user:1001", value: '{"name":"Alice","role":"admin"}' },
      { key: "session:abc", value: '{"userId":1001,"exp":3600}' },
      { key: "cache:page:/home", value: '"<html>...</html>"' },
    ];
    return (
      <div>
        <h4 className="text-[10px] text-muted/60 mb-2">Key-Value Store</h4>
        <div className="space-y-1.5">
          {pairs.map(({ key, value }) => (
            <div key={key} className="flex gap-2 items-start">
              <span className="bg-yellow-500/10 text-yellow-400 text-[8px] font-mono px-1.5 py-0.5 rounded shrink-0">{key}</span>
              <span className="text-[8px] font-mono text-muted/60 break-all">{value}</span>
            </div>
          ))}
        </div>
        <p className="text-[8px] text-muted/50 mt-2">O(1) lookups — blazing fast</p>
      </div>
    );
  }

  // Graph
  return (
    <div>
      <h4 className="text-[10px] text-muted/60 mb-2">Graph Model</h4>
      <svg viewBox="0 0 250 150" className="w-full max-w-[250px] mx-auto">
        {/* Edges */}
        <line x1={60} y1={40} x2={190} y2={40} stroke="rgba(168,85,247,0.4)" strokeWidth={1.5} />
        <line x1={60} y1={40} x2={125} y2={120} stroke="rgba(168,85,247,0.4)" strokeWidth={1.5} />
        <line x1={190} y1={40} x2={125} y2={120} stroke="rgba(168,85,247,0.4)" strokeWidth={1.5} />

        {/* Edge labels */}
        <text x={125} y={32} textAnchor="middle" className="fill-purple-400/60 text-[7px]">FOLLOWS</text>
        <text x={80} y={90} textAnchor="middle" className="fill-purple-400/60 text-[7px]">KNOWS</text>
        <text x={170} y={90} textAnchor="middle" className="fill-purple-400/60 text-[7px]">WORKS_WITH</text>

        {/* Nodes */}
        <circle cx={60} cy={40} r={18} fill="rgba(168,85,247,0.2)" stroke="#a855f7" strokeWidth={1.5} />
        <text x={60} y={43} textAnchor="middle" className="fill-purple-300 text-[8px]">Alice</text>

        <circle cx={190} cy={40} r={18} fill="rgba(168,85,247,0.2)" stroke="#a855f7" strokeWidth={1.5} />
        <text x={190} y={43} textAnchor="middle" className="fill-purple-300 text-[8px]">Bob</text>

        <circle cx={125} cy={120} r={18} fill="rgba(168,85,247,0.2)" stroke="#a855f7" strokeWidth={1.5} />
        <text x={125} y={123} textAnchor="middle" className="fill-purple-300 text-[8px]">Carol</text>
      </svg>
      <p className="text-[8px] text-muted/50 text-center">Nodes = entities, Edges = relationships</p>
    </div>
  );
}

// ===================== TYPES VIEW =====================

function TypesView() {
  const categories = Object.entries(DATABASE_CATEGORIES) as [DatabaseCategory, typeof DATABASE_CATEGORIES[DatabaseCategory]][];
  const colors: Record<DatabaseCategory, string> = {
    relational: "#3b82f6",
    document: "#22c55e",
    keyValue: "#fbbf24",
    graph: "#a855f7",
    columnar: "#ef4444",
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {categories.map(([key, info]) => (
        <div key={key} className="bg-card-border/10 rounded-lg p-3 border border-card-border/30">
          <h4 className="text-[11px] font-semibold mb-1" style={{ color: colors[key] }}>{info.name}</h4>
          <p className="text-[8px] text-muted/60 mb-2">{info.description}</p>
          <div className="space-y-1">
            <div className="text-[8px] text-muted/40">Examples: {info.examples.join(", ")}</div>
            <div className="text-[8px] text-muted/40">Scaling: {info.scalingType}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ===================== MAIN COMPONENT =====================

export function DatabaseVisualizer() {
  const [selectedMode, setSelectedMode] = useState<DatabaseMode>("sqlConcepts");
  const [btreeRoot, setBtreeRoot] = useState<BTreeNode>({ keys: [10, 20, 30], children: [] });
  const [insertValue, setInsertValue] = useState(15);
  const [searchValue, setSearchValue] = useState<number | null>(null);

  const handleInsert = useCallback(() => {
    if (insertValue < 0 || insertValue > 99) return;
    setBtreeRoot((prev) => insertIntoBTree(prev, insertValue, 3));
    setInsertValue(Math.floor(Math.random() * 99) + 1);
  }, [insertValue]);

  const handleSearch = useCallback(() => {
    setSearchValue(insertValue);
  }, [insertValue]);

  const handleReset = useCallback(() => {
    setBtreeRoot({ keys: [10, 20, 30], children: [] });
    setSearchValue(null);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-[10px] text-muted mb-1">View</label>
          <div className="flex gap-1">
            {MODES.map(({ key, label }) => (
              <button key={key} onClick={() => setSelectedMode(key)}
                className={`px-2 py-1 text-[10px] font-mono rounded cursor-pointer transition-colors ${
                  selectedMode === key
                    ? "bg-accent/20 text-accent border border-accent/30"
                    : "text-muted/60 hover:text-muted border border-card-border"
                }`}>{label}</button>
            ))}
          </div>
        </div>
      </div>

      {selectedMode === "btree" && (
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[120px] max-w-[200px]">
            <label className="text-[10px] text-muted flex justify-between">
              <span>Value</span>
              <span className="font-mono text-accent">{insertValue}</span>
            </label>
            <input type="range" min={1} max={99} step={1} value={insertValue}
              onChange={(event) => setInsertValue(Number(event.target.value))} className="w-full accent-[#6d5acf]" />
          </div>
          <button onClick={handleInsert} className="px-3 py-1.5 text-[10px] font-mono bg-accent/20 text-accent border border-accent/30 rounded hover:bg-accent/30 transition-colors cursor-pointer">Insert</button>
          <button onClick={handleSearch} className="px-3 py-1.5 text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded hover:bg-emerald-500/30 transition-colors cursor-pointer">Search</button>
          <button onClick={handleReset} className="px-3 py-1.5 text-[10px] font-mono text-muted border border-card-border rounded hover:text-foreground transition-colors cursor-pointer">Reset</button>
        </div>
      )}

      <div className={selectedMode === "btree" ? "bg-black/20 rounded-lg p-2 overflow-x-auto" : ""}>
        {selectedMode === "sqlConcepts" && <SqlConceptsView />}
        {selectedMode === "nosqlConcepts" && <NoSqlConceptsView />}
        {selectedMode === "btree" && <BTreeVisualization root={btreeRoot} searchValue={searchValue} />}
        {selectedMode === "types" && <TypesView />}
      </div>

      <SimulatorDetails data={DATABASE_MODE_INFO[selectedMode]} />
    </div>
  );
}
