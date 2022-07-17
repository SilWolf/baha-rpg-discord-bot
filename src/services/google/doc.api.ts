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
  docs_v1,
  docs as googleDocs,
} from '@googleapis/docs'
import { GoogleDocRequest } from './types/bahaPostForGoogleDoc'

class GoogleDoc {
  _instance: docs_v1.Docs

  _docId: string

  _doc: docs_v1.Schema$Document | undefined

  constructor(docId?: string) {
    if (!process.env.GOOGLE_CLIENT_EMAIL) {
      throw new Error('missing env: GOOGLE_CLIENT_EMAIL')
    }

    if (!process.env.GOOGLE_PRIVATE_KEY) {
      throw new Error('missing env: GOOGLE_PRIVATE_KEY')
    }

    const auth = new googleAuth.GoogleAuth({
      scopes: [
        'https://www.googleapis.com/auth/documents',
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/drive.file',
      ],
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
    })

    this._instance = googleDocs({
      version: 'v1',
      auth,
    })

    this._docId = docId ?? ''
  }

  getInstance() {
    return this._instance
  }

  async load() {
    if (!this._doc && this._docId) {
      this._doc = await this._instance.documents.get({
        documentId: this._docId,
      })
    }
  }

  async prependTexts(texts: string[]) {
    return this._instance.documents.batchUpdate({
      documentId: this._docId,
      requestBody: {
        requests: texts.reverse().map((text) => ({
          insertText: {
            text: `${text}\n\n`,
            location: {
              index: 1,
            },
          },
        })),
      },
    })
  }

  async batchUpdate(requests: GoogleDocRequest[]) {
    return this._instance.documents.batchUpdate({
      documentId: this._docId,
      requestBody: {
        requests,
      },
    })
  }
}

export const getGoogleDoc = (docId: string) => new GoogleDoc(docId)

export default {}
