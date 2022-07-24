/* eslint-disable no-await-in-loop */
import 'dotenv/config'
import { getGoogleDoc } from '@/services/google/doc.api'
import { getAllComments } from '@/services/baha/comment.api'
import { GoogleDocRequest } from '@/services/google/types/bahaPostForGoogleDoc'
import { getPost } from '@/services/baha/post.api'
import googleDrive from '@/services/google/drive.api'
import { BahaPost } from '@/services/baha/types/bahaPost.type'
import { getPostsFromMasterListingSheet } from '@/services/google/sheet.api'
import { BahaPostForGoogleSheet } from '@/services/google/types/bahaPostForGoogleSheet'

import storePostAsPlaintextToGoogleDoc from './components/store-post-as-plaintext-to-google-doc'
import storePostAsSpreadsheetToGoogleDoc from './components/store-post-as-sheet-to-google-doc'

const main = async () => {
  const STEP = 500
  let offset = 1450

  const OLD_FOLDER_ID = process.env
    .GOOGLE_DRIVE_POSTS_PLAINTEXT_FOLDER_ID as string
  const NEW_FOLDER_ID = '1tZS6kG4zKtUsZ0XIT8yTUjXCJUUJoNtA'

  while (offset < 15000) {
    const rows = await getPostsFromMasterListingSheet(STEP, offset)
    if (rows.length === 0) {
      break
    }

    for (let i = 0; i < rows.length; i += 1) {
      if (rows[i].id && rows[i].plaintextDocUrl) {
        const fileId = rows[i].plaintextDocUrl.split('/')[5]

        console.log(`moving ${fileId}`)
        await googleDrive.moveFileFromFolderToFolder(
          fileId,
          OLD_FOLDER_ID,
          NEW_FOLDER_ID
        )
      }
    }

    offset += STEP
  }

  console.log('ALL DONE!')
}

main()
