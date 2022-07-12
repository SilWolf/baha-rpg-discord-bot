import FormData from 'form-data'
import api from '.'

export const postLogin = async (): Promise<{ bahaToken: string }> => {
  const formData = new FormData()

  formData.append('userid', process.env.BAHA_USER_ID)
  formData.append('password', process.env.BAHA_PASSWORD)
  formData.append('alternativeCaptcha', process.env.BAHA_CAPTCHA)

  const res = await api.post(
    'https://user.gamer.com.tw/ajax/do_login.php',
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    }
  )

  if (!res.headers.BAHARUNE) {
    throw new Error('Failed to login')
  }

  api.defaults.headers.common.Cookie = `BAHARUNE=${res.headers.BAHARUNE};`

  return {
    bahaToken: res.headers.BAHARUNE,
  }
}

export default {}
