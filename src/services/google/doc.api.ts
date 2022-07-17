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

class GoogleDoc {
  _instance: docs_v1.Docs

  _docId: string

  _doc: docs_v1.Schema$Document | undefined

  constructor(docId: string) {
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

    this._docId = docId
  }

  getInstance() {
    return this._instance
  }

  async getDoc() {
    if (!this._doc) {
      this._doc = await this._instance.documents.get({
        documentId: this._docId,
      })
    }

    return this._doc
  }
}

export const getGoogleDoc = (docId: string) => new GoogleDoc(docId).getDoc()

export default {}
