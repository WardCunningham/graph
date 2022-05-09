// parse each of many test expressions
// deno run --allow-read run.js

// import { Graph } from '../src/graph.js'
// const graph = await Graph.read('../sample/data/mock-graph.json')
// console.error(graph.tally())

import { parse } from './parse.js'

const match = await Deno.readTextFile('./match.txt')

for (const line of match.split(/\n+/)) {
  console.error()
  console.error(line)
  console.error(parse(line))
}
