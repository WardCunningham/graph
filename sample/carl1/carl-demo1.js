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


//////////////////////////////////////////////////////////////////
// Add all nodes (rels later for now)
// TODO consider reading relation table for both nodes and rels

let nodeTypeCaptionMap = new Map();
let nodeMap = new Map();


function prepareNodeTypeCaptions(){
  for (let row in node_type){
    let nodeIdStr = (node_type[row])["id"];
    if (nodeIdStr == null){
      break;
    }

    nodeTypeCaptionMap.set(nodeIdStr, (node_type[row])["caption"]);
  }
}

function addToNodes(dataTable, caption){ //, nodeTypeStr){
  for (let row in dataTable){
    let nodeIdStr = (dataTable[row])["id"];
    if (nodeIdStr == null){
      break;
    }

    nodeMap.set(nodeIdStr, g.addNode(caption, nonnil(dataTable[row])));
  }
}

prepareNodeTypeCaptions();
addToNodes(person, nodeTypeCaptionMap.get('N1'));
addToNodes(ideal, nodeTypeCaptionMap.get('N2'));
addToNodes(entity, nodeTypeCaptionMap.get('N3'));
addToNodes(action, nodeTypeCaptionMap.get('N4'));

//////////////////////////////////////////////////////////////
// Add all relations
let relation = await csv('https://raw.githubusercontent.com/WardCunningham/graph/main/sample/carl/relation.csv')
let role = await csv('https://raw.githubusercontent.com/WardCunningham/graph/main/sample/carl/role.csv')

let roleTypeCaptionMap = new Map();

for (let row in role){
  let roleIdStr = (role[row])["id"];
  if (roleIdStr == null){
    break;
  }

  roleTypeCaptionMap.set(roleIdStr, (role[row])["caption"]);
}

for (let _relation in relation){
  if ((relation[_relation])["id"] == null){
    break;
  }

  let relId = (relation[_relation])["id"];
  let nout = (relation[_relation])["node_out"];
  let nin = (relation[_relation])["node_in"];
  let roleId = (relation[_relation])["role_id"];
  let caption = roleTypeCaptionMap.get(roleId);

  //console.error(relId, nout, nin, roleId, caption);

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

