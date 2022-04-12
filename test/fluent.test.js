import { assertEquals, assertNotEquals } from "https://deno.land/std@0.126.0/testing/asserts.ts";
import {Graph} from '../src/graph.js';


let r = new Graph()
{
  let m1 = r.addNode('Employee',{name:'A. B. Boss'})
  let s1 = r.addNode('Options',{name:'Series B'}); r.addRel('Bonus',m1,s1,{shares:200,vesting:'2024-2-1'})
  let e1 = r.addNode('Employee',{name:'C. D. Programmer'}); r.addRel('Manager',e1,m1,{role:'Hiring'})
  let s2 = r.addNode('Options',{name:'Series C'}); r.addRel('Incentive',e1,s2,{shares:100,vesting:'2025-5-1'})
  let e2 = r.addNode('Employee',{name:'E. F. Consultant'}); r.addRel('Manager',e2,m1,{role:'Acting'})
}
console.log(r)

Deno.test("All Employees", () => {
  let names = r.n('Employee').props()
  let expect = ['A. B. Boss','C. D. Programmer','E. F. Consultant']
    assertEquals(names,expect);
})

Deno.test("All Managed Employees", () => {
  let names = r.n('Employee').o('Manager').t().props()
  let expect = ['A. B. Boss']
    assertEquals(names,expect);
})

Deno.test("All Manager Roles", () => {
  let roles = r.n('Employee').i('Manager').props('role')
  let expect = ['Acting','Hiring']
    assertEquals(roles,expect);
})

Deno.test("All Managers", () => {
  let roles = r.n('Employee').i('Manager').f().props()
  let expect = ['C. D. Programmer','E. F. Consultant']
    assertEquals(roles,expect);
})

Deno.test("Managers of Employees with Options", () => {
  let issues = r.n('Options')
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
  assertEquals(r.n().size(), 5)
  assertEquals(r.n().i().size(), 4)
})

Deno.test("Tally of Set of Nodes or Rels", () => {
  assertEquals(r.n().tally(),{nodes: {Employee: 3, Options: 2}})
  assertEquals(r.n().i().tally(),{rels: {Bonus: 1, Incentive: 1, Manager: 2}})
})

Deno.test("All Nodes With B in Name", () => {
  let bees = r.n().filter((type,props) => props['name'].includes('B'))
    assertEquals(bees.props('name'), ['A. B. Boss','Series B'])
})

Deno.test("Map over Nodes With B in Name", () => {
  let bees = r.n().filter((type,props) => props['name'].includes('B'))
  let names = bees.map(node => node.props['name'])
    assertEquals(names, ['A. B. Boss','Series B'])
})

Deno.test("All Rels With A in Role", () => {
  let temps = r.n('Employee').i('Manager').filter((type,props) => props['role'].includes('A'))
    assertEquals(temps.props('role'),['Acting'])
})

Deno.test("Map over Rels With A in Role", () => {
  let temps = r.n('Employee').i('Manager').filter((type,props) => props['role'].includes('A'))
  let roles = temps.map(rel => rel.props['role'])
    assertEquals(roles,['Acting'])
})

