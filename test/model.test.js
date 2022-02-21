'use strict';

// Model tests for evolving interface gradually.
// usage: deno test  // from parent project's root dir

import { assert, assertEquals } from "https://deno.land/std@0.126.0/testing/asserts.ts";
import {nodes, rels, addnode, addrel, removeModel} from '../src/model.js'

Deno.test("Zero Nodes Prior to Adding Nodes", () => {
  assert(0 == nodes.length );
});

Deno.test("Zero Relations Prior to Adding Nodes", () => {
  assert(0 == rels.length );
});

Deno.test("Add First Node And Count Updated To One", () => {
  let emptyprops = {};
  addnode('SampleNodeType', emptyprops);
  assertEquals(1, nodes.length);
  removeModel();
});

Deno.test("Add First Node And Properties Available", () => {
  let someprops = {"name":"TestName1", "email":"w@c2.com"};
  addnode('SampleNodeType', someprops);
  assertEquals("TestName1", nodes[0].props.name);
  assertEquals("w@c2.com", nodes[0].props.email);
  removeModel();
});


