// find and print test queries with two MATCH ops
// usage: deno run --allow-read find.js *.feature

for (const f of Deno.args) {
  console.log(f)
  const t = (await Deno.readTextFile(`./${f}`)).split(/\n/)
  let n = t.length
  while (t.length) {
    if (t.shift().endsWith('When executing query:')) {
      t.shift()
      const l = []
      while (t.length && !t[0].includes('"""')) {
        l.push(t.shift().trim())
      }
      const m = l.join(" ")
      if (m.match(/MATCH.*MATCH/))
        console.log(n - t.length - l.length + 1, m)
    }
  }
}