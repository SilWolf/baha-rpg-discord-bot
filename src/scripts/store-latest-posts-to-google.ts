import 'dotenv/config'
import { getNewPosts } from '@/services/baha/post.api'
import { appendPostsToMasterSheet } from '@/services/google/sheet.api'

const main = async () => {
  // Get Posts
  const latestPosts = await getNewPosts()
  const res = await appendPostsToMasterSheet(latestPosts)
}

main()
