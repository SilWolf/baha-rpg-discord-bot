import { BahaPost } from '@/services/baha/types/bahaPost.type' /* eslint-disable camelcase */

import { sheets_v4 } from '@googleapis/sheets'

export type GoogleSpreadsheetRequest = sheets_v4.Schema$Request

export type BahaPostForGoogleSheet = Pick<
  BahaPost,
  'id' | 'title' | 'bahaUrl' | 'eternalUrl' | 'content'
> & {
  authorName: string
  authorId: string
  createdAt: string
  plaintextDocUrl?: string
}
