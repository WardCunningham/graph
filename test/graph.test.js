'use strict';

// Graph tests for evolving interface gradually.
// usage: deno test  // from parent project's root dir

import { assert, assertEquals } from "https://deno.land/std@0.126.0/testing/asserts.ts";
import {Graph} from '../src/graph.js';

Deno.test("New Graph Has Zero Nodes", () => {
  let g = new Graph();
  assertEquals(g.nodes.length, 0);
});

Deno.test("New Graph Has Size Zero", () => {
  let g = new Graph();
  assertEquals(g.size(), 0);
});

Deno.test("Adding One Node Yields Size One", () => {
  let g = new Graph();
  g.addNode('SampleNodeType')
  assertEquals(g.size(), 1);
  assertEquals(g.nodes[0].props, {})
});

Deno.test("Adding Two Nodes Of One Type Yields Tally Two", () => {
  let g = new Graph();
  g.addNode('SampleNodeType', {name:"Ward"});
  g.addNode('SampleNodeType', {name:"Kelley"});
  assertEquals(g.tally().nodes['SampleNodeType'], 2 );
});

Deno.test("New Graph Has Zero Rels", () => {
  let g = new Graph();
  assertEquals(g.rels.length, 0 );
});

Deno.test("Adding Three Nodes And One Rels Yields Size Four", () => {
  let g = new Graph();
  let marc = g.addNode('SampleNodeType', {name:"Marc"});
  let ward = g.addNode('SampleNodeType', {name:"Ward"});
  let kelley = g.addNode('SampleNodeType', {name:"Kelley"});
  g.addRel('SampleRelType', ward, kelley);
  assertEquals(g.size(), 4);
  assertEquals(g.rels.length, 1 );
  assertEquals(g.tally().rels['SampleRelType'], 1 );
});

