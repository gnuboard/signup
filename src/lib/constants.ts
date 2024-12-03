export const PASSWORD_CHARS = {
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  numbers: '0123456789',
  special: '!@#$%^&*'
} as const;

export const generatePassword = () => {
  const { lowercase, uppercase, numbers, special } = PASSWORD_CHARS;
  
  let password = '';
  // 각 문자 종류별로 최소 1개씩 추가
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];
  
  // 나머지 8자리를 랜덤하게 추가 (총 12자리)
  const charSet = lowercase + uppercase + numbers + special;
  for (let i = 0; i < 8; i++) {
    password += charSet[Math.floor(Math.random() * charSet.length)];
  }
  
  // 문자열을 랜덤하게 섞기
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

export function generateRandomUsername(): string {
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  const length = 10;
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }
  
  return result;
}