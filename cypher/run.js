// parse each of many test expressions
// deno run --allow-read run.js

import { Graph } from '../src/graph.js'
import { search } from './cypher.js'

const graph = await Graph.read('../sample/data/mock-graph.json')
console.error(graph.tally())

const queries =
`match (mngr: Employee {name: "B. B. Clark"}) -[:Manager]-> (stuff)
match (mngr: Employee {name: "B. B. Clark"}) <-[:Manager]- (stuff)
match (mngr: Employee {name: "B. B. Clark"}) -[:Manager]- (stuff)
match (mngr: Employee {name: "B. B. Clark"}) -[]- (:Project) -[]- (:Service) -[:Traffic{environment:"production"}]-> (stat)`

for (const query of queries.split(/\n+/)) {
  console.error(query)
  console.table(format(graph.search(query,{log})))
}

function log(text) {
  const trace = text.replace(/\%c/,"ZZZ<").replace(/\%c/,">ZZZ").replace(/ZZZ/g,"%c")
  console.log(trace,"color:red","color:black")
}

function format(results) {
  return results.map(row =>
    Object.fromEntries(Object.keys(row).map(key =>
      [key,row[key].props.name || row[key].type])
  ))
}