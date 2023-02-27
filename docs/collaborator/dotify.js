// render graph as dot input to graphviz

export function dotify(complex) {
  const {graph, merged} = complex
  const tip = props => Object.entries(props).filter(e => e[1]).map(e => `${e[0]}: ${e[1]}`).join("\\n")

  const layout = graph.nodes
    .filter(node => node.type == 'Graphviz' && node.props.layout)
    .map(node => node.props.layout)
  const emphasis = graph.nodes
    .filter(node => node.type == 'Graphviz' && node.props.emphasis)
    .map(node => node.props.emphasis)
    ?.reverse()[0] || {}
  console.log('dotify',emphasis)

  const nodes = graph.nodes.map((node,id) => {
    const icon = node.props.url ? " 🔗" : node.props.tick ? " ☐" : ""
    const label = `${node.type}\\n${node.props.name}${icon}`
    const color = emphasis[node.type] || ''
    return `${id} [label="${label}" ${color} ${(node.props.url||node.props.tick)?`URL="${node.props.url||'#'}" target="_blank"`:''} tooltip="${tip(node.props)}"]`
  })
  const edges = graph.rels.map(rel => {
    const color = emphasis[rel.type] || ''
    return `${rel.from}->${rel.to} [label="${rel.type}" ${color} labeltooltip="${tip(rel.props)}"]`
  })
  return [
    'digraph {',
    'overlap = false; splines=true',
    `layout = ${layout.reverse()[0]||'dot'};`,
    'node [shape=box style=filled fillcolor=gold]',
    ...merged.nids,
    'node [fillcolor=palegreen]',
    ...nodes,
    ...edges,
    '}'].join("\n")
}