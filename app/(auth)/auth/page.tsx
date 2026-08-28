"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; 
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Lock, User, LogIn, Loader2 } from "lucide-react";
import { useRegister } from "@/services/users/usersQueries";
import { Input } from "@/components/ui/input";
import type { UsersAuthType } from "@/types/users";

const RegisterPage = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UsersAuthType>({
    defaultValues: {
      username: "",
      password: "",
      role: "ADMIN", // Замените на вашу роль по умолчанию
    },
  });

  const mute = useRegister();
  const onSubmit = async (data: UsersAuthType) => {
    setIsLoading(true);
    setAuthError(null);

    mute.mutate(data, {
      onSuccess: () => {
        router.push('/login');
      }
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-xl shadow-slate-200/50 dark:bg-slate-900 dark:shadow-none">
        {/* Заголовок */}
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#1E2B6D]/10 text-[#1E2B6D] dark:bg-indigo-500/20 dark:text-indigo-400">
            <LogIn className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-[#1E2B6D] dark:text-white">
            SOC SIEM
          </h1>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            Регистрация
          </p>
        </div>

        {/* Форма */}
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
          {/* Поле Username */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Имя пользователя
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                {...register("username", {
                  required: "Введите имя пользователя",
                  validate: (value) =>
                    value.trim() !== "" || "Поле не должно быть пустым",
                })}
                className="pl-10 h-11 bg-slate-50 border-slate-200 focus:bg-white dark:bg-slate-800 dark:border-slate-700"
                placeholder="Username"
                id="username"
                disabled={isLoading}
              />
            </div>
            {errors.username && (
              <p className="text-xs text-red-500 font-medium pl-1 mt-1">
                {errors.username.message}
              </p>
            )}
          </div>

          {/* Поле Password */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Пароль
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                type={showPassword ? "text" : "password"}
                {...register("password", {
                  required: "Введите пароль",
                  validate: (value) =>
                    value.trim() !== "" || "Поле не должно быть пустым",
                  minLength: {
                    value: 3,
                    message: "Пароль должен содержать минимум 3 символов",
                  },
                })}
                className="pl-10 pr-10 h-11 bg-slate-50 border-slate-200 focus:bg-white dark:bg-slate-800 dark:border-slate-700"
                placeholder="••••••••"
                id="password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-500 font-medium pl-1 mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Сообщение об ошибке сервера/авторизации */}
          {authError && (
            <div className="rounded-lg bg-red-50 p-3 text-center text-xs font-medium text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {authError}
            </div>
          )}

          {/* Кнопка входа */}
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1E2B6D] px-4 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#176C99] active:scale-[0.99] disabled:opacity-60 disabled:pointer-events-none dark:bg-indigo-600 dark:hover:bg-indigo-500"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Загрузка...</span>
              </>
            ) : (
              <span>Создать</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
