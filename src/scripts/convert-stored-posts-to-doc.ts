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
  const STEP = 50
  let offset = 0

  while (offset < 15000) {
    const rows = await getPostsFromMasterListingSheet(STEP, offset)
    if (rows.length === 0) {
      break
    }

    for (let i = 0; i < rows.length; i += 1) {
      if (rows[i].id) {
        let isRowUpdated = false
        try {
          const post = await getPost(rows[i].id)

          if (!rows[i].plaintextDocUrl) {
            // storePostAsPlaintextToGoogleDoc
            // try {
            //   console.log(
            //     `start storePostAsPlaintextToGoogleDoc (postId=${post.id})`
            //   )
            //   const plaintextDoc = await storePostAsPlaintextToGoogleDoc(post)
            //   console.log(
            //     `finish storePostAsPlaintextToGoogleDoc (postId=${post.id})`
            //   )
            //   rows[
            //     i
            //   ].plaintextDocUrl = `https://docs.google.com/document/d/${plaintextDoc.getDocId()}/edit?usp=sharing`
            //   isRowUpdated = true
            // } catch (e) {
            //   console.log(`When storePostAsPlaintextToGoogleDoc: ${e.message}`)
            // }
          }

          if (!rows[i].sheetDocUrl) {
            // storePostAsSpreadsheetToGoogleDoc
            try {
              console.log(
                `start storePostAsSpreadsheetToGoogleDoc (postId=${post.id})`
              )
              const sheetDoc = await storePostAsSpreadsheetToGoogleDoc(post)
              console.log(
                `finish storePostAsSpreadsheetToGoogleDoc (postId=${post.id})`
              )

              rows[
                i
              ].sheetDocUrl = `https://docs.google.com/spreadsheets/d/${sheetDoc.id}/edit#gid=0`
              isRowUpdated = true
            } catch (e: any) {
              console.log(
                `When storePostAsSpreadsheetToGoogleDoc: ${e.message}`
              )
            }
          }

          console.log(`refresh row record (postId=${post.id})`)
          if (isRowUpdated) {
            rows[i].save()
          }
        } catch (e: any) {
          console.log(`When looping: ${e.message}`)
        }
      }
    }

    offset += STEP
  }

  console.log('ALL DONE!')
}

main()
