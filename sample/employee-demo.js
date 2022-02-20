// build and query sample org chart
// usage: deno run --allow-read employee-demo.js

import {nodes, rels, addnode, addrel} from '../src/model.js'

console.log({nodes,rels})

 // {
 //    "name": "H. R. Collins",
 //    "email": "hrcollins@email.com",
 //    "manager": "erlee@email.com",
 //    "start": "2002-10-11"
 //  },

// B U I L D

let text = await Deno.readTextFile("./data/organization-chart.json")
let peeps = {}
let org = JSON.parse(text)
for (let peep of org) {
  peeps[peep.email] = addnode('Employee',peep)
}
for (let peep of org) {
  let peepid = peeps[peep.email]
  if(peep.manager) {
    let bossid = peeps[peep.manager]
    addrel('Manager',peepid,bossid)
  }
}


// Q U E R Y

let table = []
let folks = nodes.filter(node => node.props.name.includes('Flores'))
for (let employee of folks) {
  let out = employee.out[0] 
  let to = rels[out].to
  let boss = nodes[to]
  table.push({
    employee:employee.props.name,
    boss:boss.props.name
  })
}

console.table(table)
