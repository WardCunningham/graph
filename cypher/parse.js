// Recursive descent parser for OpenCypher subset
// Usage: import {parse} from './parse.js'; let result = parse(text)

let r = {}, x = {}               // rules defined and traced
let left = '', right = ''        // text parsed and pending
let branch = [], tree = branch   // abstract syntax tree

export function parse(text) {
  left = ''; right = text
  tree = branch = []
  const success = x.root()
  console.dir(tree, {depth:9})
  return success
}

// Non-Terminal Symbols

r.root = () => x.sp() && x.term('match') && x.node() && any(() => x.arrow() && x.node()) && x.eot()
r.node = () => x.ch('(') && x.elem() && x.ch(')')
r.arrow = () => one(() => x.left(), () => x.right())
r.left = () => x.term('<-') && x.ch('[') && x.elem() && x.ch(']') && x.ch('-')
r.right = () => x.ch('-') && x.ch('[') && x.elem() && x.ch(']') && x.term('->')
r.elem = () => x.bind() && x.ch(':') && x.type()
r.bind = () => x.word()
r.type = () => x.word()

// Terminal Symbols

r.word = () => match(/^[A-Za-z][A-Za-z0-9_]*/) && x.sp()
r.term = want => right.startsWith(want) && accept(want.length) && keep(want) && x.sp()
r.ch = char => right.startsWith(char) && accept(1) && keep(char) && x.sp()
r.sp = () => match(/^\s*/)
r.eot = () => !right.length

// Parse Instrumentation

const show = 'node,left,right,bind,type'.split(',')
for (const op in r) {
  x[op] = (...args) => {
    if(true || show.includes(op)) console.error(`${left}%c<${op}>%c${right}`,"color:red","color:black");
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

// rule zero or more times
function any (rule) {
  const save = [left,right]
  if (rule()) {
    rule()
  } else {
    [left,right] = save
  }
  return true
}

// first rule of many
function one (...rules) {
  const save = [left,right]
  for (const rule of rules) {
    if(rule()) return true
  }
  [left,right] = save
  false
}