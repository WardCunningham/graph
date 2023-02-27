// aggregate multiple graphs into a single graph

import {Graph} from 'https://wardcunningham.github.io/graph/graph.js'

const uniq = (value, index, self) => self.indexOf(value) === index

export function composite(concepts) {
  const merged = {nids:[]}
  const comp = new Graph()
  for (const concept of concepts) {
    const {name,graph} = concept
    merge(comp,graph,name)
  }
  return {graph:comp, merged}


  function merge(comp,incr,source) {

    function mergeprops(into,from) {
      const keys = Object.keys(into)
        .concat(Object.keys(from))
        .filter(uniq)
      for (const key of keys) {
        if (into[key]) {
          // if (from[key] && into[key] != from[key]) {
          //   window.result.innerHTML +=
          //     `<div style="font-size:small; padding:4px; background-color:#fee; border-radius:4px; border:1px solid #aaa;">
          //       conflict for "${key}" property<br>
          //       choosing "${into[key]}" over "${from[key]}"</div>`
          // }
        }
        else {
          if(from[key]) {
            into[key] = from[key]
          }
        }
      }
    }

    const nids = {}  // incr => comp
    incr.nodes.forEach((node,id) => {
      const match = comp.nodes.find(each =>
        each.type == node.type &&
        each.props.name == node.props.name)
      if(match) {
        // window.result.innerHTML += `Same <b>${match.type}</b> ${match.props.name}<br>`
        nids[id] = comp.nodes.findIndex(node => node === match)
        merged.nids.push(nids[id])
        mergeprops(match.props, node.props)
      } else {
        nids[id] = comp.addNode(node.type,node.props)
      }
    })
    incr.rels.forEach(rel => {
      const match = comp.rels.find(each =>
        each.type == rel.type &&
        each.from == nids[rel.from] &&
        each.to == nids[rel.to]
      )
      if(match) {
        // window.result.innerHTML += `Same
        //   <b>${comp.nodes[match.from].type}</b> ${comp.nodes[match.from].props.name}
        //   <b>${match.type}</b> ▷
        //   ${comp.nodes[match.to].type} ${comp.nodes[match.to].props.name}<br>`
        mergeprops(match.props, rel.props)
      } else {
        rel.props.source = source
        comp.addRel(rel.type, nids[rel.from], nids[rel.to], rel.props)
      }
    })
  }
}
