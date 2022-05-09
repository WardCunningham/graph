// Recursive descent parser for OpenCypher subset
// Usage: import {parse} from './parse.js'; let result = parse(text)

let left = '', right = ''  // text parsed and pending
let r = {}, x = {}         // rules defined and traced

export function parse(text) {
  left = ''; right = text
  return x.root()
}

r.root = () => x.term('match') && x.node()
r.node = () => x.ch('(') && x.bind() && x.ch(':') && x.type() && x.ch(')')
r.bind = () => x.word()
r.type = () => x.word()

r.word = () => x.first(/^[A-Za-z]/) && x.rest(/^[A-Za-z0-9_]/) && x.sp()
r.first = (regex) => regex.test(right) && x.more(1)
r.rest = (regex) => {while(regex.test(right)) x.more(1); return true}
r.term = want => right.startsWith(want) && x.more(want.length) && x.sp()
r.more = n => {left += right.substring(0,n); right = right.substring(n); return true}

r.ch = char => right.startsWith(char) && x.more(1) && x.sp()
r.sp = () => {while(right.match(/^\s/)) x.more(1); return true}

const show = 'term,node,bind,type'.split(',')
for (const op in r) {
  x[op] = (...args) => {
    if(show.includes(op)) console.error(`${left}%c<${op}>%c${right}`,"color:red","color:black");
    return r[op](...args)}
}

