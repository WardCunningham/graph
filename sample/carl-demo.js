// Trial integration of csv files for Carl M.
// Usage: deno run --allow-net carl-demo.js > carl/carl.graph.json

import {csv} from "https://cdn.skypack.dev/d3-fetch@3"
import {Graph} from "../src/graph.js"

function nonnil(oldobj){
  let newobj = {};
  for (let key in oldobj){
    if (oldobj[key]){
      newobj[key] = oldobj[key];
    }
  }

  return newobj;
}


let g = new Graph()

// Add all nodes
let person = await csv('https://raw.githubusercontent.com/WardCunningham/graph/main/sample/carl/person.csv')
let ideal = await csv('https://raw.githubusercontent.com/WardCunningham/graph/main/sample/carl/ideal.csv')
let entity = await csv('https://raw.githubusercontent.com/WardCunningham/graph/main/sample/carl/entity.csv')
let action = await csv('https://raw.githubusercontent.com/WardCunningham/graph/main/sample/carl/action.csv')

let nodeId = [];
let nodeIndex = 0;

// For each person, add a person node 
// (find a way to generalize by type. could have a nodes table/file.)
// TODO find better way of skipping blank line, and doing break.
// extra blank node of each type. Ignore blank. (header?)
for (let _person in person){
  if ((person[_person])["id"] == null){
    break;
  }
  nodeIndex += 1;
  nodeId[nodeIndex] = g.addNode('Person', nonnil(person[_person]));
}

for (let _ideal in ideal){
  if ((ideal[_ideal])["id"] == null){
    break;
  }
  nodeIndex += 1;
  nodeId[nodeIndex] = g.addNode('Ideal', nonnil(ideal[_ideal]));
}

for (let _entity in entity){
  if ((entity[_entity])["id"] == null){
    break;
  }
  nodeIndex += 1;
  nodeId[nodeIndex] = g.addNode('Entity', nonnil(entity[_entity]));
}

for (let _action in action){
  if ((action[_action])["id"] == null){
    break;
  }
  nodeIndex += 1;
  nodeId[nodeIndex] = g.addNode('Action', nonnil(action[_action]));
}


// Add all relations
let relation = await csv('https://raw.githubusercontent.com/WardCunningham/graph/main/sample/carl/relation.csv')

// "id": "P1"
addRel('Support', nodeId[0], nodeId[1], props={})
//g.addRel('Hosts', e, p, {recorded:"20220225"});

//console.log("TODO add relations.")


let json = JSON.stringify({
  nodes: g.nodes,
  rels: g.rels
},null,2)

console.log(json)
