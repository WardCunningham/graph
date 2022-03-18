// Trial integration of csv files for Carl M.
// Usage: deno run --allow-net carl-demo2.js > carl.graph.json
// This carl2 design has simpler csv data files.
// There is no relations file and no node_type file.
// Each node holds a list of it's related nodes.
// This file is being ported to work with the new data. 
// (cloned into carl2 dir)
// Once all ported and OK, remove the numbering carl1 & carl2

import {csv} from "https://cdn.skypack.dev/d3-fetch@3"
import {Graph} from "../../src/graph.js"

function nonnil(oldobj){
  const newobj = {};
  for (const key in oldobj){
    if (oldobj[key]){
      newobj[key] = oldobj[key];
    }
  }

  return newobj;
}

const g = new Graph();
const nodeMap = new Map();  // This map may not be needed if we just use g.nodes
let inputData = [4];

// TODO make into a function. Not use it's waiting.
//async function readAllInputData(data){
  inputData[0] = await csv('https://raw.githubusercontent.com/WardCunningham/graph/main/sample/carl2/person2.csv');
  inputData[1] = await csv('https://raw.githubusercontent.com/WardCunningham/graph/main/sample/carl2/ideal2.csv');
  inputData[2] = await csv('https://raw.githubusercontent.com/WardCunningham/graph/main/sample/carl2/entity2.csv');
  inputData[3] = await csv('https://raw.githubusercontent.com/WardCunningham/graph/main/sample/carl2/action2.csv');
//}

function addToNodes(dataTable){
  for (const row in dataTable){
    const nodeIdStr = (dataTable[row])["id"];
    if (nodeIdStr == null){
      break;
    }

    const caption = (dataTable[row])["caption"];
    nodeMap.set(nodeIdStr, g.addNode(caption, nonnil(dataTable[row])));
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
    const node_id = node["props"]["id"];
    const related_nodes_str = node["props"]["Advisor"] + " " 
                            + node["props"]["Board"] + " " 
                            + node["props"]["Support"];

    const related_node_ids = related_nodes_str.split(" ");
    const nout = node_id;
    const caption = node["props"]["caption"];

      for (const nin of related_node_ids){
      if (nin != "undefined"){ // TODO prevent need for this check. See nonnil.
        g.addRel(caption, nodeMap.get(nout), nodeMap.get(nin), {});
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

//////////////////////////////////////////////////////

//readAllInputData(inputData);  // Done inline instead
addAllNodes();
addAllRelations();
outputGraphForWiki();

