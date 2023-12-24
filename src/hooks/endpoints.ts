const AUTH = {
    login: '/auth/login',
    logout: '/auth/logout',
    userfetch: '/auth/user/get'
}

const APP = {
    list: '/app'
}

const INSERT = {
    releasenotes: '/release_note/create',
    maintenancenotes: '/maintenance/create'
}

const GET = {
    release_note: '/release_notes',
    maintenance: '/maintenance',
    specificmaintenance: '/maintenance/show',
    specificrelease_note: '/release_notes/show'
}

const DELETE = {
    release_note: '/release_note/delete',
    maintenance: '/maintenance/delete'
}

const UPDATE = {
    release_notes: '/release_note/update',
    maintenance: '/maintenance/update'
}

export {
    AUTH,
    APP,
    INSERT,
    GET,
    DELETE,
    UPDATE
}