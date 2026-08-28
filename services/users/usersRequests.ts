import axiosApi from "@/lib/axiosAPi";
import { UserLoginType, UserType, UsersAuthType } from "@/types/users";


export async function getMe(): Promise<UserType> {
    const result = await axiosApi.get<UserType>("/users/me");
    return result.data;
};


export async function login(data: UserLoginType) {
    const result = await axiosApi.post("/users/login", data);
    return result.data;
};

export async function logout() {
    await axiosApi.delete("/users/logout");
};

export async function register(data: UsersAuthType) {
  const result = await axiosApi.post("/users/", data);
  return result.data;
};