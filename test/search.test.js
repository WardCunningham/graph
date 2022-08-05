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
  graph.addNode('Dev',{name:"Ward"})
  graph.addNode('Dev',{name:"Kelley"})
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

Deno.test("Simple Count Number of Related Node", () => {
  const graph = new Graph()
  const w = graph.addNode('Dev',{name:"Ward"})
  const k = graph.addNode('Dev',{name:"Kelley"})
  graph.addRel('Friends',w,k)
  const query = 'match (coder:Dev)-[]-(friend)'
  // return count(coder.name) as coders,  count(friend.name) as friends
  const rows = graph.search(query)
  const agg = rows => {
    const result = {coders:0, friends:0}
    for (const row of rows) {
      if(row.coder) result.coders += 1
      if(row.friend) result.friends += 1
    }
    return result
  }
  const result = agg(rows)
  assertEquals(result, {coders:2, friends:2})
})

Deno.test("Distinct Count Number of Related Node", () => {
  const graph = new Graph()
  const w = graph.addNode('Dev',{name:"Ward"})
  const k = graph.addNode('Dev',{name:"Kelley"})
  graph.addRel('Friends',w,k)

  const query = 'match (coder:Dev)-[]-(friend)'
  // return count(distinct coder.name) as coders,  count(distinct friend.name) as friends
  const rows = graph.search(query)
  const agg = rows => {
    const result = {coders:new Set(), friends:new Set()}
    for (const row of rows) {
      result.coders.add(row.coder.props.name)
      result.friends.add(row.friend.props.name)
    }
    return {coders:result.coders.size, friends:result.friends.size}
  }
  const result = agg(rows)
  assertEquals(result, {coders:2, friends:2})
})
