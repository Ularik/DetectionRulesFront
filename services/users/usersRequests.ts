import axiosApi from "@/lib/axiosAPi";
import { UserLoginType, UserType } from "@/types/users";


export async function getMe(): Promise<UserType> {
    const result = await axiosApi.get<UserType>("/users/me");
    return result.data;
};


export async function login(data: UserLoginType) {
    const result = await axiosApi.post("/users/login", data);
    return result.data;
};