import { FetchedDeviceDataInterface } from "@/hooks/interfaces"

export const authenticationstate = {
    auth: null,
    user: {
        fullname: {
            firstName: "",
            middleName: "",
            lastName: ""
        },
        birthdate: {
            month: "",
            day: "",
            year: ""
        },
        contact: "",
        email: "",
        profile: "",
        token: "",
        isActivated: false,
        isVerified: false
    }
}

export const fetchedDeviceDataState: FetchedDeviceDataInterface = {
    deviceID: "",
    deviceName: "",
    type: "",
    os: "",
    connectionToken: "",
    dateAdded: {
        date: "",
        time: "",
    },
    isActivated: true,
    isMounted: false,
    notifications: [],
    files: {
        directory: "",
        list: []
    }
  }