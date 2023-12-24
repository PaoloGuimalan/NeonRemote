export interface ContextMenu{
    toggle: boolean,
    x: number,
    y: number
}

export interface HighlightIndexInterface{
    start: number,
    end: number
}

export interface FieldContextMenuInterface{
    toggleContextMenu: ContextMenu
}

export interface EditableTextFieldInterface{
    onBlur: () => void,
    onChange: (e: string) => void,
    initialValue: string,
    isEditable: boolean
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

export interface AppInterface{
    _id: String,
    app_name: String,
    app_description: String
}