'use strict';

  export let nodes = []
  export let rels = []

  export function addnode(type, props) {
    const obj = {type, in:[], out:[], props}
    nodes.push(obj)
    return nodes.length-1
  }

  export function addrel(type, from, to, props={}) {
    const obj = {type, from, to, props}
    rels.push(obj)
    const rid = rels.length-1
    nodes[from].out.push(rid)
    nodes[to].in.push(rid)
    return rid
  }

  export function removeModel() {
    nodes = []; rels = [];
  }
