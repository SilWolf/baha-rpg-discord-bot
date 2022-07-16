import axios from 'axios'
import * as jose from 'jose'
import qs from 'qs'
import {
  SpreadSheet,
  SpreadSheetBatchGet,
  SpreadSheetValueRange,
} from './types'

const GOOGLE_ACCESS_KEY_KEY = `_googleAccessKey_${process.env.GOOGLE_PROJECT_ID}`
const GOOGLE_ACCESS_TOKEN_EXPIRED_AT_KEY = `_googleAccessTokenExpiredAt_${process.env.GOOGLE_PROJECT_ID}`

let cachedAccessToken: string | undefined
let cachedAccessTokenExpiredAt: number | undefined

const getGoogleAccessToken = async (): Promise<string> => {
  if (!process.env.GOOGLE_PRIVATE_KEY) {
    throw new Error('missing env: GOOGLE_PRIVATE_KEY')
  }

  if (!cachedAccessToken) {
    if (sessionStorage) {
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
  if (sessionStorage) {
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
const sheetApi = axios.create({
  baseURL: 'https://sheets.googleapis.com/v4',
  timeout: 10000,
})

sheetApi.interceptors.request.use(async (req) => {
  const accessToken = await getGoogleAccessToken()
  if (accessToken) {
    req.headers = {
      ...req.headers,
      Authorization: `Bearer ${accessToken}`,
    }
  }

  return req
})

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

export const getSpreadsheet = async (fileId: string) =>
  sheetApi.get<SpreadSheet>(`/spreadsheets/${fileId}`).then((res) => res.data)

export const getSpreadsheetValues = async (
  fileId: string,
  range: string,
  dimension: 'COLUMNS' | 'ROWS'
) =>
  sheetApi
    .get<SpreadSheetValueRange>(`/spreadsheets/${fileId}/values/${range}`, {
      params: {
        majorDimension: dimension,
      },
    })
    .then((res) => res.data)

export const getSpreadsheetBatchGet = async (
  fileId: string,
  payload: {
    ranges: string[]
    majorDimension: 'COLUMNS' | 'ROWS'
  }
) =>
  sheetApi
    .get<SpreadSheetBatchGet>(`/spreadsheets/${fileId}/values:batchGet`, {
      params: payload,
      paramsSerializer: (params) =>
        qs.stringify(params, { arrayFormat: 'repeat' }),
    })
    .then((res) => res.data)

export const postSpreadsheetBatchUpdate = async (
  fileId: string,
  payload: {
    requests: {
      updateSpreadsheetProperties: {
        properties: Record<string, string>
        fields: string
      }
    }[]
  }
) =>
  sheetApi
    .post<SpreadSheetBatchGet>(`/spreadsheets/${fileId}:batchUpdate`, payload)
    .then((res) => res.data)

export const postSpreadsheetValuesBatchUpdate = async (
  fileId: string,
  payload: {
    data: {
      range: string
      majorDimension: 'COLUMNS' | 'ROWS'
      values: Array<Array<string | number>>
    }[]
  }
) =>
  sheetApi
    .post<SpreadSheetBatchGet>(`/spreadsheets/${fileId}/values:batchUpdate`, {
      valueInputOption: 'USER_ENTERED',
      ...payload,
    })
    .then((res) => res.data)

export default { sheetApi, driveApi }
