import {createSourceFile,Declaration,Node,ScriptTarget,SourceFile,SyntaxKind,HasJSDoc,Statement,TypeOnlyCompatibleAliasDeclaration,NamedImportBindings,Expression,ImportDeclaration,ElementAccessExpression,ArrayLiteralExpression,CallExpression,LiteralToken,LeftHandSideExpression} from 'typescript'
// import {createSourceFile} from 'typescript'
// import {Declaration,Node,ScriptTarget,SourceFile,SyntaxKind,HasJSDoc,Statement,TypeOnlyCompatibleAliasDeclaration,NamedImportBindings,Expression,ImportDeclaration,ElementAccessExpression,ArrayLiteralExpression,CallExpression,LiteralToken,LeftHandSideExpression} from './lol'

// function getStack(): NodeJS.CallSite[] | string | undefined {
// var orig = Error.prepareStackTrace
// Error.prepareStackTrace = function(_,stack) {
// return stack
// }
// var err = new Error
// Error.captureStackTrace(err,arguments.callee)
// var stack = err.stack
// Error.prepareStackTrace = orig
// return stack
// }
// function getLastLine() {
// const stack = getStack()
// if (stack === undefined || typeof stack === 'string') {
// return 'idk which line'
// }
// return stack[1].getLineNumber()
// }

interface oof1 {
    kind: 1
}
interface oof2 {
    kind: 2
    // bruh: 2
}

// type amalgamate = oof1 & oof2
type amalgamate = oof1 | oof2

//DOESN'T WORK
// interface extendedAmal extends amalgamate {
// __please: any;
// }
type extendedAmal = amalgamate & {
    __please: any;
}

//DOESN'T WORK
// interface veryExtended extends extendedAmal {
// __ohPleaseWork: any;
// }
type veryExtended = extendedAmal & {
    __ohPleaseWork: any;
}

// export interface UnaryExpression extends Expression {
// _unaryExpressionBrand: any;
// }

// export type UnaryExpression = Expression & {
// _unaryExpressionBrand: any;
// }

function why1(omg: extendedAmal) {
    omg.kind
}

function why2(omg: veryExtended) {
    omg.kind
}

function d(...text: (any)[]) {
    // node.js get which line a function was called
    // https://stackoverflow.com/questions/14172455/get-name-and-line-of-calling-function-in-node-js/14172822#53339452
    const e = new Error()
    if (e.stack === undefined) {
        console.debug(...text)
        return
    }
    const frame = e.stack.split('\n')[2] // change to 3 for grandparent func
    // const lineNumber = frame.split(':').reverse()[1]
    const functionName = frame.split(' ')[5]
    // console.log(`${functionName}:${lineNumber}`,...text)
    console.log(`${functionName}`,'➤',...text)
}

// writeSync(arrOrObjToString(everything),'everything_before.txt')
// const converted = modifyEverythingToV2(everything,false)

function HrTime_diffToMs(diff: [number,number]) {
    // d(diff)
    // return diff[0] * 1000000 + diff[1] / 1000000
    return `${diff[0] * 1000 + diff[1] / 1000000}ms`
}


type everything_element = [SyntaxKind,number,number]


export default (toParse: string): everything_element[] => {
    try {

        const everything: everything_element[] = []

        const tempArr: myNode[] = []
        function reversePushTo_TempArr<T>(nodeArr: T) {
            for (let i = nodeArr.length - 1; i > -1; i--) {
                tempArr.push(nodeArr[i])
            }
        }
        // let node: any = parse(toParse,{range:true})
        // const startTime = process.hrtime()

        enum my_syntax_kind {
            JustPushIt = -1,
        }
        // type myNode = SourceFile| HasJSDoc | NamedImportBindings | Expression
        interface JustPushIt {
            readonly kind: my_syntax_kind.JustPushIt,element_everything: everything_element
        }
        // type ExpressionInterface = LiteralToken | CallExpression | ElementAccessExpression | ArrayLiteralExpression
        type myNode = JustPushIt | SourceFile | HasJSDoc | LeftHandSideExpression | Expression | NamedImportBindings | ElementAccessExpression | ArrayLiteralExpression


        //NamedImportBindings for tempArr.push(node.importClause.namedBindings)
        // Expression for tempArr.push(node.moduleSpecifier)

        let node: myNode = createSourceFile('',toParse,ScriptTarget.Latest,true)
        // const diff = process.hrtime(startTime)
        // d(HrTime_diffToMs(diff)) //150ms

        const statements = node.statements
        if (statements.length === 0) {
            return []
        }
        d(statements)

        for (let i = statements.length - 1; i > -1; i--) {
            tempArr.push(statements[i] as myNode)
        }
        node = tempArr.pop() as myNode

        outer:
        while (true) {
            // d(node)
            switch (node.kind) {
            case my_syntax_kind.JustPushIt:
                everything.push(node.element_everything)
                break
            case SyntaxKind.VariableStatement:{
                reversePushTo_TempArr(node.declarationList.declarations)
                break
            }
            case SyntaxKind.VariableDeclaration:
                if (node.initializer) {
                    tempArr.push(node.initializer)
                }
                break
            case SyntaxKind.CallExpression:{
                reversePushTo_TempArr(node.arguments)
                tempArr.push(node.expression)
                break
            }
            case SyntaxKind.ElementAccessExpression:
                tempArr.push({kind:my_syntax_kind.JustPushIt,element_everything:[SyntaxKind.ElementAccessExpression,node.argumentExpression.pos - 1,node.end]})
                tempArr.push(node.argumentExpression)
                tempArr.push(node.expression)
                break
            case SyntaxKind.ArrayLiteralExpression:{
                everything.push([SyntaxKind.ArrayLiteralExpression,node.elements.pos - 1,node.end])
                reversePushTo_TempArr(node.elements)
                break
            }
            case SyntaxKind.StringLiteral:
                everything.push([SyntaxKind.StringLiteral,node.pos + 1,node.end])
                break

            case SyntaxKind.ImportDeclaration:
                // node | ImportDeclaration BECAUSE node can have ANY SyntaxKind, why is node even here..
                // node ISN'T HERE, it's Expression..
                tempArr.push(node.moduleSpecifier)
                if (node.importClause) {
                    if (node.importClause.namedBindings) {
                        tempArr.push(node.importClause.namedBindings)
                    }
                }
                break
            case SyntaxKind.NamedImports:
                everything.push([SyntaxKind.NamedImports,node.pos + 1,node.end])
                break
            case SyntaxKind.Identifier:
            case SyntaxKind.NumericLiteral:
                break
            default:
                d(node)
                let no
            }

            if (tempArr.length) {
                node = tempArr.pop() as myNode
                continue outer
            }
            break outer
        }
        return everything

    } catch (error) {
        d('walker error')
        d(error)
        return []

    }
}

