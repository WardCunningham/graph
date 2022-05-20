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

const text = await Deno.readTextFile("./data/organization-chart.json")
const peeps = {}
const org = JSON.parse(text)
for (const peep of org) {
  peeps[peep.email] = addnode('Employee',peep)
}
for (const peep of org) {
  const peepid = peeps[peep.email]
  if(peep.manager) {
    const bossid = peeps[peep.manager]
    addrel('Manager',peepid,bossid)
  }
}


// Q U E R Y

const table = []
const folks = nodes.filter(node => node.props.name.includes('Flores'))
for (const employee of folks) {
  const out = employee.out[0] 
  const to = rels[out].to
  const boss = nodes[to]
  table.push({
    employee:employee.props.name,
    boss:boss.props.name
  })
}

console.table(table)
