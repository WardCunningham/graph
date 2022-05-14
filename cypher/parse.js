// Recursive descent parser for OpenCypher subset
// Usage: import {parse} from './parse.js'; let result = parse(text)

let r = {}, x = {}               // rules defined and traced
let left = '', right = ''        // text parsed and pending
let branch = []                  // abstract syntax tree in progress

export const tree = branch

export function parse(text) {
  left = ''; right = text
  branch = []
  tree.splice(0, tree.length, branch)
  const success = x.match()
  // console.dir(tree, {depth:15})
  return success
}

// Non-Terminal Symbols

r.match = () => x.sp() && x.term('match') && x.node() && x.chain() && x.eot()
r.node = () => x.ch('(') && x.elem()  && x.ch(')')
r.chain = () => any(() => x.rel() && x.node() && x.chain())
r.rel = () => one(() => x.in(), () => x.out(), () => x.both())
r.in = () => x.term('<-') && x.ch('[') && x.elem() && x.ch(']') && x.ch('-')
r.out = () => x.ch('-') && x.ch('[') && x.elem() && x.ch(']') && x.term('->')
r.both = () => x.ch('-') && x.ch('[') && x.elem() && x.ch(']') && x.ch('-')
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

const show = 'node,rel,bind,type,prop,expr'.split(',')
for (const op in r) {
  x[op] = (...args) => {
    if(show.includes(op)) console.error(`${left}%c<${op}>%c${right}`,"color:red","color:black");
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
    any(rule)
  } else {
    [left,right] = save
  }
  return true
}

// rule zero or one times
function opt (rule) {
  const save = [left,right]
  if (!rule()) {
    [left,right] = save
  }
  return true
}

// first rule of many
function one (...rules) {
  const save = [left,right]
  for (const rule of rules) {
    if(rule()) {return true}
    [left,right] = save
  }
  false
}