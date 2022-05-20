'use strict';

// Search with Cypher for evolving interface gradually.
// usage: deno test  // from parent project's root dir

import {assertEquals } from "https://deno.land/std@0.126.0/testing/asserts.ts";
import {Graph} from '../src/graph.js';

Deno.test("No Result from Empty Graph", () => {
  const graph = new Graph()
  const query = 'match (foo:Bar)'
  assertEquals(graph.search(query),[])
})

Deno.test("Match a Simple Node", () => {
  const graph = new Graph()
  graph.addNode('Bar',{name:"wiki"})
  const node = graph.nodes[0]
  const query = 'match (foo:Bar)'
  assertEquals(graph.search(query),[{foo:node}])
})

Deno.test("Match Two Node", () => {
  const graph = new Graph()
  const w = graph.addNode('Dev',{name:"Ward"})
  const k = graph.addNode('Dev',{name:"Kelley"})
  const query = 'match (coder:Dev)'
  const result = graph.search(query)
  assertEquals(result.map(row => row.coder.props.name),["Ward","Kelley"])
})

Deno.test("Match Two Related Node", () => {
  const graph = new Graph()
  const w = graph.addNode('Dev',{name:"Ward"})
  const k = graph.addNode('Dev',{name:"Kelley"})
  graph.addRel('Friends',w,k)
  const query = 'match (coder:Dev)-[]-(friend)'
  const result = graph.search(query)
  assertEquals(result.length,2)
  assertEquals(result.map(row => row.coder.props.name),["Ward","Kelley"])
  assertEquals(result.map(row => row.friend.props.name),["Kelley","Ward"])
})
