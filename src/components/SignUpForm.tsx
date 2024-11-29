"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

// 폼 검증 스키마 정의
const signUpSchema = z.object({
  email: z.string().email({
    message: "올바른 이메일 주소를 입력해주세요.",
  }),
  password: z.string().min(8, {
    message: "비밀번호는 최소 8자 이상이어야 합니다.",
  }),
  confirmPassword: z.string(),
  name: z.string().min(2, {
    message: "이름은 최소 2자 이상이어야 합니다.",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "비밀번호가 일치하지 않습니다.",
  path: ["confirmPassword"],
})

export function SignUpForm() {
  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      name: "",
    },
  })

  function onSubmit(values: z.infer<typeof signUpSchema>) {
    console.log(values)
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">이메일</label>
        <input
          {...form.register("email")}
          className="w-full rounded-md border p-2"
          placeholder="email@example.com"
        />
        {form.formState.errors.email && (
          <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">비밀번호</label>
        <input
          {...form.register("password")}
          type="password"
          className="w-full rounded-md border p-2"
        />
        {form.formState.errors.password && (
          <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">비밀번호 확인</label>
        <input
          {...form.register("confirmPassword")}
          type="password"
          className="w-full rounded-md border p-2"
        />
        {form.formState.errors.confirmPassword && (
          <p className="text-sm text-red-500">{form.formState.errors.confirmPassword.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">이름</label>
        <input
          {...form.register("name")}
          className="w-full rounded-md border p-2"
        />
        {form.formState.errors.name && (
          <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
        )}
      </div>

      <button
        type="submit"
        className="w-full rounded-md bg-blue-500 py-2 text-white hover:bg-blue-600"
      >
        회원가입
      </button>
    </form>
  )
} 