'use strict';

import * as cypher from './cypher.js'

const uniq = (value, index, self) => self.indexOf(value) === index

export class Graph {
  constructor(nodes=[], rels=[]) {
    this.nodes = nodes;
    this.rels = rels;
  }

  addNode(type, props={}){
    const obj = {type, in:[], out:[], props};
    this.nodes.push(obj);
    return this.nodes.length-1;
  }

  addRel(type, from, to, props={}) {
    const obj = {type, from, to, props};
    this.rels.push(obj);
    const rid = this.rels.length-1;
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
    const obj = await fetch(url).then(res => res.json())
    return Graph.load(obj)
  }

  static async read(path) {
    const json = await Deno.readTextFile(path);
    const obj = JSON.parse(json);
    return Graph.load(obj)
  }

  // static async import(path) {
  //   let module = await import(path, {assert: {type: "json"}})
  //   return Graph.load(module.default)
  // }

  n(type=null, props={}) {
    let nids = Object.keys(this.nodes).map(key => +key)
    if (type) nids = nids.filter(nid => this.nodes[nid].type == type)
    for (const key in props) nids = nids.filter(nid => this.nodes[nid].props[key] == props[key])
    return new Nodes(this, nids)
  }

  /**
   * Converts a graph to a JavaScript Object Notation (JSON) string using JSON.stringify.
   @param - replacer A function that transforms the results.
   @param - space Adds indentation, white space, and line break characters to the return-
   * @returns {string} JSON string containing serialized graph
  */
  stringify(...args) {
    const obj = { nodes: this.nodes, rels: this.rels }
    return JSON.stringify(obj, ...args)
  }


  search (query, opt={}) {
    const tree = cypher.parse(query)
    // console.dir(tree, {depth:15})
    const code = cypher.gen(0,tree[0][0],{})
    // console.log(code)
    cypher.check(this.tally(),code,opt.errors)
    return cypher.apply(this, code)
  }

}






// Fluent Interface (deprecated?)

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
    for (const key in props) rids = rids.filter(rid => this.graph.rels[rid].props[key] == props[key])
    return new Rels(this.graph, rids)
  }

  o(type=null, props={}) {
    // console.log('Nodes.o',{type,props})
    let rids = this.nids.map(nid => this.graph.nodes[nid].out).flat().filter(uniq)
    if (type) rids = rids.filter(rid => this.graph.rels[rid].type == type)
    for (const key in props) rids = rids.filter(rid => this.graph.rels[rid].props[key] == props[key])
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
    const nodes = this.graph.nodes
    const nids = this.nids.filter(nid => {
      const node = nodes[nid]
      return f(node.type,node.props)
    })
    return new Nodes(this.graph,nids)
  }

  map(f) {
    const nodes = this.graph.nodes
    const result = this.nids.map(nid => {
      const node = nodes[nid]
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
    for (const key in props) nids = nids.filter(nid => this.graph.nodes[nid].props[key] == props[key])
    return new Nodes(this.graph, nids)
  }

  t(type=null, props={}) {
    // console.log('Rels.t',{type,props})
    let nids = this.rids.map(rid => this.graph.rels[rid].to).filter(uniq)
    if (type) nids = nids.filter(nid => this.graph.nodes[nid].type == type)
    for (const key in props) nids = nids.filter(nid => this.graph.nodes[nid].props[key] == props[key])
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
    const rels = this.graph.rels
    const rids = this.rids.filter(rid => {
      const rel = rels[rid]
      return f(rel.type,rel.props)
    })
    return new Rels(this.graph,rids)
  }

  map(f) {
    const rels = this.graph.rels
    const result = this.rids.map(rid => {
      const rel = rels[rid]
      return f(rel)
    })
    return result
  }
}