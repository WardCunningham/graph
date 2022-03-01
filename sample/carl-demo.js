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
let node_type = await csv('https://raw.githubusercontent.com/WardCunningham/graph/main/sample/carl/node_type.csv')


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
// TODO use more general way by reading table
// relationId = [];
//let relationIndex = 0;
let relation = await csv('https://raw.githubusercontent.com/WardCunningham/graph/main/sample/carl/relation.csv')


function getNodeTypeName(node_typeId) {
  let nodeTypeName;
  //let nodeTypeIndex = 0;
  //let nodeTypeName = [];
  for (let _node_type in node_type){
    if ( (node_type[_node_type])["id"] == null){
      break;
    }

    if ( (node_type[_node_type])["id"] == node_typeId){
        nodeTypeName = (node_type[_node_type])["name"];
        //nodeTypeIndex += 1;
        //nodeTypeName[nodeTypeIndex] = (node_type[_node_type])["name"];
        break;
      }
    }

    return nodeTypeName;
  }


/*
for (let rel in relation){
  if ((relation[rel])["id"] == null){
    break;
  }
  

  let node_typeIdOut = (relation[rel])["node_type_out"];
  let node_typeIdIn = (relation[rel])["node_type_in"];

  let node_IdOut = (relation[rel])["node_out"];
  let node_IdIn = (relation[rel])["node_in"];

  //console.error(relation[rel]);
  //console.error(node_typeIdOut, node_typeIdIn);

  let nodeTypeNameOut = getNodeTypeName(node_typeIdOut);
  let nodeTypeNameIn = getNodeTypeName(node_typeIdIn);

  //let node_type_name = (node_type[_node_type])["name"];
  //console.error(node_typeIdOut, nodeTypeNameOut, node_typeIdIn, nodeTypeNameIn);

  // TODO fix. Temporary limit of number relations
  if (rel > 1){
    break;
  }

  // TODO get role name and add to relation below

  console.error(rel, nodeTypeNameOut, nodeTypeNameIn);
  console.error(rel, node_IdOut, node_IdIn);
  //console.error(${nodeTypeNameOut});
  let haveOutNode = g.n(nodeTypeNameOut, {id:node_IdOut}).nids;
  let haveInNode = g.n(nodeTypeNameIn, {id:node_IdIn}).nids;

  g.addRel('tempRel', haveOutNode[rel], haveInNode[rel], {});
}
*/

//Manual way to wire up relations. Remove once table working.
let havePerson = g.n('Person',{id:"P1"}).nids
let haveIdeal = g.n('Ideal',{id:"I1"}).nids
let haveEntity = g.n('Entity',{id:"E1"}).nids
let haveAction = g.n('Action',{id:"A1"}).nids

//console.error(havePerson[0], haveIdeal[0]);

g.addRel('Support', havePerson[0], haveIdeal[0], {})
g.addRel('Board', havePerson[0], haveEntity[0], {})
g.addRel('Support', havePerson[0], haveAction[0], {})
//g.addRel('Hosts', e, p, {recorded:"20220225"});


//console.log("TODO add relations.")


let json = JSON.stringify({
  nodes: g.nodes,
  rels: g.rels
},null,2)

console.log(json)
