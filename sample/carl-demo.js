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

// Open all data files for nodes
let person = await csv('https://raw.githubusercontent.com/WardCunningham/graph/main/sample/carl/person.csv');
let ideal = await csv('https://raw.githubusercontent.com/WardCunningham/graph/main/sample/carl/ideal.csv')
//console.error(ideal);
let entity = await csv('https://raw.githubusercontent.com/WardCunningham/graph/main/sample/carl/entity.csv')
let action = await csv('https://raw.githubusercontent.com/WardCunningham/graph/main/sample/carl/action.csv')
let node_type = await csv('https://raw.githubusercontent.com/WardCunningham/graph/main/sample/carl/node_type.csv')


// Add all nodes (rels later for now)
// TODO get node type string from node_type table.  
// TODO consider reading relation table for both nodes and rels
let nodeMap = new Map();

function addToNodes(dataTable, nodeTypeStr){
  for (let row in dataTable){
    let nodeIdStr = (dataTable[row])["id"];
    if (nodeIdStr == null){
      break;
    }

    nodeMap.set(nodeIdStr, g.addNode(nodeTypeStr, nonnil(dataTable[row])));
  }
}

// TODO change string to value from node_type table and hashMap
addToNodes(person, 'Person');
addToNodes(ideal, 'Ideal');
addToNodes(entity, 'Entity');
addToNodes(action, 'Action');

// Add all relations
let relation = await csv('https://raw.githubusercontent.com/WardCunningham/graph/main/sample/carl/relation.csv')

// TODO replace this temp way with read role file and put in map
function roleCaption(roleId){

  let val = "";
  switch(roleId) {
    case 'R1':
      val = 'Advisor';
      break;
    case 'R2':
      val = 'Board';
      break;
    case 'R3':
      val = 'Support';
      break;
    default:
      val = 'DEFAULTerror'
  }

  return val;
}

for (let _relation in relation){
  if ((relation[_relation])["id"] == null){
    break;
  }

  let relId = (relation[_relation])["id"];
  let nout = (relation[_relation])["node_out"];
  let nin = (relation[_relation])["node_in"];
  let roleId = (relation[_relation])["role_id"];
  let caption = roleCaption(roleId);

  console.error(relId, nout, nin, roleId, caption);

  g.addRel(caption, nodeMap.get(nout), nodeMap.get(nin), {});
}

//////////////////////////////////////////////////////

//Manual way to wire up relations. Remove once table working and reviewed
/*
//let havePerson = g.n(getNodeTypeNameFromNodeIdStr('P1'),{id:"P1"}).nids
let havePerson = g.n('Person',{id:"P1"}).nids
let haveIdeal = g.n('Ideal',{id:"I1"}).nids
let haveEntity = g.n('Entity',{id:"E1"}).nids
let haveAction = g.n('Action',{id:"A1"}).nids

//console.error(havePerson[0], haveIdeal[0]);

//g.addRel('Support', nodeMap.get('P1'), nodeMap.get('I1'), {})
g.addRel('Support', havePerson[0], haveIdeal[0], {})
g.addRel('Board', havePerson[0], haveEntity[0], {})
g.addRel('Support', havePerson[0], haveAction[0], {})
//g.addRel('Hosts', e, p, {recorded:"20220225"});
*/


//////////////////////////////////////////////////////

let json = JSON.stringify({
  nodes: g.nodes,
  rels: g.rels
},null,2)

console.log(json);

