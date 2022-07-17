/* eslint-disable no-underscore-dangle */
/* eslint-disable camelcase */

import {
  auth as googleAuth,
  drive_v3,
  drive as googleDrive,
} from '@googleapis/drive'

class GoogleDrive {
  _instance: drive_v3.Drive

  constructor() {
    if (!process.env.GOOGLE_CLIENT_EMAIL) {
      throw new Error('missing env: GOOGLE_CLIENT_EMAIL')
    }

    if (!process.env.GOOGLE_PRIVATE_KEY) {
      throw new Error('missing env: GOOGLE_PRIVATE_KEY')
    }

    const auth = new googleAuth.GoogleAuth({
      scopes: [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/drive.file',
      ],
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
    })

    this._instance = googleDrive({
      version: 'v3',
      auth,
    })
  }

  getInstance() {
    return this._instance
  }

  createFolder(folderName: string, options?: { parentFolderId?: string }) {
    const requestBody: drive_v3.Schema$File = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
    }

    if (options?.parentFolderId) {
      requestBody.parents = [options.parentFolderId]
    }

    return this._instance.files.create({
      requestBody,
      fields: 'id',
    })
  }

  createDoc(docName: string, options?: { parentFolderId?: string }) {
    const requestBody: drive_v3.Schema$File = {
      name: docName,
      mimeType: 'application/vnd.google-apps.document',
    }

    if (options?.parentFolderId) {
      requestBody.parents = [options.parentFolderId]
    }

    return this._instance.files.create({
      requestBody,
      fields: 'id',
    })
  }
}

const thisGoogleDrive = new GoogleDrive()

export default thisGoogleDrive
