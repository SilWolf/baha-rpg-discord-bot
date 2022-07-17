/* eslint-disable no-await-in-loop */
import 'dotenv/config'
import { getGoogleDoc } from '@/services/google/doc.api'

const main = async () => {
  const doc = getGoogleDoc('16ZKYROfAG3wlL4GTH86B2qvGOU7SaQqRBlBmhj5zzVo')
  await doc.prependTexts(['Line 1', 'Line 2', 'Line 3'])
}

main()
