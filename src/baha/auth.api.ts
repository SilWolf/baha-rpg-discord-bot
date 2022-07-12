import FormData from 'form-data'
import api from '.'

export const postLogin = async (): Promise<{ bahaToken: string }> => {
  console.log('userid', process.env.BAHA_USER_ID)
  console.log('password', process.env.BAHA_PASSWORD)
  console.log('alternativeCaptcha', process.env.BAHA_CAPTCHA)

  // do a pre-login
  await api.post(
    '/user/v1/login_precheck.php',
    `userid=${process.env.BAHA_USER_ID}`,
    {
      baseURL: 'https://api.gamer.com.tw',
      headers: {
        'content-type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
    }
  )

  const formData = new FormData()

  formData.append('userid', process.env.BAHA_USER_ID)
  formData.append('password', process.env.BAHA_PASSWORD)
  formData.append('alternativeCaptcha', process.env.BAHA_CAPTCHA)

  const res = await api.post('/ajax/do_login.php', formData, {
    baseURL: 'https://user.gamer.com.tw',
    headers: { 'Content-Type': 'multipart/form-data' },
  })

  const bahaTokenSet = res.headers['set-cookie']?.find((cookie) =>
    cookie.startsWith('BAHARUNE=')
  )

  if (!bahaTokenSet) {
    throw new Error('Failed to login')
  }

  const bahaToken = bahaTokenSet.split(/[=;]/g)[1]

  api.defaults.headers.common.Cookie = `BAHARUNE=${bahaToken};`

  return {
    bahaToken,
  }
}

export default {}
