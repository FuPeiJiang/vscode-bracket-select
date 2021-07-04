import {parse} from '@typescript-eslint/typescript-estree'
function d(...text: (any)[]) {
  console.debug(...text)
}
export default (toParse: string): [string,number,number][] => {
  const everything: [string,number,number][] = []

  const tempArr = []
  let tempIdx = -1
  let node: any = parse(toParse,{range:true})

  let subNode

  let c1,e1,e2,c2
  // if (c1 !== e1 && e2 !== c2) {

  outer:
  while (true) {
    switch (node.type as string) {
    case 'Program':
      // body: nodes[]
      // d(node)
      subNode = node.body
      tempIdx += subNode.length
      for (let i = subNode.length - 1; i > -1; i--) {
        tempArr.push(subNode[i])
      }
      break
    case 'LabeledStatement':
      tempArr.push(node.body)
      tempIdx++
      break
    case 'ImportDeclaration':
      tempArr.push(node.source)
      tempIdx++

      subNode = node.specifiers
      for (let i = subNode.length - 1; i > -1; i--) {
        if (subNode[i].type === 'ImportSpecifier') {
          //remember, this is reversed iteration
          const e2 = subNode[i].range[1]
          let e1
          for (let n = 0,len = subNode.length; n < len; n++) {
            if (subNode[n].type === 'ImportSpecifier') {
              e1 = subNode[n].range[0]
              break
            }
          }
          everything.push(['ImportSpecifier',
            toParse.lastIndexOf('{',e1 - 1),
            toParse.indexOf('}',e2) + 1])
          break
        }
      }
      break
    case 'ExportNamedDeclaration':
      tempIdx++
      tempArr.push(node.declaration)
      break
    case 'SequenceExpression':
      subNode = node.expressions
      tempIdx += subNode.length
      for (let i = subNode.length - 1; i > -1; i--) {
        tempArr.push(subNode[i])
      }
      break
    case 'VariableDeclaration':
      subNode = node.declarations
      tempIdx += subNode.length
      for (let i = subNode.length - 1; i > -1; i--) {
        tempArr.push(subNode[i])
      }
      break
    case 'VariableDeclarator': //Declarat{or|ion}
      if (node.init) {
        tempArr.push(node.init)
        tempIdx++
      }
      tempArr.push(node.id)
      tempIdx++
      break
    case 'ObjectPattern': //let { a, b } = { a: 10, b: 20 }
      everything.push(['ObjectPattern',node.range[0],node.range[1]])
      subNode = node.properties
      tempIdx += subNode.length
      for (let i = subNode.length - 1; i > -1; i--) {
        tempArr.push(subNode[i])
      }
      break
    case 'ArrayPattern': //let [a, b] = [10, 20]
      everything.push(['ArrayPattern',node.range[0],node.range[1]])
      subNode = node.elements
      tempIdx += subNode.length
      for (let i = subNode.length - 1; i > -1; i--) {
        tempArr.push(subNode[i])
      }
      break
      elements
    case 'ExpressionStatement': //check if expressionStatement itself it wrapped in parentheses
      // d(node)
      subNode = node.expression

      c1 = node.range[0],e1 = subNode.range[0]
      ,e2 = subNode.range[1],c2 = node.range[1]
      if (c1 !== e1 && e2 !== c2) {
        nextParen:
        for (; c1 < e1; c1++) {
          if (toParse[c1] === '(') {
            while (c2-- > e2) { //3rd of for is only executed after 1st time, //bruh, just use while loop
              if (toParse[c2] === ')') {
                everything.push(['ParenthesizedExpression',c1,c2 + 1])
                continue nextParen
              }
            }
            break nextParen
          }
        }
      }
      // ParenthesizedExpression
      subNode = node.expression
      tempIdx += 1
      tempArr.push(subNode)
      break
    case 'BinaryExpression': //check if either left right is wrapped in parentheses
      // d(node)

      subNode = node.left
      const operatorIndex = toParse.indexOf(node.operator,subNode.range[1])
      // d(2342343)
      // d(toParse[subNode.range[1]]) //lands on the +
      c1 = node.range[0],e1 = subNode.range[0]
      ,e2 = subNode.range[1],c2 = operatorIndex
      if (c1 !== e1 && e2 !== c2) {
        nextParen:
        for (; c1 < e1; c1++) {
          if (toParse[c1] === '(') {
            while (c2-- > e2) { //3rd of for is only executed after 1st time, //bruh, just use while loop
              if (toParse[c2] === ')') {
                everything.push(['ParenthesizedExpression',c1,c2 + 1])
                continue nextParen
              }
            }
            break nextParen
          }
        }
      }
      //do the !==
      subNode = node.right
      c1 = operatorIndex + node.operator.length,e1 = subNode.range[0]
      ,e2 = subNode.range[1],c2 = node.range[1]
      if (c1 !== e1 && e2 !== c2) {
        nextParen:
        for (; c1 < e1; c1++) {
          if (toParse[c1] === '(') {
            while (c2-- > e2) { //3rd of for is only executed after 1st time, //bruh, just use while loop
              if (toParse[c2] === ')') {
                everything.push(['ParenthesizedExpression',c1,c2 + 1])
                continue nextParen
              }
            }
            break nextParen
          }
        }
      }

      tempArr.push(node.right,node.left)
      tempIdx += 2
      break
    case 'AssignmentExpression':
      tempArr.push(node.right,node.left)
      tempIdx += 2
      break
    case 'AssignmentPattern':
      tempArr.push(node.right,node.left)
      tempIdx += 2
      break
    case 'ObjectExpression':
      everything.push(['ObjectExpression',node.range[0],node.range[1]])
      subNode = node.properties
      tempIdx += subNode.length
      for (let i = subNode.length - 1; i > -1; i--) {
      // d(subNode[i])
        tempArr.push(subNode[i])
      }

      break
    case 'Property':
      tempIdx += 2
      tempArr.push(node.value,node.key)
      break
    case 'FunctionDeclaration':
    // d(node)
      subNode = node.body
      tempIdx++
      tempArr.push(subNode)
      // d('BRUH')
      // d(toParse[node.id.range[1]])
      // d(toParse[subNode.range[0] - 1])
      // d(toParse[toParse.lastIndexOf(')',subNode.range[0] - 1)])
      everything.push(['() function definition',toParse.indexOf('(',node.id.range[1])
        ,toParse.lastIndexOf(')',subNode.range[0] - 1) + 1,
      ])
      break
    case 'BlockStatement':
      everything.push(['BlockStatement',node.range[0],node.range[1]])
      subNode = node.body
      tempIdx += subNode.length
      for (let i = subNode.length - 1; i > -1; i--) {
        tempArr.push(subNode[i])
      }
      break
    case 'ArrayExpression':
      everything.push(['ArrayExpression',node.range[0],node.range[1]])
      subNode = node.elements
      tempIdx += subNode.length
      for (let i = subNode.length - 1; i > -1; i--) {
        tempArr.push(subNode[i])
      }
      break
    case 'Literal':
      const firstChar = node.raw[0]
      if (firstChar === '"') {
        everything.push(['"',node.range[0],node.range[1]])
      } else if (firstChar === '\'') {
        everything.push(['\'',node.range[0],node.range[1]])
      }
      break
    case 'TemplateLiteral':
      subNode = node.expressions
      tempIdx += subNode.length
      for (let i = subNode.length - 1; i > -1; i--) {
        tempArr.push(subNode[i])
      }
      break
    case 'IfStatement':
      // d(node)
      subNode = node.test
      c1 = node.range[0] + 2 //'if'
      ,e1 = subNode.range[0],e2 = subNode.range[1],c2 = node.consequent.range[0]
      nextParen:
      for (; c1 < e1; c1++) {
        if (toParse[c1] === '(') {
          while (c2-- > e2) { //3rd of for is only executed after 1st time, //bruh, just use while loop
            if (toParse[c2] === ')') {
              everything.push(['if ()',c1,c2 + 1])
              continue nextParen
            }
          }
          break nextParen
        }
      }
      if (node.alternate) {
        tempArr.push(node.alternate,node.consequent,subNode)
        tempIdx += 3
      } else {
        tempArr.push(node.consequent,subNode)
        tempIdx += 2
      }
      break
    case 'WhileStatement':
      subNode = node.test
      c1 = node.range[0] + 5 //'while'
      ,e1 = subNode.range[0],e2 = subNode.range[1],c2 = node.body.range[0]
      nextParen:
      for (; c1 < e1; c1++) {
        if (toParse[c1] === '(') {
          while (c2-- > e2) { //3rd of for is only executed after 1st time, //bruh, just use while loop
            if (toParse[c2] === ')') {
              everything.push(['while ()',c1,c2 + 1])
              continue nextParen
            }
          }
          break nextParen
        }
      }
      tempArr.push(node.body,subNode)
      tempIdx += 2
      break
    case 'ForStatement':
      c1 = node.range[0] + 3 //'for'
      ,e1 = node.init.range[0],e2 = node.update.range[1],c2 = node.body.range[0]
      nextParen:
      for (; c1 < e1; c1++) {
        if (toParse[c1] === '(') {
          while (c2-- > e2) { //3rd of for is only executed after 1st time, //bruh, just use while loop
            if (toParse[c2] === ')') {
              everything.push(['while ()',c1,c2 + 1])
              continue nextParen
            }
          }
          break nextParen
        }
      }
      tempArr.push(node.body,node.update,node.test,node.init)
      tempIdx += 4
      break
    case 'SwitchStatement':
    // d(node)
      everything.push(['switch discriminant',node.discriminant.range[0],node.discriminant.range[1]])
      subNode = node.cases
      tempIdx += subNode.length
      for (let i = 0,len = subNode.length; i < len; i++) {
        tempArr.push(subNode[i])
      }
      break
    case 'SwitchCase':
      subNode = node.consequent
      tempIdx += subNode.length
      for (let i = 0,len = subNode.length; i < len; i++) {
        tempArr.push(subNode[i])
      }
      break
    case 'MemberExpression':
      subNode = node.property
      d(subNode)
      tempArr.push({type:'property',inside:subNode
        ,range:[subNode.range[0] - 1,subNode.range[1] + 1],
      }
      ,node.object)
      tempIdx += 2
      break
    case 'property':
      // d(toParse.slice(node.range[0],node.range[1]))
      // d(toParse[node.range[0]])
      // d(toParse[node.range[1] - 1])
      if (toParse[node.range[0]] === '[' && toParse[node.range[1] - 1] === ']') {
        everything.push(['property',node.range[0],node.range[1]])
      }
      tempIdx++
      tempArr.push(node.inside)
      break
    case 'NewExpression':
      tempArr.push({type:'arguments',theStuff:node.arguments,
        range:[
          toParse.indexOf('(',node.callee.range[1])
          ,toParse.lastIndexOf(')',node.range[1] - 1),
        ]})
      tempArr.push(node.callee)
      tempIdx += 2
      break
    case 'CallExpression':
    // d(toParse[node.callee.range[1]])
    // d(toParse[node.range[1] - 1])
    // d(toParse[toParse.indexOf('(',node.callee.range[1])])
    // d(toParse[toParse.lastIndexOf(')',node.range[1] - 1)])
      tempArr.push({type:'arguments',theStuff:node.arguments,
        range:[
          toParse.indexOf('(',node.callee.range[1])
          ,toParse.lastIndexOf(')',node.range[1] - 1),
        ]})
      tempArr.push(node.callee)
      tempIdx += 2
      break
    case 'arguments':
      everything.push(['() function call or new Position()',node.range[0],node.range[1] + 1])

      subNode = node.theStuff
      tempIdx += subNode.length
      for (let i = subNode.length - 1; i > -1; i--) {
        tempArr.push(subNode[i])
      }
      break
    case 'ArrowFunctionExpression':
      //it's a definition
      subNode = node.params
      c1 = node.range[0],c2 = node.body.range[0] - 3//the arrow itself
      if (subNode.length) {
        e1 = subNode[0].range[0] - 1
        ,e2 = subNode[subNode.length - 1].range[1]
        nextParen:
        for (; c1 < e1; c1++) {
          if (toParse[c1] === '(') {
            while (c2-- > e2) { //3rd of for is only executed after 1st time, //bruh, just use while loop
              if (toParse[c2] === ')') {
                everything.push(['() => {} definition',c1,c2 + 1])
                continue nextParen
              }
            }
            break nextParen
          }
        }
      } else {
        everything.push(['() => {} definition',
          toParse.indexOf('(',c1),
          toParse.lastIndexOf(')',c2) + 1])
      }

      tempIdx++
      tempArr.push(node.body)

      tempIdx += subNode.length
      for (let i = 0,len = subNode.length; i < len; i++) {
        tempArr.push(subNode[i])
      }

      break
    case 'TSTypeAliasDeclaration':
      // d(node)
      tempIdx++
      tempArr.push(node.typeAnnotation)
      break
    case 'TSTypeLiteral':
      everything.push(['TSTypeLiteral',node.range[0],node.range[1]])
      subNode = node.members
      tempIdx += subNode.length
      for (let i = subNode.length - 1; i > -1; i--) {
        tempArr.push(subNode[i])
      }
      break
    case 'TSTupleType':
      everything.push(['TSTupleType',node.range[0],node.range[1]])
      subNode = node.elementTypes
      tempIdx += subNode.length
      for (let i = subNode.length - 1; i > -1; i--) {
        tempArr.push(subNode[i])
      }
      break
    case 'TSIndexSignature':
      // d(node)
      everything.push(['TSIndexSignature',node.range[0]
      //get index of last parameter
        ,toParse.indexOf(']',node.parameters[node.parameters.length - 1].range[1]) + 1,
      ])
      tempArr.push(node.typeAnnotation)
      tempIdx++
      break
    case 'TSPropertySignature':
      tempArr.push(node.typeAnnotation)
      tempIdx++
      break
    case 'TSTypeAnnotation':
      tempArr.push(node.typeAnnotation)
      tempIdx++
      break
    }

    if (tempIdx !== -1) {
      tempIdx--
      node = tempArr.pop()
      continue outer
    }
    break outer
  }
  return everything
}
