import api, { BahaAPIResponse } from '.'
import { BahaComment, BahaCommentRaw } from './types/bahaComment.type'

let cachedlastCommentId: string | undefined

export const getCommentsRawResponse = async (postId: string, page?: number) =>
  api
    .get<
      BahaAPIResponse<{
        commentCount: number
        nextPage: number
        totalPage: number
        comments: BahaCommentRaw[]
      }>
    >('/guild/v1/comment_list.php', {
      params: {
        gsn: 3014,
        messageId: postId,
        page,
      },
    })
    .then((res) => res.data.data)

export const getCommentsResponse = async (
  postId: string,
  page?: number
): Promise<{
  commentCount: number
  nextPage: number
  totalPage: number
  comments: BahaComment[]
}> =>
  getCommentsRawResponse(postId, page).then((res) => {
    if (!res) {
      throw new Error('Error in getCommentsRawResponse')
    }

    return {
      ...res,
      comments: res.comments.map(({ name, userid, ...comment }) => ({
        ...comment,
        authorName: name,
        authorId: userid,
        plainText: comment.text,
      })),
    }
  })

export const getComments = async (
  postId: string,
  page?: number
): Promise<BahaComment[]> =>
  getCommentsResponse(postId, page).then((res) => res.comments)

export const getAllComments = async (postId: string) => {
  const { totalPage } = await getCommentsRawResponse(postId)

  if (totalPage === 0) {
    return []
  }

  return Promise.all(
    new Array(totalPage)
      .fill(undefined)
      .map((_, i) => getComments(postId, i + 1))
  ).then((allComments) =>
    allComments.reduce((prev, comments) => [...prev, ...comments], [])
  )
}

export const getNewComments = async (
  postId: string
): Promise<BahaComment[]> => {
  const comments = await getComments(postId).then((_comments) =>
    cachedlastCommentId
      ? _comments.filter(
          (comment) => comment.id > (cachedlastCommentId as string)
        )
      : _comments
  )

  if (comments.length > 0) {
    cachedlastCommentId = comments[0].id
  }

  return comments
}
