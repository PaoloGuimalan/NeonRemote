export interface ActionProp{
    type: string;
    payload: any
}

export interface RegisterInterface{
    fullname: {
        firstName: string,
        middleName: string,
        lastName: string
    },
    birthdate: {
        month: string,
        day: string,
        year: string
    },
    contact: string,
    email: string,
    password: string
}

export interface AuthTokenInterface{
    userID: string,
    fullname: {
        firstName: string,
        middleName: string,
        lastName: string
    },
    birthdate: {
        month: string,
        day: string,
        year: string
    },
    dateCreated: {
        date: string,
        time: string
    },
    contact: string,
    email: string,
    profile: string,
    token: string,
    isActivated: boolean,
    isVerified: boolean
}

export interface AuthStateInterface{
    auth: boolean | null,
    user: AuthTokenInterface
}