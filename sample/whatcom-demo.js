// Trial integration of csv files from Whatcom county
// Usage: deno run --allow-net whatcom-demo.js > whatcom/whatcom.graph.json

import {csv} from "https://cdn.skypack.dev/d3-fetch@3"
import {Graph} from "../src/graph.js"

let g = new Graph()
let entity = await csv('https://raw.githubusercontent.com/WardCunningham/graph/main/sample/whatcom/entity.csv')

function nonnil(oldobj){
  let newobj = {};
  for (let key in oldobj){
    if (oldobj[key]){
      newobj[key] = oldobj[key];
    }
  }

  return newobj;
}

let e = g.addNode('Entity', nonnil(entity[0]));
//console.log(e)

let program = await csv('https://raw.githubusercontent.com/WardCunningham/graph/main/sample/whatcom/program.csv')
let p = g.addNode('Program', nonnil(program[0]));
//console.log(p)

// addRel(type, from, to, props={})
g.addRel('Hosts', e, p, {recorded:"20220225"});

//console.log(sheet[0])


let json = JSON.stringify({
  nodes: g.nodes,
  rels: g.rels
},null,2)

console.log(json)
