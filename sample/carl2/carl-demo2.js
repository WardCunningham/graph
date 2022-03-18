'use strict';

// Trial integration of csv files for Carl M.
// Usage: deno run --allow-net carl-demo2.js > carl.graph.json
// Needs review and coding standard changes.
// This carl2 design has simpler csv data files.
// There is no relations file and no node_type file.
// Each node holds a list of it's related nodes.
// This file is being ported to work with the new data. 
// (cloned from carl1 into carl2 dir)
// Once all ported and OK, remove the numbering carl1 & carl2

import {csv} from "https://cdn.skypack.dev/d3-fetch@3"
import {Graph} from "../../src/graph.js"

const g = new Graph();
const nodeMap = new Map();  // This map may not be needed if we just use g.nodes
const inputData = [];

function nonnil(oldobj){
  const newobj = {};
  for (const key in oldobj){
    if (oldobj[key]){
      newobj[key] = oldobj[key];
    }
  }

  return newobj;
}

// TODO make into a function. Not sure it's waiting.
//async function readAllInputData(data){
const urlForData = 'https://raw.githubusercontent.com/WardCunningham/graph/main/sample/carl2/';
inputData[0] = await csv(urlForData + 'person2.csv');
inputData[1] = await csv(urlForData + 'ideal2.csv');
inputData[2] = await csv(urlForData + 'entity2.csv');
inputData[3] = await csv(urlForData + 'action2.csv');
//}

function addToNodes(dataTable){
  const typeStr = dataTable.columns[0];
  for (const row in dataTable){
    const externalId = (dataTable[row])[typeStr];
    if (externalId == null){
      break;
    }

    nodeMap.set(externalId, g.addNode(typeStr, nonnil(dataTable[row])));
  }
}

function addAllNodes(){
  addToNodes(inputData[0]);
  addToNodes(inputData[1]);
  addToNodes(inputData[2]);
  addToNodes(inputData[3]);
}

function addAllRelations(){
  for (const node of g.nodes){
    const type = Object.keys(node.props)[0];
    const relTypes = Object.keys(node.props).slice(1).filter(word => (word.charAt(0) === word.charAt(0).toUpperCase()));
    for (const relType of relTypes){
      const nodeIds = node["props"][relType].split(" ");
      for (const toNodeId of nodeIds){
        const from_id = g.nodes.indexOf(node);
        //g.addRel(relType, nodeMap.get(from_id), nodeMap.get(nodeId), {});
        g.addRel(relType, from_id, nodeMap.get(toNodeId), {});
      }

    }
  }
}

function outputGraphForWiki(){
  const json = JSON.stringify({
    nodes: g.nodes,
    rels: g.rels
  },null,2)

  console.log(json);
}

//----------------------------------------------------
//readAllInputData(inputData);  // Done inline instead
addAllNodes();
addAllRelations();
outputGraphForWiki();
