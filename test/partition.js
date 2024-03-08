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
   const checkpoint = () => {
     console.log(output
       .map(graph => `${print(graph.nodes)}\n\n${print(graph.rels)}`)
       .join("\n\n")+"\n"+('-'.repeat(60)))
   }
   const nodes = input.nodes
   const rels = input.rels
   const todo = [...Array(nodes.length).keys()]
     .map(n => [n,Math.random()])
     .sort((a,b)=>a[1]-b[1])
     .map(v=>v[0])

   const copy = nid => {
     if(nid in doing) {
       console.log('copied before', nid, 'doing', doing)
       return}
     console.log('copy start', nid, 'doing', doing)
     todo.splice(todo.indexOf(nid),1)
     const node = nodes[nid]
     doing[nid] = output[0].addNode(node.type,node.props)
     for (const rid of node.out) copy(rels[rid].to)
     for (const rid of node.in) copy(rels[rid].from)
     console.log('linking',nid,'to',node.out.map(rid => rels[rid].to))
     for (const rid of node.out) output[0].addRel('',doing[nid],doing[rels[rid].to],{})
     checkpoint()
   }

   console.log('order todo',todo)
   while(todo.length) {
     const nid = todo.shift()
     if (nid in doing) {
       console.log('did',nid,'already')
       continue
     }
     const node = nodes[nid]
     const title = node.props.name.replaceAll("\n"," ")
     if (node.in.length + node.out.length) {
       console.log('doing',nid,title)
       output.unshift(new Graph())
       doing = {}
       copy(nid)     
     }
     else
       console.log('skipping',nid,title)
   }
   return output.reverse()
 }
