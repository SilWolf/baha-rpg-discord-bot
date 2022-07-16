import { Post, PostRaw } from '@/types/baha/post.type'
import api, { BahaAPIResponse } from '.'
import { postLogin } from './auth.api'

let cachedlastPostId: string | undefined

export const getPosts = async (lastPostId?: string): Promise<Post[]> => {
  const fn = () =>
    api
      .get<BahaAPIResponse<{ lastSn: string; postList: PostRaw[][] }>>(
        '/guild/v1/post_list.php',
        {
          params: {
            gsn: 3014,
          },
        }
      )
      .then((res) => {
        if (!res.data.data) {
          return []
        }

        const rawPosts = res.data.data.postList ?? []
        if (rawPosts.length === 0) {
          return []
        }

        const posts = []

        for (let i = 0; i < rawPosts.length; i += 1) {
          const rawPost = rawPosts[i][0]
          if (rawPost) {
            if (lastPostId && lastPostId <= rawPost?.id) {
              break
            }

            posts.push({
              id: rawPost.id,
              publisher: rawPost.publisher,
              content: rawPost.content,
              ctime: rawPost.ctime,
              to: rawPost.to,
              urlPreview: Array.isArray(rawPost.urlPreview)
                ? undefined
                : rawPost.urlPreview,
            })
          }
        }

        if (posts.length > 0) {
          cachedlastPostId = posts[0].id
        }

        return posts
      })

  try {
    const posts = await fn()
    return posts
  } catch (e) {
    // await postLogin()
    console.log(e)
    // const posts = await fn()
    return []
  }
}

export const getNewPosts = (): Promise<Post[]> => getPosts(cachedlastPostId)

export default {}
