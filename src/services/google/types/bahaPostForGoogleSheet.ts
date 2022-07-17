import { BahaPost } from '@/services/baha/types/bahaPost.type'

export type BahaPostForGoogleSheet = Pick<
  BahaPost,
  'id' | 'title' | 'bahaUrl' | 'eternalUrl' | 'content'
> & {
  authorName: string
  authorId: string
  createdAt: string
  plaintextDocUrl?: string
}
