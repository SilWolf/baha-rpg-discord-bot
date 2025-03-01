import { BahaPost } from '@/services/baha/types/bahaPost.type'
import { getSheetDoc } from '.'
import { BahaPostForGoogleSheet } from './types/bahaPostForGoogleSheet'

export const getMasterSheetDoc = async () => {
  if (!process.env.GOOGLE_SHEET_MASTER_FILE_ID) {
    throw new Error('Missing env: GOOGLE_SHEET_MASTER_FILE_ID')
  }

  return getSheetDoc(process.env.GOOGLE_SHEET_MASTER_FILE_ID)
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
      createdAt: post.ctimeDate.toISOString(),
    })
  )

  const res = await sheet.addRows(bahaPostsForGoogleSheet)

  return res
}

export const getPostsFromMasterListingSheet = async (
  limit = 100,
  offset = 0
) => {
  const sheet = await getListingSheetOfMasterSheetDoc()

  return sheet.getRows({ limit, offset })
}
