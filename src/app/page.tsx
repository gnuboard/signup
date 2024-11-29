import { SignUpForm } from "@/components/SignUpForm"

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6">회원가입</h1>
        <SignUpForm />
      </div>
    </main>
  )
} 