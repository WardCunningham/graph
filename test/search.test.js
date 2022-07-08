'use strict';

// Search with Cypher for evolving interface gradually.
// usage: deno test  // from parent project's root dir

import {assertEquals } from "https://deno.land/std@0.126.0/testing/asserts.ts";
import {Graph} from '../src/graph.js';

// From http://ward.dojo.fed.wiki/sigmod-example-unbound.html
const sigmod = new Graph([
{type:'Researcher',in:[],out:[0],props:{name:'Nils'}},
{type:'Publication',in:[0,2,3],out:[1],props:{name:'220'}},
{type:'Publication',in:[1],out:[],props:{name:'190'}},
{type:'Publication',in:[8],out:[2],props:{name:'235'}},
{type:'Publication',in:[4,10],out:[3],props:{name:'240'}},
{type:'Researcher',in:[],out:[4,5,6,9],props:{name:'Elin'}},
{type:'Student',in:[5,7],out:[],props:{name:'Sten'}},
{type:'Student',in:[6],out:[],props:{name:'Linda'}},
{type:'Publication',in:[9],out:[8,10],props:{name:'269'}},
{type:'Researcher',in:[],out:[7],props:{name:'Thor'}}
],[
{type:'Authors',from:0,to:1,props:{}},
{type:'Cites',from:1,to:2,props:{}},
{type:'Cites',from:3,to:1,props:{}},
{type:'Cites',from:4,to:1,props:{}},
{type:'Authors',from:5,to:4,props:{}},
{type:'Supervises',from:5,to:6,props:{}},
{type:'Supervises',from:5,to:7,props:{}},
{type:'Supervises',from:9,to:6,props:{}},
{type:'Cites',from:8,to:3,props:{}},
{type:'Authors',from:5,to:8,props:{}},
{type:'Cites',from:8,to:4,props:{}}
])

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
  assertEquals(result.length,2)
  assertEquals(result.map(row => row.coder.props.name),["Ward","Kelley"])
  assertEquals(result.map(row => row.friend.props.name),["Kelley","Ward"])
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

Deno.test("Match Different but Related Node", () => {
  const graph = new Graph()
  const w = graph.addNode('Client',{name:"Ward"})
  const k = graph.addNode('Advisor',{name:"Kelley"})
  graph.addRel('Engage',w,k)
  const query = 'match (coder:Client)-[]-(guide)'
  const result = graph.search(query)
  assertEquals(result.length,1)
  assertEquals(result.map(row => row.coder.props.name),["Ward"])
  assertEquals(result.map(row => row.guide.props.name),["Kelley"])
})

Deno.test("Match One Node then a Related Node", () => {
  const graph = new Graph()
  const w = graph.addNode('Client',{name:"Ward"})
  const k = graph.addNode('Advisor',{name:"Kelley"})
  graph.addRel('Engage',w,k)
  const query = 'match (coder:Client) match(coder)-[]-(guide)'
  const result = graph.search(query)
  assertEquals(result.length,1)
  assertEquals(result.map(row => row.coder.props.name),["Ward"])
  assertEquals(result.map(row => row.guide.props.name),["Kelley"])
})

// Deno.test("Optional Result for Absent Node in Small Graph", () => {
//   const graph = new Graph()
//   graph.addNode('Bar',{name:"wiki"})
//   const query = 'optional match (foo:Baz)'
//   assertEquals(graph.search(query),[{foo:null}])
// })

// match (who:Actor{name:"Lillian Gish"})
// optional match (who)-[:DIRECTED]-(what:Movie) 

// Deno.test("Match Actor with Optional Directed Movie", () => {
//   const graph = new Graph()
//   graph.addNode('Actor',{name:"Lillian Gish"})
//   const node = graph.nodes[0]
//   const query = `match (who:Actor{name:"Lillian Gish"}) optional match (who)-[:DIRECTED]-(what:Movie)`
//   assertEquals(graph.search(query),[{who:node,what:null}])
// })

const log = console.log
// from: https://homepages.inf.ed.ac.uk/libkin/papers/sigmod18.pdf
Deno.test("Match Researchers Supervising Students", () => {
  const query = `match (r:Researcher)-[:Supervises]->(s:Student)`
  const names = sigmod.search(query).map(row => [row.r.props.name, row.s.props.name])
  assertEquals(names,[['Elin','Sten'],['Elin','Linda'],['Thor','Sten']])
})
Deno.test("Match Researchers that also Supervising Students", () => {
  const query = `match (r:Researcher) match (r)-[:Supervises]->(s:Student)`
  const names = sigmod.search(query).map(row => [row.r.props.name, row.s.props.name])
  assertEquals(names,[['Elin','Sten'],['Elin','Linda'],['Thor','Sten']])
})
Deno.test("Match Researchers Possibly Supervising Students", () => {
  const query = `match (r:Researcher) optional match (r)-[:Supervises]->(s:Student)`
  const names = sigmod.search(query,{log}).map(row => [row.r.props.name, row.s.props.name])
  assertEquals(names,[['Nils',null],['Elin','Sten'],['Elin','Linda'],['Thor','Sten']])
})
