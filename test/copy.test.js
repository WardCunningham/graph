'use strict';

import {assertEquals } from "https://deno.land/std@0.126.0/testing/asserts.ts";
import {Graph} from '../src/graph.js';

// Tests for copying subtrees from this sample input

const url = 'http://ward.dojo.fed.wiki/assets/pages/identifying-distinct-activities/1272024.graph.json'
const input = await Graph.fetch(url)

// 0 => {"type":"Page","in":[4],"out":[0,1],"props":{"name":"Mixing\nBackground\nColors"}}
// 1 => {"type":"Page","in":[0],"out":[4],"props":{"name":"Transmission\nColor\nModel"}}
// 2 => {"type":"Page","in":[1],"out":[],"props":{"name":"Watch\nthe\nWeave"}}
// 3 => {"type":"Page","in":[],"out":[2,3],"props":{"name":"Search\nIndex\nLogs"}}
// 4 => {"type":"Page","in":[2],"out":[],"props":{"name":"Solo\nSuper\nCollaborator"}}
// 5 => {"type":"Page","in":[3],"out":[],"props":{"name":"Sites\nto\nbe\nIndexed"}}
// 6 => {"type":"Page","in":[],"out":[],"props":{"name":"Indexing\nthe\nUnknown"}}

// 0 => {"type":"","from":0,"to":1,"props":{"source":"1/27/2024"}}
// 1 => {"type":"","from":0,"to":2,"props":{"source":"1/27/2024"}}
// 2 => {"type":"","from":3,"to":4,"props":{"source":"1/27/2024"}}
// 3 => {"type":"","from":3,"to":5,"props":{"source":"1/27/2024"}}
// 4 => {"type":"","from":1,"to":0,"props":{"source":"1/27/2024"}}

Deno.test("We have expected input", async () => {
  assertEquals(input.nodes.length, 7);
  assertEquals(input.rels.length, 5)
});