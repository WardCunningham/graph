// pretty print grammar rules encoded in arrow functions
// deno run -allow.read pretty.js

const text = await Deno.readTextFile('./parse.js')
for (let line of text.split(/\n/)) {
  if(line.match(/^r\.\w+ = \(\) =>/)) {
    line = line.replace(/\(\) => /g,'')
    line = line.replace(/[rx]\./g,'')
    line = line.replace(/&& /g,'')
    line = line.replace(/\(\)/g,'')
    line = line.replace(/(ch|term)\(('.*?')\)/g,"$2")
    console.log(line)    
  }
}