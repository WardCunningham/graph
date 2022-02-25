// Trial integration of csv files from Whatcom county
// Usage: deno run --allow-read > whatcom/whatcom.graph.json

import {csv} from "https://cdn.skypack.dev/d3-fetch@3"
import {Graph} from "../src/graph.js"

let g = new Graph()
let sheet = await csv('...')



let json = JSON.stringify({
  nodes: g.nodes,
  rels: g.rels
},null,2)
console.log(json)