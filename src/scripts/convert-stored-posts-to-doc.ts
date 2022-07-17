/* eslint-disable no-await-in-loop */
import 'dotenv/config'
import { getGoogleDoc } from '@/services/google/doc.api'
import { getAllComments } from '@/services/baha/comment.api'
import { GoogleDocRequest } from '@/services/google/types/bahaPostForGoogleDoc'
import { getPost } from '@/services/baha/post.api'
import googleDrive from '@/services/google/drive.api'
import { BahaPost } from '@/services/baha/types/bahaPost.type'

const COLORS: { red: number; green: number; blue: number }[] = [
  { red: 27 / 255, green: 45 / 255, blue: 148 / 255 },
  { red: 148 / 255, green: 27 / 255, blue: 27 / 255 },
  { red: 163 / 255, green: 123 / 255, blue: 28 / 255 },
  { red: 28 / 255, green: 163 / 255, blue: 39 / 255 },
  { red: 28 / 255, green: 163 / 255, blue: 156 / 255 },
  { red: 147 / 255, green: 28 / 255, blue: 163 / 255 },
  { red: 163 / 255, green: 156 / 255, blue: 28 / 255 },
  { red: 84 / 255, green: 126 / 255, blue: 161 / 255 },

  { red: 41 / 255, green: 145 / 255, blue: 110 / 255 },
  { red: 145 / 255, green: 41 / 255, blue: 93 / 255 },
  { red: 145 / 255, green: 72 / 255, blue: 41 / 255 },
  { red: 41 / 255, green: 129 / 255, blue: 145 / 255 },

  { red: 14 / 255, green: 28 / 255, blue: 99 / 255 },
  { red: 99 / 255, green: 14 / 255, blue: 14 / 255 },
  { red: 18 / 255, green: 77 / 255, blue: 22 / 255 },
  { red: 77 / 255, green: 56 / 255, blue: 17 / 255 },
  { red: 89 / 255, green: 19 / 255, blue: 88 / 255 },
  { red: 19 / 255, green: 62 / 255, blue: 89 / 255 },
  { red: 53 / 255, green: 89 / 255, blue: 19 / 255 },
  { red: 19 / 255, green: 89 / 255, blue: 41 / 255 },
]

const storePostAsPlaintextToGoogleDoc = async (post: BahaPost) => {
  if (!process.env.GOOGLE_DRIVE_POSTS_PLAINTEXT_FOLDER_ID) {
    throw new Error('missing env: GOOGLE_DRIVE_POSTS_PLAINTEXT_FOLDER_ID')
  }

  const createdDoc = await googleDrive.createDoc(
    `${post.id} - ${post.title} (${post.ctimeDate.toLocaleDateString()})`,
    {
      parentFolderId: process.env.GOOGLE_DRIVE_POSTS_PLAINTEXT_FOLDER_ID,
    }
  )
  if (!createdDoc?.data?.id) {
    throw new Error('Failed to create doc')
  }

  // const doc = getGoogleDoc('16ZKYROfAG3wlL4GTH86B2qvGOU7SaQqRBlBmhj5zzVo')
  const doc = getGoogleDoc(createdDoc.data.id)

  const comments = await getAllComments(post.id)
  const authorIdColorMap: Record<
    string,
    { red: number; green: number; blue: number }
  > = {
    [post.publisher.id]: { red: 0, green: 0, blue: 0 },
  }

  const getColorByAuthorId = (authorId: string) => {
    if (!authorIdColorMap[authorId]) {
      const index = Object.keys(authorIdColorMap).length % COLORS.length
      authorIdColorMap[authorId] = COLORS[index]
    }

    return authorIdColorMap[authorId]
  }

  const requests: GoogleDocRequest[] = []

  for (let i = comments.length - 1; i >= 0; i -= 1) {
    const comment = comments[i]
    const text = comment.text
    const newRequests: GoogleDocRequest[] = []
    const replacements: {
      start: number
      end: number
      oldText: string
      newText: string
      type: 'image' | 'url'
    }[] = []

    // 1. Find all ![*](*) and add to replacements as image or url
    // eslint-disable-next-line no-restricted-syntax
    for (const match of comment.text.matchAll(/!?\[([^\]]*)\]\(([^)]+)\)/g)) {
      if (typeof match.index !== 'undefined') {
        replacements.push({
          start: match.index,
          end: match.index + match[0].length,
          oldText: match[0],
          newText: match[2].replace('&amp;', '&'),
          type: 'url',
          // type: match[0][0] === '!' ? 'image' : 'url',
        })
      }
    }

    // finally. convert replacements to GoogleDocRequests
    replacements.sort((a, b) => a.start - b.start)
    let newText = text

    for (let rI = 0; rI < replacements.length; rI += 1) {
      const replacement = replacements[rI]
      newText =
        newText.substring(0, replacement.start) +
        replacement.newText +
        newText.substring(replacement.end)

      const offset = replacement.newText.length - replacement.oldText.length
      replacement.end += offset

      for (let rJ = rI + 1; rJ < replacements.length; rJ += 1) {
        replacements[rJ].start += offset
        replacements[rJ].end += offset
      }

      if (replacement.type === 'url') {
        newRequests.push({
          updateTextStyle: {
            textStyle: {
              link: {
                url: replacement.newText,
              },
            },
            range: {
              startIndex: replacement.start + 1,
              endIndex: replacement.end + 1,
            },
            fields: 'link',
          },
        })
      } else if (replacement.type === 'image') {
        newRequests.push({
          insertInlineImage: {
            uri: replacement.newText,
            objectSize: {
              height: {
                magnitude: 144,
                unit: 'PT',
              },
            },
            location: {
              index: replacement.start + 1,
            },
          },
        })
      }
    }

    newRequests.unshift(
      {
        insertText: {
          text: newText,
          location: {
            index: 1,
          },
        },
      },
      {
        updateTextStyle: {
          textStyle: {
            bold: false,
            foregroundColor: {
              color: { rgbColor: getColorByAuthorId(comment.authorId) },
            },
          },
          range: {
            startIndex: 1,
            endIndex: 1 + newText.length,
          },
          fields: 'bold,foregroundColor',
        },
      }
    )

    // Insert 2 new lines
    newRequests.unshift({
      insertText: {
        text: `\n\n\n`,
        location: {
          index: 1,
        },
      },
    })

    // Insert authorName
    newRequests.push(
      {
        insertText: {
          text: `${comment.authorName}:\n`,
          location: {
            index: 1,
          },
        },
      },
      {
        updateTextStyle: {
          textStyle: {
            bold: true,
            foregroundColor: {
              color: { rgbColor: getColorByAuthorId(comment.authorId) },
            },
          },
          range: {
            startIndex: 1,
            endIndex: 1 + comment.authorName.length + 1,
          },
          fields: 'bold,foregroundColor',
        },
      }
    )

    requests.push(...newRequests)
  }

  // Add post details (headers, date, etc.)
  requests.push(
    {
      insertText: {
        text: `\n\n\n\n`,
        location: {
          index: 1,
        },
      },
    },
    {
      insertText: {
        text: post.content,
        location: {
          index: 1,
        },
      },
    },
    {
      updateTextStyle: {
        textStyle: {
          bold: false,
          fontSize: {
            magnitude: 13,
            unit: 'PT',
          },
        },
        range: {
          startIndex: 1,
          endIndex: 1 + post.content.length,
        },
        fields: 'bold,fontSize',
      },
    },
    {
      insertText: {
        text: `${post.publisher.name}:\n`,
        location: {
          index: 1,
        },
      },
    },
    {
      updateTextStyle: {
        textStyle: {
          bold: true,
        },
        range: {
          startIndex: 1,
          endIndex: 1 + post.publisher.name.length + 1,
        },
        fields: 'bold',
      },
    }
  )

  // Create Header and Footer and then edit it
  const [headerId, footerId] = await doc
    .batchUpdate([
      {
        createHeader: {
          type: 'DEFAULT',
        },
      },
      {
        createFooter: {
          type: 'DEFAULT',
        },
      },
    ])
    .then((res) => {
      if (!res.data.replies) {
        return [undefined, undefined]
      }

      return [
        res.data.replies[0].createHeader?.headerId,
        res.data.replies[1].createFooter?.footerId,
      ]
    })

  if (headerId) {
    const text = `${post.id} - ${
      post.title
    } (${post.ctimeDate.toLocaleDateString()})`

    requests.push(
      {
        insertText: {
          location: {
            segmentId: headerId,
            index: 0,
          },
          text,
        },
      },
      {
        updateTextStyle: {
          textStyle: {
            fontSize: {
              magnitude: 9,
              unit: 'PT',
            },
          },
          range: {
            segmentId: headerId,
            startIndex: 0,
            endIndex: text.length + 1,
          },
          fields: 'fontSize',
        },
      }
    )
  }

  if (footerId) {
    const text = post.bahaUrl
    requests.push(
      {
        insertText: {
          location: {
            segmentId: footerId,
            index: 0,
          },
          text,
        },
      },
      {
        updateTextStyle: {
          textStyle: {
            fontSize: {
              magnitude: 9,
              unit: 'PT',
            },
          },
          range: {
            segmentId: footerId,
            startIndex: 0,
            endIndex: text.length + 1,
          },
          fields: 'fontSize',
        },
      }
    )
  }

  await doc.batchUpdate(requests)
}

const main = async () => {
  const post = await getPost('27038713')

  try {
    console.log(`start storePostAsPlaintextToGoogleDoc (postId=${post.id})`)
    await storePostAsPlaintextToGoogleDoc(post)
    console.log(`finish storePostAsPlaintextToGoogleDoc (postId=${post.id})`)
  } catch (e: any) {
    console.log(`When storePostAsPlaintextToGoogleDoc: ${e.message}`)
  }

  // TODO: update master sheet with new file's URL

  console.log('ALL DONE!')
}

main()
