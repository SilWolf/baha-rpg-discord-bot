import axios, { AxiosResponse } from 'axios'

export type BahaAPIResponse<T = unknown> = {
  data?: T
  error?: {
    code: number
    message: string
    status: string
    details: string[]
  }
}

const api = axios.create({
  baseURL: 'https://api.gamer.com.tw',
  params: {
    gsn: 3014,
  },
})

api.interceptors.response.use((res: AxiosResponse<BahaAPIResponse>) => {
  if (res.data.error) {
    throw new Error(res.data.error.message ?? '未知的錯誤')
  }

  return res
})

export default api
