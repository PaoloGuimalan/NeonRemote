const reactQuillProperties = () => {
    var modules = {
        toolbar: false
        // toolbar: [
        //     [{ size: ["small", false, "large", "huge"] }],
        //     ["bold", "italic", "underline", "strike", "blockquote"],
        //     [{ list: "ordered" }, { list: "bullet" }],
        //     ["link", "image"],
        //     [
        //       { list: "ordered" },
        //       { list: "bullet" },
        //       { indent: "-1" },
        //       { indent: "+1" },
        //       { align: [] }
        //     ],
        //     [{ "color": ["#000000", "#e60000", "#ff9900", "#ffff00", "#008a00", "#0066cc", "#9933ff", "#ffffff", "#facccc", "#ffebcc", "#ffffcc", "#cce8cc", "#cce0f5", "#ebd6ff", "#bbbbbb", "#f06666", "#ffc266", "#ffff66", "#66b966", "#66a3e0", "#c285ff", "#888888", "#a10000", "#b26b00", "#b2b200", "#006100", "#0047b2", "#6b24b2", "#444444", "#5c0000", "#663d00", "#666600", "#003700", "#002966", "#3d1466", 'custom-color'] }],
        //   ]
      };
    
      var formats = [
        "header", "height", "bold", "italic",
        "underline", "strike", "blockquote",
        "list", "color", "bullet", "indent",
        "link", "image", "align", "size",
      ];

      return {
        modules,
        formats
      }
}

const featuredisplay = [
  {
    name: "Devices",
    description: "Add, Access, Control your devices remotely.",
    route: "/devices"
  },
  {
    name: "Map Tracker",
    description: "Use map to track, navigate and locate devices and services.",
    route: "/map"
  },
  {
    name: "Streaming",
    description: "Stream Music and Videos from any of your devices.",
    route: ""
  },
  {
    name: "Peer Storage",
    description: "Move, Copy, Share files from your devices remotely.",
    route: ""
  }
]

const deviceTypeLabels : any = {
  "none": "Please select a device type",
  "pc": "Personal Computer",
  "mobile": "Mobile Phone",
  "embedded": "Embedded Device"
}

const deviceTypeList = [
  {
    value: "pc",
    label: "Personal Computer"
  },
  {
    value: "mobile",
    label: "Mobile Phone"
  },
  {
    value: "embedded",
    label: "Embedded Device"
  }
]

const deviceOSLabels : any = {
  "none": "Please select an operating system",
  "windows": "Windows",
  "mac": "Macintosh",
  "linux": "Linux"
}

const deviceOSList = [
  {
    value: "windows",
    label: "Windows"
  },
  {
    value: "mac",
    label: "Macintosh"
  },
  {
    value: "linux",
    label: "Linux"
  }
]

const deviceMobileOSLabels : any = {
  "none": "Please select an operating system",
  "android": "Android",
  "ios": "iOS"
}

const deviceMobileOSList = [
  {
    value: "android",
    label: "Android"
  },
  {
    value: "ios",
    label: "iOS"
  }
]

export {
    reactQuillProperties,
    featuredisplay,
    deviceOSLabels,
    deviceOSList,
    deviceTypeLabels,
    deviceTypeList,
    deviceMobileOSLabels,
    deviceMobileOSList
}