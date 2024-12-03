import { SignUpForm } from "@/components/SignUpForm"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 -mt-48">
      <h1 className="text-4xl font-bold mb-4">환영합니다!</h1>
      <p className="text-gray-600">
        로그인하거나 회원가입을 통해 서비스를 이용해보세요.
      </p>
    </main>
  )
}