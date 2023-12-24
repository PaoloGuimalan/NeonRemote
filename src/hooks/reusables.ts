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

const monthList : string[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const currentYear = (new Date()).getFullYear();
const validYear = currentYear - 15;
const range = (start: number, stop: number, step: number) => Array.from({ length: (stop - start) / step + 1}, (_, i) => start + (i * step));
const finalYears = range(validYear, validYear - 50, -1)

const getDaysInMonth = (monthProp: string, year: number) => {
    const month = monthList.indexOf(monthProp)
    var date = new Date(year, month, 1);
    var days = [];
    while (date.getMonth() === month) {
      days.push(new Date(date).getDate());
      date.setDate(date.getDate() + 1);
    }
    return days;
}

export {
    checkIfValid,
    checkIfRolePermitted,
    dateconverter,
    monthList,
    finalYears as years,
    getDaysInMonth
}