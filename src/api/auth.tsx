export async function loginApi(username: string, password: string) {
  // Giả lập API, thực tế gọi fetch/axios
  return new Promise<{ token: string }>((resolve, reject) => {
    setTimeout(() => {
      if (username === 'admin' && password === '123456') {
        resolve({ token: 'fake-jwt-token' })
      } else {
        reject(new Error('Sai tài khoản hoặc mật khẩu'))
      }
    }, 1000)
  })
}