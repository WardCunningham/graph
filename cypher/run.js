// parse each of many test expressions
// deno run --allow-read run.js

import { Graph } from '../src/graph.js'
const graph = await Graph.read('../sample/data/mock-graph.json')
console.error(graph.tally())

import { parse, tree } from './parse.js'

const cypher =
`match (proj:Project) -[r1:Manager]-> (mngr:Employee)
match (mngr:Employee) <-[r1:Manager]- (proj:Project)
match (proj:Project) -[r1:Manager]-> (mngr:Employee) -[r2:Manager]-> (exec:Employee)
match (exec:Employee) <-[r2:Manager]- (mngr:Employee) <-[r1:Manager]- (proj:Project)`


for (const query of cypher.split(/\n+/)) {
  console.error()
  console.error(query,"\n")
  if(parse(query)) {
    const code = gen(0,tree[0][0],{})
    console.dir(code, {depth:15})
    const results = apply(graph,code)
    console.table(results)
  } else
    console.error('parse failed')
}

function gen(level, tree, code) {
  const tab = () => ' |'.repeat(level)
  switch (tree[0]) {
    case 'sp':
    case 'ch':
    case 'term':
      break
    case 'bind':
    case 'type':
      console.error(tab(), tree[0], `"${tree[1][1]}"`)
      code[tree[0]] = tree[1][1]
      break
    case 'node':
    case 'chain':
    case 'rel':
      console.error(tab(), tree[0])
      let sub = {}
      code[tree[0]] = sub
      for (const branch of tree.slice(1)) gen(level+1,branch,sub)
      break
    case 'in':
    case 'out':
      console.error(tab(), tree[0])
      code['dir'] = tree[0]
      for (const branch of tree.slice(1)) gen(level+1,branch,code)
      break
    case 'match':
    case 'elem':
      console.error(tab(), tree[0])
      for (const branch of tree.slice(1)) gen(level+1,branch,code)
      break
    case 'eot':
      console.error(tab(), 'end')
      break
    default:
      console.error(tab(), 'unknown', tree[0])
  }
  return code
}

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
            maybe[code.chain.rel.bind] = rels.indexOf(rels[rid])
            const dir = code.chain.rel.dir == 'in' ? 'from' : 'to'
            chain(nodes[rels[rid][dir]], code.chain, maybe)
          }
        })
      } else {
        results.push(maybe)
      }
    }
  }
}
