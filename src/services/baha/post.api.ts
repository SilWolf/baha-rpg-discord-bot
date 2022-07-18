import { BahaPost, BahaPostRaw } from './types/bahaPost.type'
import api, { BahaAPIResponse } from '.'

let cachedlastPostId: string | undefined

const convertBahaPostRawToBahaPost = (bahaPostRaw: BahaPostRaw): BahaPost => ({
  id: bahaPostRaw.id,
  publisher: bahaPostRaw.publisher,
  title: bahaPostRaw.content
    .split('\n')
    .filter((contentSector: string) => !!contentSector)[0],
  content: bahaPostRaw.content,
  ctime: bahaPostRaw.ctime,
  to: bahaPostRaw.to,
  urlPreview: Array.isArray(bahaPostRaw.urlPreview)
    ? undefined
    : bahaPostRaw.urlPreview,
  bahaUrl: `https://guild.gamer.com.tw/post_detail.php?gsn=${bahaPostRaw.to.gsn}&sn=${bahaPostRaw.id}`,
  eternalUrl: `https://www.isaka.idv.tw/History/viewMsg.html?sn=${bahaPostRaw.id}`,
  ctimeDate: new Date(bahaPostRaw.ctime),
})

export const getPostsRawResponse = async (lastSn?: string) =>
  api
    .get<BahaAPIResponse<{ lastSn: string; postList: BahaPostRaw[][] }>>(
      '/guild/v1/post_list.php',
      {
        params: {
          gsn: 3014,
          last: lastSn,
        },
      }
    )
    .then((res) => res.data.data)

export const getPostsWithLastSn = async (
  lastSn?: string
): Promise<{ lastSn: string; posts: BahaPost[] }> =>
  getPostsRawResponse(lastSn).then((res) => {
    if (!res) {
      throw new Error('Error in getPostsRawResponse')
    }

    const rawPosts = res.postList ?? []
    if (rawPosts.length === 0) {
      return { lastSn: res.lastSn, posts: [] }
    }

    const posts = []

    for (let i = 0; i < rawPosts.length; i += 1) {
      const rawPost = rawPosts[i][0]
      if (rawPost) {
        posts.push(convertBahaPostRawToBahaPost(rawPost))
      }
    }

    return { lastSn: res.lastSn, posts }
  })

export const getPosts = async (lastSn?: string): Promise<BahaPost[]> =>
  getPostsWithLastSn(lastSn).then((res) => res.posts)

export const getNewPosts = async (): Promise<BahaPost[]> => {
  const posts = await getPosts().then((_posts) =>
    cachedlastPostId
      ? _posts.filter((post) => post.id > (cachedlastPostId as string))
      : _posts
  )

  if (posts.length > 0) {
    cachedlastPostId = posts[0].id
  }

  return posts
}

export const getPost = async (postId: string): Promise<BahaPost> =>
  api
    .get<BahaAPIResponse<BahaPostRaw>>('/guild/v1/post_detail.php', {
      params: {
        gsn: 3014,
        messageId: postId,
      },
    })
    .then((res) => convertBahaPostRawToBahaPost(res.data.data))
