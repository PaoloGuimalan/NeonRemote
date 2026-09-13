/* eslint-disable @typescript-eslint/no-explicit-any */
const checkIfValid = (array: Array<any>) => {
  let notValidCount = 0;
  array.map((vars) => {
    if (vars.trim() == "") {
      notValidCount += 1;
    }
  });

  return notValidCount > 0 ? false : true;
};

const checkIfRolePermitted = (state: any, neededpermission: string) => {
  return state.user.role_permissions?.includes(neededpermission);
};

const dateconverter = (stringdate: string) => {
  const mL = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  // var mS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

  const dateToFormat = new Date(stringdate.toString());
  const dateFinalFormat = `${mL[dateToFormat.getMonth()]} ${dateToFormat.getDate()} ${dateToFormat.getFullYear()}`;
  return dateFinalFormat;
};

const monthList: string[] = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const currentYear = new Date().getFullYear();
const validYear = currentYear - 15;
const range = (start: number, stop: number, step: number) =>
  Array.from({ length: (stop - start) / step + 1 }, (_, i) => start + i * step);
const finalYears = range(validYear, validYear - 50, -1);

const getDaysInMonth = (monthProp: string, year: number) => {
  const month = monthList.indexOf(monthProp);
  const date = new Date(year, month, 1);
  const days = [];
  while (date.getMonth() === month) {
    days.push(new Date(date).getDate());
    date.setDate(date.getDate() + 1);
  }
  return days;
};

function formatToWords(createdAt: string): string {
  const date = new Date(createdAt);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export {
  checkIfValid,
  checkIfRolePermitted,
  dateconverter,
  monthList,
  finalYears as years,
  getDaysInMonth,
  formatToWords,
};
