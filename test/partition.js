 // Test the partition logic from the command line
 // Usage: clear; deno run --allow-net partition.js  

 import {Graph} from '../src/graph.js'
 const week = await fetch('http://ward.dojo.fed.wiki/assets/pages/identifying-distinct-activities/1272024.graph.json')
   .then(res => res.json())
   .then(json => Graph.load(json))
 const print = list => list.map((e,i) => `${i} => ${JSON.stringify(e)}`).join("\n")
 console.log(`${print(week.nodes)}\n\n${print(week.rels)}`,"\n")
 partitions(week)

 function partitions(input) {
   const output = [] // graphs
   let doing = {} // nid => new nid
   let todo = [...Array(input.nodes.length).keys()]
     .map(n => [n,Math.random()])
     .sort((a,b)=>a[1]-b[1])
     .map(v=>v[0])

   console.log('order todo',todo)
   while(todo.length) {
     const nid = todo.shift()
     if (nid in doing) {
       console.log('did',nid,'already')
       continue
     }
     const node = input.nodes[nid]
     const title = node.props.name.replaceAll("\n"," ")
     if (node.in.length + node.out.length) {
       console.log('doing',nid,title)
       output.unshift(new Graph())
       const done = input.copy(nid,output[0])
       todo = todo.filter(nid => !done.includes(nid))
       console.log(`${print(output[0].nodes)}\n\n${print(output[0].rels)}`,"\n")
     }
     else
       console.log('skipping',nid,title)
   }
   return output.reverse()
 }
