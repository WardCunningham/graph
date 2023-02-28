// read named graph files that have been dropped by event

import {Graph} from 'https://wardcunningham.github.io/graph/graph.js'
const inst = ({nodes,rels}) => {return new Graph(nodes, rels)}

export async function drop (event,sufix) {
  const want = files(event).filter(file =>
    file.name.endsWith(sufix) &&
    file.type === 'application/json')
  const concepts = []
  for (const file of want) {
    const name = file.name.replace(sufix,'')
    const graph = await file.text()
      .then(text => JSON.parse(text))
      .then(inst)
    concepts.push({name, graph})
  }
  return concepts
}

export async function dropl (event,sufix) {
  const want = files(event).filter(file =>
    file.name.endsWith(sufix))
  const concepts = []
  for (const file of want) {
    const text = await file.text()
    text.trim().split(/\n/).forEach(line => {
      const {name,graph} = JSON.parse(line)
      concepts.push({name,graph:inst(graph)})
    })
  }
  return concepts
}

export async function dropu (event) {
  const want = strings(event)
  const concepts = []
  for (const file of want) {
    const filename = await file
    const name = filename.split(/\//).reverse()[0].split(/\./)[0]
    const graph = await fetch(filename)
      .then(res => res.json())
      .then(inst)
    concepts.push({name,graph})
  }
  return concepts
}

function files(event) {
  if (event.dataTransfer.items) {
    return [...event.dataTransfer.items]
      .filter(item => item.kind === 'file')
      .map(item => item.getAsFile())
  } else {
    return [...event.dataTransfer.files]
  }
}

function strings(event) {
  if (event.dataTransfer.items) {
    return [...event.dataTransfer.items]
      .filter(item => item.kind === 'string')
      .filter(item => item.type === 'text/uri-list')
      .map(item => {return new Promise(res => item.getAsString(res))})
  } else {
    return [...event.dataTransfer.files]
  }

}