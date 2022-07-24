import axios, { AxiosResponse } from 'axios'

export type BahaAPIResponse<T = unknown> = {
  data: T
  error?: {
    code: number
    message: string
    status: string
    details: string[]
  }
}

const api = axios.create({
  baseURL: 'https://api.gamer.com.tw',
  withCredentials: true,
})

api.interceptors.response.use((res: AxiosResponse<BahaAPIResponse>) => {
  console.log(`executed API: ${res.config.url}`)

  if (res.headers['set-cookie']) {
    console.log(res.headers['set-cookie'])
    console.log('trigger set-cookie. Renew cookies.')
    for (let i = 0; i < res.headers['set-cookie'].length; i += 1) {
      try {
        const [key, value] = res.headers['set-cookie'][i].split(/[=;]/g)
        api.defaults.headers.common.Cookie = `${key}=${value};`
      } catch (_) {
        console.log(`Failed to set-cookie: ${res.headers['set-cookie'][i]}`)
      }
    }
  }

  if (res.data.error) {
    throw new Error(res.data.error.message ?? '未知的錯誤')
  }

  return res
})

// Set initial cookies
api.defaults.headers.common.Cookie = `BAHARUNE=${process.env.BAHA_TOKEN}; BAHAENUR=${process.env.BAHA_REFRESH_TOKEN}`

export default api
