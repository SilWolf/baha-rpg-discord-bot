import axios from 'axios'
import * as jose from 'jose'
import { GoogleSpreadsheet } from 'google-spreadsheet'

const GOOGLE_ACCESS_KEY_KEY = `_googleAccessKey_${process.env.GOOGLE_PROJECT_ID}`
const GOOGLE_ACCESS_TOKEN_EXPIRED_AT_KEY = `_googleAccessTokenExpiredAt_${process.env.GOOGLE_PROJECT_ID}`

let cachedAccessToken: string | undefined
let cachedAccessTokenExpiredAt: number | undefined

const getGoogleAccessToken = async (): Promise<string> => {
  if (!process.env.GOOGLE_PRIVATE_KEY) {
    throw new Error('missing env: GOOGLE_PRIVATE_KEY')
  }

  if (!cachedAccessToken) {
    if (typeof sessionStorage !== 'undefined') {
      const storedAccessToken = sessionStorage.getItem(
        GOOGLE_ACCESS_KEY_KEY
      ) as string
      const storedAccessTokenExpiredAt = parseInt(
        sessionStorage.getItem(GOOGLE_ACCESS_TOKEN_EXPIRED_AT_KEY) as string,
        10
      )

      if (storedAccessToken && storedAccessTokenExpiredAt) {
        cachedAccessToken = storedAccessToken
        cachedAccessTokenExpiredAt = storedAccessTokenExpiredAt
      }
    }
  }

  if (
    cachedAccessToken &&
    cachedAccessTokenExpiredAt &&
    Date.now() < cachedAccessTokenExpiredAt
  ) {
    return cachedAccessToken
  }

  const privateKey = await jose.importPKCS8(
    process.env.GOOGLE_PRIVATE_KEY as string,
    'RS256'
  )
  const jwt = await new jose.SignJWT({
    iss: 'sheet-update-bot@mahjong-reach.iam.gserviceaccount.com',
    scope:
      'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive',
    aud: 'https://oauth2.googleapis.com/token',
    exp: Math.floor(Date.now() / 1000) + 3600,
    iat: Math.floor(Date.now() / 1000),
  })
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
    .sign(privateKey)

  const { access_token: accessToken, expires_in: expiresIn } = await axios
    .post('https://oauth2.googleapis.com/token', {
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    })
    .then((res) => {
      const data = res.data
      const thisAccessToken = data.access_token as string
      data.access_token = thisAccessToken.substring(
        0,
        thisAccessToken.indexOf('.......')
      )

      return data
    })

  cachedAccessToken = accessToken as string
  cachedAccessTokenExpiredAt = Date.now() + expiresIn * 1000
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem(GOOGLE_ACCESS_KEY_KEY, cachedAccessToken)
    sessionStorage.setItem(
      GOOGLE_ACCESS_TOKEN_EXPIRED_AT_KEY,
      cachedAccessTokenExpiredAt.toString()
    )
  }

  return accessToken
}

/**
 * Axios Instances
 */
const driveApi = axios.create({
  baseURL: 'https://www.googleapis.com/drive/v3',
  timeout: 10000,
})

driveApi.interceptors.request.use(async (req) => {
  const accessToken = await getGoogleAccessToken()
  if (accessToken) {
    req.headers = {
      ...req.headers,
      Authorization: `Bearer ${accessToken}`,
    }
  }

  return req
})

export const getDoc = async () => {
  if (!process.env.GOOGLE_CLIENT_EMAIL) {
    throw new Error('missing env: GOOGLE_CLIENT_EMAIL')
  }

  if (!process.env.GOOGLE_PRIVATE_KEY) {
    throw new Error('missing env: GOOGLE_PRIVATE_KEY')
  }
}

export const getSpreadsheetDoc = async (fileId: string) => {
  if (!process.env.GOOGLE_CLIENT_EMAIL) {
    throw new Error('missing env: GOOGLE_CLIENT_EMAIL')
  }

  if (!process.env.GOOGLE_PRIVATE_KEY) {
    throw new Error('missing env: GOOGLE_PRIVATE_KEY')
  }

  const doc = new GoogleSpreadsheet(fileId)

  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  })

  await doc.loadInfo()

  return doc
}

export default { driveApi }
