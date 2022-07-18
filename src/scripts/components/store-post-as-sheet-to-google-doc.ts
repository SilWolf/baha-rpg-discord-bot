/* eslint-disable no-await-in-loop */
import 'dotenv/config'
import { getAllComments } from '@/services/baha/comment.api'
import googleDrive from '@/services/google/drive.api'
import { BahaPost } from '@/services/baha/types/bahaPost.type'
import { getGoogleSpreadsheet } from '@/services/google/spreadsheet.api'

const storePostAsSpreadsheetToGoogleDoc = async (post: BahaPost) => {
  if (!process.env.GOOGLE_SHEET_TEMPLATE_FILE_ID) {
    throw new Error('missing env: GOOGLE_SHEET_TEMPLATE_FILE_ID')
  }

  if (!process.env.GOOGLE_DRIVE_POSTS_TEMP_FOLDER_ID) {
    throw new Error('missing env: GOOGLE_DRIVE_POSTS_TEMP_FOLDER_ID')
  }

  if (!process.env.GOOGLE_DRIVE_POSTS_SHEET_FOLDER_ID) {
    throw new Error('missing env: GOOGLE_DRIVE_POSTS_SHEET_FOLDER_ID')
  }

  const createdSpreadsheet = await googleDrive.copyFile(
    process.env.GOOGLE_SHEET_TEMPLATE_FILE_ID,
    {
      name: `${post.id} - ${
        post.title
      } (${post.ctimeDate.toLocaleDateString()})`,
      parents: [process.env.GOOGLE_DRIVE_POSTS_TEMP_FOLDER_ID],
    }
  )
  if (!createdSpreadsheet?.id) {
    throw new Error('Failed to create sheet doc')
  }

  const spreadsheet = await getGoogleSpreadsheet(createdSpreadsheet.id)
  await spreadsheet.load()

  const infoSheet = spreadsheet
    .getInstance()
    ?.sheets?.find((sheet) => sheet.properties?.title === '資料')
  if (!infoSheet?.properties?.sheetId) {
    throw new Error(`Cannot get infoSheet (postId=${post.id})`)
  }

  const commentsSheet = spreadsheet
    .getInstance()
    ?.sheets?.find((sheet) => sheet.properties?.title === '回覆')
  if (!commentsSheet?.properties?.sheetId) {
    throw new Error(`Cannot get commentsSheet (postId=${post.id})`)
  }

  // Store post info
  spreadsheet.updateCells(
    {
      sheetId: infoSheet.properties.sheetId,
      startRowIndex: 0,
      endRowIndex: 5,
      startColumnIndex: 1,
      endColumnIndex: 2,
    },
    [
      {
        values: [
          {
            userEnteredValue: {
              stringValue: post.id,
            },
          },
        ],
      },
      {
        values: [
          {
            userEnteredValue: {
              stringValue: post.publisher.name,
            },
          },
        ],
      },
      {
        values: [
          {
            userEnteredValue: {
              stringValue: post.publisher.id,
            },
          },
        ],
      },
      {
        values: [
          {
            userEnteredValue: {
              stringValue: post.content,
            },
          },
        ],
      },
      {
        values: [
          {
            userEnteredValue: {
              stringValue: post.ctimeDate.toLocaleString(),
            },
          },
        ],
      },
    ]
  )

  const comments = await getAllComments(post.id)

  // Store comments
  spreadsheet.addRows(
    commentsSheet.properties?.sheetId,
    comments.map((comment, i) => ({
      values: [
        {
          userEnteredValue: {
            stringValue: comment.id,
          },
        },
        {
          userEnteredValue: {
            stringValue: comment.authorName,
          },
        },
        {
          userEnteredValue: {
            stringValue: comment.authorId,
          },
        },
        {
          userEnteredValue: {
            numberValue: i + 1,
          },
        },
        {
          userEnteredValue: {
            stringValue: comment.text,
          },
        },
        {
          userEnteredValue: {
            stringValue: new Date(comment.ctime).toLocaleString(),
          },
        },
      ],
    }))
  )

  await spreadsheet.execute()

  await googleDrive.moveFileFromFolderToFolder(
    createdSpreadsheet.id,
    process.env.GOOGLE_DRIVE_POSTS_TEMP_FOLDER_ID,
    process.env.GOOGLE_DRIVE_POSTS_SHEET_FOLDER_ID
  )

  return createdSpreadsheet
}

export default storePostAsSpreadsheetToGoogleDoc
