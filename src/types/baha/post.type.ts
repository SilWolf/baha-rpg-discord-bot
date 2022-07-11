export type PostRawPublisher = {
  name: string
  id: string
  cover: string
  propic: string
  fansAvatar: string
  isPriorityFollow: boolean
}

export type PostRawGuild = {
  name: string
  id: string
  gsn: number
  privateType: number
  pic: string
}

export type PostRaw = {
  type: string
  service: number
  time: string // '07月04日 18:52 編輯'
  ctime: string // '2022-07-04 18:42:47'
  privacy: string
  likeCount: number
  dislikeCount: number
  commentCount: number
  shareCount: number
  id: string
  content: string
  publisher: PostRawPublisher
  to: PostRawGuild
  isOfficial: boolean
  officialType: number
  canCheckIn: boolean
  images: string[]
  imageType: string
  urlPreview: string
  tags: string[]
  mentions: string[]
  markFrom: string[]
  canShare: boolean
  isServerPost: boolean
  subtype: number
  isTopPost: boolean
  groupPage: string
  isVideo: boolean
  isLike: boolean
  likeDesc: string
  shareMessage: string[]
  feedDescription: string
  fansPageShare: string[]
  commented: string[]
  ParCommentCount: number
  contentImages: string[]
}

export type Post = Pick<PostRaw, 'id' | 'publisher' | 'content' | 'ctime'>
