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
// api.defaults.headers.common.Cookie = `BAHARUNE=${process.env.BAHA_TOKEN}; BAHAENUR=${process.env.BAHA_REFRESH_TOKEN}`
api.defaults.headers.common.Cookie =
  'ckGUILD_lastBrowse=[[%223014%22%2C%22RPG%E4%B9%8B%E5%B9%BB%E6%83%B3%E5%9C%8B%E5%BA%A6%22]]; _gid=GA1.3.790978500.1657649585; __gads=ID=c730c79edf00fc88:T=1657649583:S=ALNI_MbtiV3scWv31YjYVPT15q9g8EWnzw; ckM=1592086352; BAHAID=silwolf167; BAHAHASHID=868fb0b140f9f992ea26d3640ead101490ba6fd5c9cc3c2ece2ce4996069653a; BAHANICK=%E9%8A%80%E7%8B%BC; BAHALV=41; BAHAFLT=1282362606; MB_BAHAID=silwolf167; MB_BAHANICK=%E9%8A%80%E7%8B%BC; age_limit_content=0; ga_class1=F; ckFORUM_setting=115111222221215221; BAHAENUR=b704f8e67470b1324060e18106ff7c7c; BAHARUNE=6d989f02268d160998ddc09864aaaa441cdcb2a01ce096230187557764558116451a4d08b070e86b569b; MB_BAHARUNE=6d989f02268d160998ddc09864aaaa441cdcb2a01ce096230187557764558116451a4d08b070e86b569b; avtrv=1657678751379; __gpi=UID=000007a2fbab22b0:T=1657649583:RT=1657680068:S=ALNI_MaWY7tX7iH2nI8ayWepOE_X3jqYIA; ckBahamutCsrfToken=fec36ae0354fb7d8; ckBAHAADS={"FA":{"a1":1,"a0":0,"a2":0,"a3":7}}; _ga=GA1.3.2024891136.1595344029; _ga_2Q21791Y9D=GS1.1.1657699790.1972.0.1657699790.60'

export default api
