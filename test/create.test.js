'use strict';

// Graph tests for graph creation conveniences
// usage: deno test  // from parent project's root dir

import {assertEquals } from "https://deno.land/std@0.126.0/testing/asserts.ts";
import {Graph} from '../src/graph.js';

Deno.test("Adding Unique Nodes Only Once", () => {
  const g = new Graph();
  g.addNode('God')
  g.addNode('Man',{name:'Adam'})
  g.addNode('Woman',{name:'Eve'})
  assertEquals(g.size(), 3);
  g.addUniqNode('Man',{name:'Adam'})
  g.addUniqNode('God')
  assertEquals(g.size(), 3);
});

Deno.test("Ignore Rels for Nodes Null or Undefined", () => {
  const g = new Graph();
  let nid = g.addNode('Man',{name:'Adam'})
  let rid = g.addRel('',nid,nid)
  assertEquals(rid, 0)
  rid = g.addRel('',null,nid)
  assertEquals(rid, null)
  rid = g.addRel('',nid,undefined)
  assertEquals(rid, null)
});
