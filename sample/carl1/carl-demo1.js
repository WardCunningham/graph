// Trial integration of csv files for Carl M.
// Usage: deno run --allow-net carl-demo.js > carl/carl.graph.json

import {csv} from "https://cdn.skypack.dev/d3-fetch@3"
import {Graph} from "../src/graph.js"

function nonnil(oldobj){
  const newobj = {};
  for (const key in oldobj){
    if (oldobj[key]){
      newobj[key] = oldobj[key];
    }
  }

  return newobj;
}

const g = new Graph()

// Open all data files for nodes
const person = await csv('https://raw.githubusercontent.com/WardCunningham/graph/main/sample/carl/person.csv');
const ideal = await csv('https://raw.githubusercontent.com/WardCunningham/graph/main/sample/carl/ideal.csv')
//console.error(ideal);
const entity = await csv('https://raw.githubusercontent.com/WardCunningham/graph/main/sample/carl/entity.csv')
const action = await csv('https://raw.githubusercontent.com/WardCunningham/graph/main/sample/carl/action.csv')
const node_type = await csv('https://raw.githubusercontent.com/WardCunningham/graph/main/sample/carl/node_type.csv')


//////////////////////////////////////////////////////////////////
// Add all nodes (rels later for now)
// TODO consider reading relation table for both nodes and rels

const nodeTypeCaptionMap = new Map();
const nodeMap = new Map();


function prepareNodeTypeCaptions(){
  for (const row in node_type){
    const nodeIdStr = (node_type[row])["id"];
    if (nodeIdStr == null){
      break;
    }

    nodeTypeCaptionMap.set(nodeIdStr, (node_type[row])["caption"]);
  }
}

function addToNodes(dataTable, caption){ //, nodeTypeStr){
  for (const row in dataTable){
    const nodeIdStr = (dataTable[row])["id"];
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
const relation = await csv('https://raw.githubusercontent.com/WardCunningham/graph/main/sample/carl/relation.csv')
const role = await csv('https://raw.githubusercontent.com/WardCunningham/graph/main/sample/carl/role.csv')

const roleTypeCaptionMap = new Map();

for (const row in role){
  const roleIdStr = (role[row])["id"];
  if (roleIdStr == null){
    break;
  }

  roleTypeCaptionMap.set(roleIdStr, (role[row])["caption"]);
}

for (const _relation in relation){
  if ((relation[_relation])["id"] == null){
    break;
  }

  //const relId = (relation[_relation])["id"];
  const nout = (relation[_relation])["node_out"];
  const nin = (relation[_relation])["node_in"];
  const roleId = (relation[_relation])["role_id"];
  const caption = roleTypeCaptionMap.get(roleId);

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

const json = JSON.stringify({
  nodes: g.nodes,
  rels: g.rels
},null,2)

console.log(json);

