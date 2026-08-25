export type UserRole = "ADMIN" | "ANALYST" | "VIEWER";


export interface UsersAuthType {
    username: string;
    role: UserRole;
    password: string;
}


export interface UserLoginType {
    username: string
    password: string
}


export interface UserInCookiesType {
    user_id: number
    username: string
    role: UserRole
}


export interface UserType {
    id: number;
    username: string
    role: UserRole
}

