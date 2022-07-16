import { BahaPost } from '@/services/baha/types/bahaPost.type'
import { getSpreadsheetDoc } from '.'
import { BahaPostForGoogleSheet } from './types/bahaPostForGoogleSheet'

export const getMasterSheetDoc = async () => {
  if (!process.env.GOOGLE_SHEET_MASTER_FILE_ID) {
    throw new Error('Missing env: GOOGLE_SHEET_MASTER_FILE_ID')
  }

  return getSpreadsheetDoc(process.env.GOOGLE_SHEET_MASTER_FILE_ID)
}

export const getListingSheetOfMasterSheetDoc = async () => {
  if (!process.env.GOOGLE_SHEET_MASTER_FILE_LISTING_SHEET_ID) {
    throw new Error('Missing env: GOOGLE_SHEET_MASTER_FILE_LISTING_SHEET_ID')
  }

  const doc = await getMasterSheetDoc()
  const sheet =
    doc.sheetsById[process.env.GOOGLE_SHEET_MASTER_FILE_LISTING_SHEET_ID]

  if (!sheet) {
    throw new Error('Cannot get listingmaster sheet')
  }

  return sheet
}

export const appendPostsToMasterSheet = async (posts: BahaPost[]) => {
  // if (posts.length === 0) {
  //   return
  // }

  const sheet = await getListingSheetOfMasterSheetDoc()

  const bahaPostsForGoogleSheet: BahaPostForGoogleSheet[] = posts.map(
    (post) => ({
      id: post.id,
      title: post.title,
      content: post.content,
      authorName: post.publisher.name,
      authorId: post.publisher.id,
      bahaUrl: post.bahaUrl,
      eternalUrl: post.eternalUrl,
    })
  )

  const res = await sheet.addRows(bahaPostsForGoogleSheet)

  return res
}
