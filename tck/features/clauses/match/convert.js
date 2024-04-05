// find and count kinds of test case vocabulary 
// usage: deno run --allow-read convert.js *.feature


for (const f of Deno.args) {
  const counts = {file: f}
  const count = type => {counts[type] = counts[type] || 0; counts[type]++}
  const t = (await Deno.readTextFile(`./${f}`)).split(/\n/)
  const upto = end => {const l = t.shift(); if(!l.match(end)) upto(end)}

  let n = t.length
  while (t.length) {
    let l = t.shift()
    if (l.match(/^ *#/)) count('#')
    else if (l.match(/^$/)) count('Blank')
    else if (l.match(/^Feature:/)) count('Feature')
    else if (l.match(/^  Scenario:/)) count('Scenario')
    else if (l.match(/^  Scenario Outline:/)) count('Outline')
    else if (l.match(/^    Examples:/)) count('Examples')
    else if (l.match(/^      """/)) {count('"""'); upto(/"""/)}
    else if (l.match(/^      \| /)) count('|')
    else if (l.match(/^    Given /)) count('Given')
    else if (l.match(/^    And /)) count('And')
    else if (l.match(/^    When /)) count('When')
    else if (l.match(/^    Then /)) count('Then')
    else if (l.match(/^  @skipGrammarCheck/)) count('Skip')
    else if (l.match(/^  Background:/)) count('Background')
    else count(`More ${l.split(/ +/)[1]}`) // expect no more to match
  }

  console.error(counts)
}

