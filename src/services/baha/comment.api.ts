import api, { BahaAPIResponse } from '.'
import { BahaComment, BahaCommentRaw } from './types/bahaComment.type'

let cachedlastCommentId: string | undefined

export const getCommentsRawResponse = async (
  postId: string,
  options?: { page?: number; getAll?: boolean }
) => {
  const params: Record<string, string | number> = {
    gsn: 3014,
    messageId: postId,
  }

  if (options?.page) {
    params.page = options.page
  }

  if (options?.getAll) {
    params.all = ''
  }

  return api
    .get<
      BahaAPIResponse<{
        commentCount: number
        nextPage: number
        totalPage: number
        comments: BahaCommentRaw[]
      }>
    >('/guild/v1/comment_list.php', {
      params,
    })
    .then((res) => res.data.data)
}

export const getCommentsResponse = async (
  postId: string,
  options?: { page?: number; getAll?: boolean }
): Promise<{
  commentCount: number
  nextPage: number
  totalPage: number
  comments: BahaComment[]
}> =>
  getCommentsRawResponse(postId, options).then((res) => {
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
  options?: { page?: number; getAll?: boolean }
): Promise<BahaComment[]> =>
  getCommentsResponse(postId, options).then((res) => res.comments)

export const getAllComments = async (postId: string) =>
  getComments(postId, { getAll: true })

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
