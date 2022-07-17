import { BahaPost, BahaPostRaw } from './types/bahaPost.type'
import api, { BahaAPIResponse } from '.'

let cachedlastPostId: string | undefined

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
        posts.push({
          id: rawPost.id,
          publisher: rawPost.publisher,
          title: rawPost.content
            .split('\n')
            .filter((contentSector: string) => !!contentSector)[0],
          content: rawPost.content,
          ctime: rawPost.ctime,
          to: rawPost.to,
          urlPreview: Array.isArray(rawPost.urlPreview)
            ? undefined
            : rawPost.urlPreview,
          bahaUrl: `https://guild.gamer.com.tw/post_detail.php?gsn=${rawPost.to.gsn}&sn=${rawPost.id}`,
          eternalUrl: `https://www.isaka.idv.tw/History/viewMsg.html?sn=${rawPost.id}`,
          ctimeDate: new Date(rawPost.ctime),
        })
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
