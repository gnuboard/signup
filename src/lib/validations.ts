import { z } from "zod";

export const nameSchema = z
  .string()
  .refine((name) => name.length > 0, "이름을 입력해주세요.")
  .refine((name) => name.length >= 2, "이름은 최소 2자 이상이어야 합니다.");

export const emailSchema = z
  .string()
  .refine((email) => email.length > 0, "이메일을 입력해주세요.")
  .refine((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), "올바른 이메일 주소를 입력해주세요.");

export const passwordSchema = z
  .string()
  .min(1, "비밀번호를 입력해주세요.")
  .refine(
    (password) => password.length >= 8,
    "비밀번호는 최소 8자 이상이어야 합니다."
  )
  .refine(
    (password) => /[A-Z]/.test(password),
    "대문자를 최소 1자 이상 포함해야 합니다."
  )
  .refine(
    (password) => /[a-z]/.test(password),
    "소문자를 최소 1자 이상 포함해야 합니다."
  )
  .refine(
    (password) => /[0-9]/.test(password),
    "숫자를 최소 1자 이상 포함해야 합니다."
  )
  .refine(
    (password) => /[^A-Za-z0-9]/.test(password),
    "특수문자를 최소 1자 이상 포함해야 합니다."
  );

export const signUpSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export const profileUpdateSchema = z.object({
  name: nameSchema,
  password: passwordSchema.optional(),
});

export type ValidationError = {
  [key: string]: string[];
};

export function validateForm<T extends z.ZodSchema>(
  schema: T,
  data: any
): { isValid: boolean; errors: ValidationError } {
  try {
    schema.parse(data);
    return { isValid: true, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: ValidationError = {};
      error.errors.forEach((err) => {
        if (err.path) {
          const field = err.path[0];
          if (!errors[field]) {
            errors[field] = [];
          }
          errors[field].push(err.message);
        }
      });
      return { isValid: false, errors };
    }
    return { isValid: false, errors: {} };
  }
}
