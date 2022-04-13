import { assertEquals, assertNotEquals } from "https://deno.land/std@0.126.0/testing/asserts.ts";
import {Graph} from '../src/graph.js';


let g = new Graph()
{
  let m1 = g.addNode('Employee',{name:'A. B. Boss'})
  let s1 = g.addNode('Options',{name:'Series B'}); g.addRel('Bonus',m1,s1,{shares:200,vesting:'2024-2-1'})
  let e1 = g.addNode('Employee',{name:'C. D. Programmer'}); g.addRel('Manager',e1,m1,{role:'Hiring'})
  let s2 = g.addNode('Options',{name:'Series C'}); g.addRel('Incentive',e1,s2,{shares:100,vesting:'2025-5-1'})
  let e2 = g.addNode('Employee',{name:'E. F. Consultant'}); g.addRel('Manager',e2,m1,{role:'Acting'})
}
console.log(g)

Deno.test("All Employees", () => {
  let names = g.n('Employee').props()
  let expect = ['A. B. Boss','C. D. Programmer','E. F. Consultant']
    assertEquals(names,expect);
})

Deno.test("All Managed Employees", () => {
  let names = g.n('Employee').o('Manager').t().props()
  let expect = ['A. B. Boss']
    assertEquals(names,expect);
})

Deno.test("All Manager Roles", () => {
  let roles = g.n('Employee').i('Manager').props('role')
  let expect = ['Acting','Hiring']
    assertEquals(roles,expect);
})

Deno.test("All Managers", () => {
  let roles = g.n('Employee').i('Manager').f().props()
  let expect = ['C. D. Programmer','E. F. Consultant']
    assertEquals(roles,expect);
})

Deno.test("Managers of Employees with Options", () => {
  let issues = g.n('Options')
    assertEquals(issues.props(), ['Series B','Series C'])
  let incentive = issues.i()
    assertEquals(incentive.types(),['Bonus','Incentive'])
    assertEquals(incentive.props('shares'),[100,200])
  let holders = incentive.f('Employee')
    assertEquals(holders.props(), ['A. B. Boss','C. D. Programmer'])
  let managers = holders.o('Manager').t()
    assertEquals(managers.props(),['A. B. Boss']);
})

Deno.test("Size of Set of Nodes or Rels", () => {
  assertEquals(g.n().size(), 5)
  assertEquals(g.n().i().size(), 4)
})

Deno.test("Tally of Set of Nodes or Rels", () => {
  assertEquals(g.n().tally(),{nodes: {Employee: 3, Options: 2}})
  assertEquals(g.n().i().tally(),{rels: {Bonus: 1, Incentive: 1, Manager: 2}})
})

Deno.test("All Nodes With B in Name", () => {
  let bees = g.n().filter((type,props) => props['name'].includes('B'))
    assertEquals(bees.props('name'), ['A. B. Boss','Series B'])
})

Deno.test("Map over Nodes With B in Name", () => {
  let bees = g.n().filter((type,props) => props['name'].includes('B'))
  let names = bees.map(node => node.props['name'])
    assertEquals(names, ['A. B. Boss','Series B'])
})

Deno.test("All Rels With A in Role", () => {
  let temps = g.n('Employee').i('Manager').filter((type,props) => props['role'].includes('A'))
    assertEquals(temps.props('role'),['Acting'])
})

Deno.test("Map over Rels With A in Role", () => {
  let temps = g.n('Employee').i('Manager').filter((type,props) => props['role'].includes('A'))
  let roles = temps.map(rel => rel.props['role'])
    assertEquals(roles,['Acting'])
})

