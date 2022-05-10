# Cypher Query
We experiment with recursive descent parsing espressed as a hash of arrow functions.
Our emphasis will be on using pure javascript coded in the most direct and maintainable way.
We have considerable latatude in performance in that we will rarely parse anything more than a few hundred lines.

Initial results described here: https://github.com/WardCunningham/graph/pull/15

## Grammar Construction
We have written a parser as a series of mutually recursive functions as one might have done in the '70s before excellent parser-generators became wide spread. We reach back because we have only short texts to parse and we want to do so taking on few, or better, no dependencies. Features of the modern environment, especially ES6 in the browser and on the server leads us into features of this language.

A parser can return a variety of results depending on what happens as each function completes. So far we are content with a simple boolean, did or did not the input meet the expectations of the parser. The parser itself uses this signal to guide the parse through alternatives that are permitted in the language we parse.

We write rules as a sequence of function calls, connected by && operators, that will continue so long as every function returns true. For example, this rule will match the parentheses surrounding the elemental part of a node match.
```
ch('(') && elem() && ch(')')
```
Here the `ch` function matches a specific charater, called a terminal in parsing venacular, while the `elem` is a non-terminal that matches a reused part of Cypher syntax.

We write rules as ES6 arrow functions which we collect in an object initalised as `const r = {}`. We will see r (or it's shadow, x) strewn throught or javascript parsing code.
```
r.node = () => x.ch('(') && x.elem() && x.ch(')')
```
We support grammar developent with traces of the parser working (where x for execute appears) and with a pretty printer that erases most of this additional notation so we can see the recursive structure of the rules in their own crystaline beauty.


## Tracing the Runnning Parser
We have demonstrated we can extract more informaton by wrapping every function with some data collection. So far this is just enough to sow the progress of the parse through sample text. Consider this Cypher query:
```
match (e:Employee)-[r:Manager]->(m:Employee)
```
This transcript shows the parser unning by showing the names of key functions (red) as they are about to parse the text to their right.

![parse trace](https://user-images.githubusercontent.com/12127/167546955-c43ebdd7-1484-4832-bb25-7009e25ba435.png)

You can see two places where the parser tries to match a relation, first looking for one pointing left, then backing up to try again pointing right. In the first case the right-pointing relation is found so parsing continues. In the second case neither alternative is found as the parser is bumping up against the end of text which is also an acceptable parse so the parser responds: true.

## Backtracking Functions
In some cases we need to step outside the sequential evaluation of parsing functions represented by long strings connected with the && operators. For this we use axiliary functions that take arrow functions as their arguments. This lets us save the parsing state, try a function, and optioinally backup and try another.

For example the `any` function (often represented as * in other grammars) is useful for parsing lists separated by some connecting symbol. In Cypher this occures as we chain through nodes connected by relations. A more common case in parsing would be a comma separated list of words.
```
one, two, three
```
We could match this with the `any` function as follows.
```
word() && any(() => ch(',') && word())
```
Similarly the `one` function tries evaluating each of its arguments (all arrow parsing functions) until it finds one that matches. If none match, the `one` function fails.

Both `any` and `one` functions effect backtracking by saving the parser state: the `left` and `right` strings that represnt the parsed and unparsed input. We use idiomatic ES6 to save and restore this state.
```
const save = [left,right]
```
```
[left,right] = save
```
## Pretty Printed Grammar
We estimate that we might be a quarter of the way through defining parsing rules for the Cypher subset we require. As we get further along we will find all of our functional annotations interferring with our ability to see how we are progressing. We pretty-print our source code by erassing most of the annotations we have been adding.

At the time of this writing we have at least one example of everything we expect to need to compleate our parse. The non-terminal portion of the grammar is as follows. Recall the source from [github](https://github.com/WardCunningham/graph/blob/755c7a536a6b11c12038eedd8aa953db52fcb2ef/cypher/parse.js#L11-L20).
```
root = 'match' node any(arrow node) eot
node = '(' elem ')'
arrow = one(left, right)
left = '<-[' elem ']-'
right = '-[' elem ']->'
elem = bind ':' type
bind = word
type = word
```
Note that we have one each of `any` and `one` axiliary functions.
