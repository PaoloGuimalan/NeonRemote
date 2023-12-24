import React from 'react'
import { ContextMenu } from "./interfaces"

const contextMenuHandler = (e: React.MouseEvent, settoggleContextMenu: React.Dispatch<ContextMenu>) => {
    e.preventDefault()
    var target = e.target as HTMLDivElement
    // var bounds = target.getBoundingClientRect()

    target.focus()

    settoggleContextMenu({
        toggle: false,
        x: e.clientX,
        y: e.clientY 
    })

    setTimeout(() => {
        settoggleContextMenu({
            toggle: true,
            x: e.clientX,
            y: e.clientY 
        })
    },100)
}

const checkIfValid = (array: Array<any>) => {
    var notValidCount = 0;
    array.map((vars) => {
        if(vars.trim() == ""){
            notValidCount += 1
        }
    })

    return notValidCount > 0? false : true
}

const checkIfRolePermitted = (state: any, neededpermission: string) => {
    return state.user.role_permissions?.includes(neededpermission)
}

const dateconverter = (stringdate: String) => {
    var mL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    // var mS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

    var dateToFormat = new Date(stringdate.toString())
    var dateFinalFormat = `${mL[dateToFormat.getMonth()]} ${dateToFormat.getDate()} ${dateToFormat.getFullYear()}`;
    return dateFinalFormat;
}

export {
    contextMenuHandler,
    checkIfValid,
    checkIfRolePermitted,
    dateconverter
}