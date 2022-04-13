'use strict';

const uniq = (value, index, self) => self.indexOf(value) === index

export class Graph {
  constructor(nodes=[], rels=[]) {
    this.nodes = nodes;
    this.rels = rels;
  }

  addNode(type, props={}){
    let obj = {type, in:[], out:[], props};
    this.nodes.push(obj);
    return this.nodes.length-1;
  }

  addRel(type, from, to, props={}) {
    let obj = {type, from, to, props};
    this.rels.push(obj);
    let rid = this.rels.length-1;
    this.nodes[from].out.push(rid)
    this.nodes[to].in.push(rid);
    return rid;
  }

  tally(){
    const tally = list => list.reduce((s,e)=>{s[e.type] = s[e.type] ? s[e.type]+1 : 1; return s}, {});
    return { nodes:tally(this.nodes), rels:tally(this.rels)};
  }

  size(){
    return this.nodes.length + this.rels.length;
  }

  static load(obj) {
    // let obj = await fetch(url).then(res => res.json())
    return new Graph(obj.nodes, obj.rels)
  }

  static async fetch(url) {
    let obj = await fetch(url).then(res => res.json())
    return Graph.load(obj)
  }

  static async read(path) {
    let json = await Deno.readTextFile(path);
    let obj = JSON.parse(json);
    return Graph.load(obj)
  }

  // static async import(path) {
  //   let module = await import(path, {assert: {type: "json"}})
  //   return Graph.load(module.default)
  // }

  n(type=null, props={}) {
    let nids = Object.keys(this.nodes).map(key => +key)
    if (type) nids = nids.filter(nid => this.nodes[nid].type == type)
    for (let key in props) nids = nids.filter(nid => this.nodes[nid].props[key] == props[key])
    return new Nodes(this, nids)
  }
}

export class Nodes {
  constructor (graph, nids) {
    // console.log('Nodes',{graph:graph.size(),type,nids})
    this.graph = graph
    this.nids = nids
  }

  // n(type=null, props={}) {
  //   // console.log('Nodes.n',{type,props})
  //   let nids = this.nids
  //   if (type) nids = nids.filter(nid => this.nodes[nid].type == type)
  //   for (let key in props) nids = nids.filter(nid => this.nodes[nid].props[key] == props[key])
  //   return new Nodes(this.graph, type, nids)
  // }

  i(type=null, props={}) {
    // console.log('Nodes.i',{type,props})
    let rids = this.nids.map(nid => this.graph.nodes[nid].in).flat().filter(uniq)
    if (type) rids = rids.filter(rid => this.graph.rels[rid].type == type)
    for (let key in props) rids = rids.filter(rid => this.graph.rels[rid].props[key] == props[key])
    return new Rels(this.graph, rids)
  }

  o(type=null, props={}) {
    // console.log('Nodes.o',{type,props})
    let rids = this.nids.map(nid => this.graph.nodes[nid].out).flat().filter(uniq)
    if (type) rids = rids.filter(rid => this.graph.rels[rid].type == type)
    for (let key in props) rids = rids.filter(rid => this.graph.rels[rid].props[key] == props[key])
    return new Rels(this.graph, rids)
  }

  props(key='name') {
    // console.log('Nodes.p',{key})
    return this.nids.map(nid => this.graph.nodes[nid].props[key]).filter(uniq).sort()
  }

  types() {
    return this.nids.map(nid => this.graph.nodes[nid].type).filter(uniq).sort()
  }

  tally(){
    const tally = list => list.reduce((s,e)=>{s[e.type] = s[e.type] ? s[e.type]+1 : 1; return s}, {});
    return { nodes:tally(this.nids.map(nid => this.graph.nodes[nid]))};
  }

  size(){
    return this.nids.length
  }

  filter(f) {
    let nodes = this.graph.nodes
    let nids = this.nids.filter(nid => {
      let node = nodes[nid]
      return f(node.type,node.props)
    })
    return new Nodes(this.graph,nids)
  }

  map(f) {
    let nodes = this.graph.nodes
    let result = this.nids.map(nid => {
      let node = nodes[nid]
      return f(node)
    })
    return result
  }
}

export class Rels {
  constructor (graph, rids) {
    // console.log('Rels',{graph:graph.size(),type,rids})
    this.graph = graph
    this.rids = rids
  }

  f(type=null, props={}) {
    // console.log('Rels.f',{type,props})
    let nids = this.rids.map(rid => this.graph.rels[rid].from).filter(uniq)
    if (type) nids = nids.filter(nid => this.graph.nodes[nid].type == type)
    for (let key in props) nids = nids.filter(nid => this.graph.nodes[nid].props[key] == props[key])
    return new Nodes(this.graph, nids)
  }

  t(type=null, props={}) {
    // console.log('Rels.t',{type,props})
    let nids = this.rids.map(rid => this.graph.rels[rid].to).filter(uniq)
    if (type) nids = nids.filter(nid => this.graph.nodes[nid].type == type)
    for (let key in props) nids = nids.filter(nid => this.graph.nodes[nid].props[key] == props[key])
    return new Nodes(this.graph, nids)
  }

  props(key='name') {
    // console.log('Rels.p',{key})
    return this.rids.map(rid => this.graph.rels[rid].props[key]).filter(uniq).sort()
  }

  types() {
    return this.rids.map(rid => this.graph.rels[rid].type).filter(uniq).sort()
  }

  tally(){
    const tally = list => list.reduce((s,e)=>{s[e.type] = s[e.type] ? s[e.type]+1 : 1; return s}, {});
    return { rels:tally(this.rids.map(nid => this.graph.rels[nid]))};
  }

  size(){
    return this.rids.length
  }

  filter(f) {
    let rels = this.graph.rels
    let rids = this.rids.filter(rid => {
      let rel = rels[rid]
      return f(rel.type,rel.props)
    })
    return new Rels(this.graph,rids)
  }

  map(f) {
    let rels = this.graph.rels
    let result = this.rids.map(rid => {
      let rel = rels[rid]
      return f(rel)
    })
    return result
  }
}