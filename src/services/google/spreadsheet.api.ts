/* eslint-disable no-underscore-dangle */
/* eslint-disable camelcase */
// import axios, { AxiosInstance } from 'axios'

// class GoogleDoc {
//   docId: string
//   axios: AxiosInstance

//   constructor(docId: string) {
//     this.docId = docId
//     this.axios = axios.create({})
//   }
// }

// export const getGoogleDoc = (docId: string) => new GoogleDoc(docId)

import {
  auth as googleAuth,
  sheets_v4,
  sheets as googleSheets,
} from '@googleapis/sheets'
import { GoogleSpreadsheetRequest } from './types/bahaPostForGoogleSheet'

class GoogleSpreadsheet {
  _sdk: sheets_v4.Sheets

  _id: string

  _instance: sheets_v4.Schema$Spreadsheet | undefined

  _requests: GoogleSpreadsheetRequest[] = []

  constructor(docId?: string) {
    if (!process.env.GOOGLE_CLIENT_EMAIL) {
      throw new Error('missing env: GOOGLE_CLIENT_EMAIL')
    }

    if (!process.env.GOOGLE_PRIVATE_KEY) {
      throw new Error('missing env: GOOGLE_PRIVATE_KEY')
    }

    const auth = new googleAuth.GoogleAuth({
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/drive.file',
      ],
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
    })

    this._sdk = googleSheets({
      version: 'v4',
      auth,
    })

    this._id = docId ?? ''
  }

  getSDK() {
    return this._sdk
  }

  getId() {
    return this._id
  }

  getInstance() {
    return this._instance
  }

  async load() {
    if (!this._instance && this._id) {
      this._instance = await this._sdk.spreadsheets
        .get({
          spreadsheetId: this._id,
        })
        .then((res) => res.data)
    }
  }

  addRequest(request: GoogleSpreadsheetRequest) {
    this._requests.push(request)
  }

  addSheet(properties: sheets_v4.Schema$SheetProperties) {
    this._requests.push({
      addSheet: {
        properties,
      },
    })
  }

  async instantAddSheet(properties: sheets_v4.Schema$SheetProperties) {
    return this._sdk.spreadsheets
      .batchUpdate({
        requestBody: {
          requests: [
            {
              addSheet: {
                properties,
              },
            },
          ],
        },
      })
      .then((res) => ({
        sheetId: res.data.replies?.[0].addSheet?.properties?.sheetId,
      }))
  }

  updateSheet(
    sheetId: number,
    properties: sheets_v4.Schema$UpdateSheetPropertiesRequest
  ) {
    this._requests.push({
      updateSheetProperties: {
        properties: {
          sheetId,
          ...properties,
        },
      },
    })
  }

  async instantUpdateSheet(
    sheetId: number,
    properties: sheets_v4.Schema$UpdateSheetPropertiesRequest
  ) {
    return this._sdk.spreadsheets.batchUpdate({
      requestBody: {
        requests: [
          {
            updateSheetProperties: {
              properties: {
                sheetId,
                ...properties,
              },
            },
          },
        ],
      },
    })
  }

  addRows(sheetId: number, rows: sheets_v4.Schema$RowData[]) {
    this._requests.push({
      appendCells: {
        sheetId,
        rows,
        fields: 'userEnteredValue',
      },
    })
  }

  updateCells(
    range: sheets_v4.Schema$GridRange,
    rows: sheets_v4.Schema$RowData[]
  ) {
    this._requests.push({
      updateCells: {
        range,
        rows,
        fields: 'userEnteredValue',
      },
    })
  }

  async execute() {
    const res = this._sdk.spreadsheets.batchUpdate({
      spreadsheetId: this._id,
      requestBody: {
        requests: this._requests,
      },
    })
    this._requests = []
    return res
  }
}

export const getGoogleSpreadsheet = (spreadsheetId: string) =>
  new GoogleSpreadsheet(spreadsheetId)

export default {}
