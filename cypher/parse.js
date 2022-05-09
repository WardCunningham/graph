// Recursive descent parser for OpenCypher subset
// Usage: import {parse} from './parse.js'; let result = parse(text)

let left = '', right = ''  // text parsed and pending
let r = {}, x = {}         // rules defined and traced

export function parse(text) {
  left = ''; right = text
  return x.root()
}

r.root = () => x.term('match') && x.node() && any(() => x.arrow() && x.node()) && x.eot()
r.node = () => x.ch('(') && x.elem() && x.ch(')')
r.arrow = () => one(() => x.left(), () => x.right())
r.left = () => x.term('<-[') && x.elem() && x.term(']-')
r.right = () => x.term('-[') && x.elem() && x.term(']->')
r.elem = () => x.bind() && x.ch(':') && x.type()
r.bind = () => x.word()
r.type = () => x.word()

r.word = () => x.first(/^[A-Za-z]/) && x.rest(/^[A-Za-z0-9_]/) && x.sp()
r.first = (regex) => regex.test(right) && x.more(1)
r.rest = (regex) => {while(regex.test(right)) x.more(1); return true}
r.term = want => right.startsWith(want) && x.more(want.length) && x.sp()
r.more = n => {left += right.substring(0,n); right = right.substring(n); return true}

r.ch = char => right.startsWith(char) && x.more(1) && x.sp()
r.sp = () => {while(right.match(/^\s/)) x.more(1); return true}
r.eot = () => !right.length

const show = 'node,left,right,bind,type'.split(',')
for (const op in r) {
  x[op] = (...args) => {
    if(show.includes(op)) console.error(`${left}%c<${op}>%c${right}`,"color:red","color:black");
    return r[op](...args)}
}

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