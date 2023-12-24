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
    _id: String,
    token: String | null,
    role_permissions: Array<String>,
    user_role: String,
    first_name: String,
    last_name: String
}

export interface AuthStateInterface{
    auth: boolean | null,
    user: AuthTokenInterface
}