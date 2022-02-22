'use strict';

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

  static async import(path) {
    let module = await import(path, {assert: {type: "json"}})
    return Graph.load(module.default)
  }

}