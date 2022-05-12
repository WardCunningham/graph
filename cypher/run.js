// parse each of many test expressions
// deno run --allow-read run.js

import { Graph } from '../src/graph.js'
const graph = await Graph.read('../sample/data/mock-graph.json')
console.error(graph.tally())

import { parse, tree } from './parse.js'

const cypher =
`match (proj:Project)-[r1:Manager]->(mngr:Employee)-[r2:Manager]->(exec:Employee)`

for (const query of cypher.split(/\n+/)) {
  console.error()
  console.error(query)
  if(parse(query))
    gen(0,tree[0][0])
  else
    console.error('parse failed')
}

function gen(level, tree) {
  const tab = () => ' |'.repeat(level)
  switch (tree[0]) {
    case 'sp':
    case 'ch':
    case 'term':
      break
    case 'bind':
    case 'type':
      console.error(tab(), tree[0], `"${tree[1][1]}"`)
      break
    case 'match':
    case 'node':
    case 'chain':
    case 'rel':
    case 'in':
    case 'out':
    case 'elem':
      console.error(tab(), tree[0])
      for (const branch of tree.slice(1)) gen(level+1,branch)
      break
    case 'eot':
      console.error(tab(), 'end')
      break
    default:
      console.error(tab(), 'unknown', tree[0])
  }
}

const code = {
  node:{bind:'proj', type:'Project'},
  chain:{
    rel:{bind:'r1', type:'Manager', dir:'out'},
    node:{bind:'mngr', type:'Employee'},
    chain:{
      rel:{bind:'r2', type:'Manager', dir:'out'},
      node:{bind:'exec', type:'Employee'},
      chain:{}
    }
  }
}

console.error()
console.table(apply(graph, code))

function apply(graph, code) {
  const nodes = graph.nodes
  const rels = graph.rels
  const results = []
  for (const node of nodes) {
    chain(node, code, {})
  }
  return results

  function chain(node, code, maybe) {
    if (node.type == code.node.type) {
      maybe[code.node.bind] = node.props.name
      if (code.chain.rel) {
        const rids = node[code.chain.rel.dir]
        rids.forEach(rid => {
          if (rels[rid].type == code.chain.rel.type) {
            // maybe[code.chain.rel.bind] = rels[rid]
            chain(nodes[rels[rid]['to']], code.chain, maybe)
          }
        })
      } else {
        results.push(maybe)
      }
    }
  }
}
