/* eslint-disable no-await-in-loop */
import 'dotenv/config'
import { appendPostsToMasterSheet } from '@/services/google/sheet.api'
import { getPostsWithLastSn } from '@/services/baha/post.api'

const main = async () => {
  let cachedLastSn: string | undefined
  let i = 3500

  while (i > 0) {
    console.log(`load data (lastSn=${cachedLastSn})`)
    // Get Posts
    const { lastSn, posts } = await getPostsWithLastSn(cachedLastSn)
    await appendPostsToMasterSheet(posts)
    console.log(`stored data (lastSn=${cachedLastSn}, posts=${posts.length})`)

    if (!lastSn) {
      console.log('ALL DONE!')
      break
    } else {
      cachedLastSn = lastSn
    }

    i -= 1
  }
}

main()
