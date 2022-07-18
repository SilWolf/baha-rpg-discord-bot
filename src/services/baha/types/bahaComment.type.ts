export type BahaCommentRawMention = {
  id: string
  offset: string
  length: string
}

export type BahaCommentRaw = {
  ctime: string
  id: string
  mentions: BahaCommentRawMention[]
  name: string
  position: number
  propic: string
  text: string
  userid: string
}

export type BahaComment = Omit<BahaCommentRaw, 'name' | 'userid'> & {
  authorId: string
  authorName: string
  plainText: string
}
