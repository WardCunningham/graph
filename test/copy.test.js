'use strict';

import {assertEquals } from "https://deno.land/std@0.126.0/testing/asserts.ts";
import {Graph} from '../src/graph.js';
const short = props => props.name.split(/\n/)[0]
const nameof = (graph,nid) => short(graph.nodes[nid].props)
const names = graph => graph.nodes.map(node => short(node.props)).sort()
const relations = graph => graph.rels.map(rel => `${nameof(graph,rel.from)} -> ${nameof(graph,rel.to)}`).sort()

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
  assertEquals(input.rels.length, 5);
  assertEquals(names(input), ["Indexing","Mixing","Search","Sites","Solo","Transmission","Watch",]);
  assertEquals(relations(input), ["Mixing -> Transmission","Mixing -> Watch","Search -> Sites","Search -> Solo","Transmission -> Mixing"]);
});
Deno.test("We have right nodes and rels in a copy", async () => {
  const cluster = new Graph()
  input.copy(0,cluster)
  assertEquals(names(cluster), ["Mixing","Transmission","Watch",]);
  assertEquals(relations(cluster), ["Mixing -> Transmission","Mixing -> Watch","Transmission -> Mixing"]);
});
Deno.test("We have aliased props in the copy", async () => {
  const local = Graph.load(JSON.parse(input.stringify()))
  assertEquals(names(local), ["Indexing","Mixing","Search","Sites","Solo","Transmission","Watch"]);
  const cluster = new Graph()
  local.copy(0,cluster)
  cluster.nodes[0].props.name = 'Hello'
  assertEquals(names(cluster), ["Hello","Transmission","Watch"]);
  assertEquals(names(local), ["Hello","Indexing","Search","Sites","Solo","Transmission","Watch"]);
});
Deno.test("We don't have aliased relations in the copy", async () => {
  const local = Graph.load(JSON.parse(input.stringify()))
  const cluster = new Graph()
  local.copy(0,cluster)
  cluster.addRel("",0,cluster.addNode("Page",{name:"Good Bye"}))
  assertEquals(names(local), ["Indexing","Mixing","Search","Sites","Solo","Transmission","Watch"]);
  assertEquals(names(cluster), ["Good Bye","Mixing","Transmission","Watch"]);
  assertEquals(relations(local), ["Mixing -> Transmission","Mixing -> Watch","Search -> Sites","Search -> Solo","Transmission -> Mixing"]);
  assertEquals(relations(cluster), ["Mixing -> Good Bye","Mixing -> Transmission","Mixing -> Watch","Transmission -> Mixing"]);
});