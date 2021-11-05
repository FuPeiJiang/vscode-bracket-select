ListLines 0
#SingleInstance force
SendMode "Input"	; Recommended for new scripts due to its superior speed and reliability.
SetWorkingDir A_ScriptDir	; Ensures a consistent starting directory.
#KeyHistory 0

$f1:: {
    send "^a"
    bak := getClip()

    lolAll:=bruh(bak, "Expression")
    for v in lolAll {
        bak:=StrReplace(bak, "export interface " v[1] " extends " v[2] " {", "export type " v[1] " = " v[2] " & {")
    }
    A_Clipboard:=bak
    Send "^v"
}

bruh(hayStack, toSearch) {

    lolAll:=[]

    inner(toSearch)
    return lolAll
    
    inner(toSearch) {
        arr:=[]
        FoundPos:=0
        while (FoundPos:=RegExMatch(hayStack, "export interface (\w*?) extends " toSearch " \{", regexMatchObj, FoundPos + 1)) {
            found_TS_Interface:=regexMatchObj.value(1)
            lolAll.Push([found_TS_Interface, toSearch])
            inner(found_TS_Interface)
            ; arr.Push(inner(regexMatchObj.value(1)))
        }
        ; toReturn:=[toSearch, arr]
        ; d toReturn
        ; return toReturn
    }
}

return

f3:: Exitapp