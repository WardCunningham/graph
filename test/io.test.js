import { assertEquals, assertNotEquals } from "https://deno.land/std@0.126.0/testing/asserts.ts";
import {Graph} from '../src/graph.js';

{
  // test that assertEquals looks deep into our objects

  const a = new Graph()
  a.addNode('Alpha',{count:3})

  const b = new Graph()
  b.addNode('Alpha',{count:4})

  Deno.test("Same Size", () => {
    assertEquals(a.size(),b.size());
  });

  Deno.test("Same Tally", () => {
    assertEquals(a.tally(),b.tally());
  });

  Deno.test("Same Props", () => {
    assertNotEquals(a.nodes[0].props,b.nodes[0].props);
  });

  Deno.test("Same Node", () => {
    assertNotEquals(a.nodes[0],b.nodes[0]);
  });

  Deno.test("Same Nodes", () => {
    assertNotEquals(a.nodes,b.nodes);
  });

  Deno.test("Same Graph", () => {
    assertNotEquals(a, b);
  });

  Deno.test("Field Order", () => {
    assertEquals({a:3, b:4}, {b:4, a:3})
  })
}

{
  // mock data from wiki
  // http://ward.dojo.fed.wiki/transform-to-nodes-and-rels.html
  // https://deno.com/blog/v1.17#import-assertions-and-json-modules

  const url = 'http://ward.dojo.fed.wiki/assets/pages/mock-graph-data/graphs/graph.json'
  const tally =
    {
      nodes: {
        Employee: 136,
        Project: 24,
        Service: 119,
        Statistic: 238
      },
      rels: {
        Manager: 159,
        Owner: 119,
        Team: 476,
        Flow: 56,
        Traffic: 238
      }
    }

  Deno.test("Load from Object", async () => {
    const obj = await fetch(url).then(res => res.json())
    const g = Graph.load(obj)
    assertEquals(g.tally(), tally)
  })

  Deno.test("Fetch from URL", async () => {
    const g = await Graph.fetch(url)
    assertEquals(g.tally(), tally)
  })

  Deno.test("Read from Path", async () => {
    // note: path relative to current working directory
    const path = './sample/data/mock-graph.json'
    const g = await Graph.read(path)
    assertEquals(g.tally(), tally)
  })

  // Deno.test("Import from Path", async () => {
  //   // note: path relative to executable as with other imports
  //   let path = '../sample/data/mock-graph.json'
  //   let g = await Graph.import(path)
  //   assertEquals(g.tally(), tally)
  // })
}

