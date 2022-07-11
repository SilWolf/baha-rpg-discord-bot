import { Post, PostRaw } from '@/types/baha/post.type'
import api, { BahaAPIResponse } from '.'

let cachedLastSn: string | undefined

export const getPosts = (lastSn?: string): Promise<Post[]> =>
  api
    .get<BahaAPIResponse<{ lastSn: string; postList: PostRaw[][] }>>(
      '/guild/v1/post_list.php'
    )
    .then((res) => {
      if (!res.data.data?.lastSn) {
        return []
      }

      if (res.data.data?.lastSn === lastSn) {
        return []
      }

      const posts = (
        res.data.data?.postList?.map((postList: PostRaw[]) => {
          const post = postList[0]
          if (!post) {
            return undefined
          }

          return {
            id: post.id,
            publisher: post.publisher,
            content: post.content,
            ctime: post.ctime,
          } as Post
        }) ?? []
      ).filter((post: Post | undefined) => !!post) as Post[]

      cachedLastSn = res.data.data?.lastSn

      return posts
    })

export const getNewPosts = (): Promise<Post[]> => getPosts(cachedLastSn)

export default {}
