
export function parse(text, log=()=>{}) {
  const r = {}, x = {}               // rules defined and traced
  let left = '', right = text      // text parsed and pending
  let branch = []                  // abstract syntax tree in progress
  const tree = [branch]

  // Non-Terminal Symbols

  r.match = () => x.sp() && x.term('match') && x.node() && x.chain() && x.eot()
  r.node = () => x.ch('(') && x.elem()  && x.ch(')')
  r.chain = () => any(() => x.rel() && x.node() && x.chain())
  r.rel = () => one(() => x.in(), () => x.out(), () => x.both())
  r.in = () => x.term('<-') && opt(() => x.ch('[') && x.elem() && x.ch(']')) && x.ch('-')
  r.out = () => x.ch('-') && opt(() => x.ch('[') && x.elem() && x.ch(']')) && x.term('->')
  r.both = () => x.ch('-') && opt(() => x.ch('[') && x.elem() && x.ch(']')) && x.ch('-')
  r.elem = () => opt(() => x.bind()) && opt(() => x.ch(':') && x.type()) && opt(() => x.prop())
  r.prop = () => x.ch('{') && x.word() && x.ch(':')  && x.expr() && x.ch('}')
  r.expr = () => x.strn()
  r.bind = () => x.word()
  r.type = () => x.word()

  // Terminal Symbols

  r.word = () => match(/^[A-Za-z][A-Za-z0-9_]*/) && x.sp()
  r.term = want => right.startsWith(want) && accept(want.length) && keep(want) && x.sp()
  r.strn = () => x.ch('"') && match(/^[^"]{0,20}/) && x.ch('"') && x.sp()
  r.ch = char => right.startsWith(char) && accept(1) && keep(char) && x.sp()
  r.sp = () => match(/^\s*/)
  r.eot = () => !right.length

  // Parse Instrumentation

  for (const op in r) {
    x[op] = (...args) => {
      log(`${left}%c${op}%c${right}`,"color:red","color:black");
      const here = branch
      branch = [op]
      const success = r[op](...args)
      if (success) here.push(branch)
      branch = here
      return success
    }
  }

  // Parser State Updates

  function match(regex) {
    const m = right.match(regex)
    m && accept(m[0].length) && keep(m[0])
    return !!m
  }

  function keep(text) {
    branch.push(text)
    return true
  }

  function accept(n) {
    left += right.substring(0,n)
    right = right.substring(n)
    return true
  }

  // Backtracking Operators

  function any (rule) { // rule zero or more times
    const save = [left,right]
    if (rule()) {
      any(rule)
    } else {
      [left,right] = save
    }
    return true
  }

  function opt (rule) { // rule zero or one times
    const save = [left,right]
    if (!rule()) {
      [left,right] = save
    }
    return true
  }

  function one (...rules) { // first rule of many
    const save = [left,right]
    for (const rule of rules) {
      if(rule()) {return true}
      [left,right] = save
    }
    false
  }

  x.match()
  return tree
}

export function gen(level, tree, code, log=()=>{}) {
  const tab = () => ' |'.repeat(level)
  switch (tree[0]) {
    case 'sp':
    case 'ch':
    case 'term':
      break
    case 'bind':
    case 'type':
      log(tab(), tree[0], `"${tree[1][1]}"`)
      code[tree[0]] = tree[1][1]
      break
    case 'prop':
      log(tab(), tree[0], `"${tree[2][1]}"`, tree[4][1][2])
      code[tree[0]] = [tree[2][1], tree[4][1][2]]
      break
    case 'node':
    case 'rel':
    case 'chain': 
      log(tab(), tree[0])
      {const sub = {}
      code[tree[0]] = sub
      for (const branch of tree.slice(1)) gen(level+1,branch,sub,log)}
      break
    case 'in':
    case 'out':
    case 'both':
      log(tab(), tree[0])
      code['dir'] = tree[0]
      for (const branch of tree.slice(1)) gen(level+1,branch,code,log)
      break
    case 'match':
    case 'elem':
      log(tab(), tree[0])
      for (const branch of tree.slice(1)) gen(level+1,branch,code,log)
      break
    case 'eot':
      log(tab(), 'end')
      break
    default:
      log(tab(), 'unknown', tree[0])
  }
  return code
}

export function check(tally, code, errors) {
  if(code?.node?.type && errors) {
    if(!tally.nodes[code.node.type]) {
      errors.push(`No node of type "${code.node.type}" in the graph.`)
    }
  }
  if(code?.rel?.type && errors) {
    if(!tally.rels[code.rel.type]) {
      errors.push(`No relation of type "${code.rel.type}" in the graph.`)
    }
  }
  if(Object.keys(code.chain).length) {
    check(tally,code.chain, errors)
  }

}

export function apply(graph, code) {
  const nodes = graph.nodes
  const rels = graph.rels
  const results = []
  for (const node of nodes) {
    chain(node, code, {})
  }
  return results

  function chain(node, code, maybe) {
    if ((!code.node.type || node.type == code.node.type) &&
        (!code.node.prop || node.props[code.node.prop[0]] == code.node.prop[1])) {
      if (code.node.bind)
        maybe[code.node.bind] = node
      if (code.chain.rel) {
        if (['in','both'].includes(code.chain.rel.dir))
          links(node.in, 'from')
        if (['out','both'].includes(code.chain.rel.dir))
          links(node.out, 'to')
      } else {
        results.push(maybe)
      }
    }

    function links(rids, dir) {
      rids.forEach(rid => {
        if ((!code.chain.rel.type || rels[rid].type == code.chain.rel.type) &&
           (!code.chain.rel.prop || rels[rid].props[code.chain.rel.prop[0]] == code.chain.rel.prop[1])) {
          maybe = {...maybe}
          if (code.chain.rel.bind)
            maybe[code.chain.rel.bind] = rels[rid]
          chain(nodes[rels[rid][dir]], code.chain, maybe)
        }
      })
    }
  }
}

