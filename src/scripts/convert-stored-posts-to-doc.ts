/* eslint-disable no-await-in-loop */
import 'dotenv/config'
import { getGoogleDoc } from '@/services/google/doc.api'
import { getAllComments } from '@/services/baha/comment.api'

const main = async () => {
  const doc = getGoogleDoc('16ZKYROfAG3wlL4GTH86B2qvGOU7SaQqRBlBmhj5zzVo')

  const comments = await getAllComments('27038713')

  await doc.prependTexts(
    comments.map(({ authorName, plainText }) => `${authorName}:\n${plainText}`)
  )
}

main()
