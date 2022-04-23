'use strict';

// Graph tests for evolving interface gradually.
// usage: deno test  // from parent project's root dir

import {assertEquals } from "https://deno.land/std@0.126.0/testing/asserts.ts";
import {Graph} from '../src/graph.js';

Deno.test("New Graph Has Zero Nodes", () => {
  const g = new Graph();
  assertEquals(g.nodes.length, 0);
});

Deno.test("New Graph Has Size Zero", () => {
  const g = new Graph();
  assertEquals(g.size(), 0);
});

Deno.test("Adding One Node Yields Size One", () => {
  const g = new Graph();
  g.addNode('SampleNodeType')
  assertEquals(g.size(), 1);
  assertEquals(g.nodes[0].props, {})
});

Deno.test("Adding Two Nodes Of One Type Yields Tally Two", () => {
  const g = new Graph();
  g.addNode('SampleNodeType', {name:"Ward"});
  g.addNode('SampleNodeType', {name:"Kelley"});
  assertEquals(g.tally().nodes['SampleNodeType'], 2 );
});

Deno.test("New Graph Has Zero Rels", () => {
  const g = new Graph();
  assertEquals(g.rels.length, 0 );
});

Deno.test("Adding Three Nodes And One Rels Yields Size Four", () => {
  const g = new Graph();
  g.addNode('SampleNodeType', {name:"Marc"});
  const ward = g.addNode('SampleNodeType', {name:"Ward"});
  const kelley = g.addNode('SampleNodeType', {name:"Kelley"});
  g.addRel('SampleRelType', ward, kelley);
  assertEquals(g.size(), 4);
  assertEquals(g.rels.length, 1 );
  assertEquals(g.tally().rels['SampleRelType'], 1 );
});

Deno.test("Serialize graph", () => {
  const g = new Graph();
  const marc = g.addNode("Person", { name: "Marc" });
  const ward = g.addNode("Person", { name: "Ward" });
  g.addRel("Friend", marc, ward);
  assertEquals(
    g.stringify(),
    '{"nodes":[{"type":"Person","in":[],"out":[0],"props":{"name":"Marc"}},{"type":"Person","in":[0],"out":[],"props":{"name":"Ward"}}],"rels":[{"type":"Friend","from":0,"to":1,"props":{}}]}',
  );
});

Deno.test("Serialize graph with arbitrary JSON.stringify arguments", () => {
  const g = new Graph();
  g.addNode("Person", { name: "Ward" });

  const stringifiedGraph = g.stringify(null, 2)
  assertEquals(stringifiedGraph, '{\n  "nodes": [\n    {\n      "type": "Person",\n      "in": [],\n      "out": [],\n      "props": {\n        "name": "Ward"\n      }\n    }\n  ],\n  "rels": []\n}')
});
