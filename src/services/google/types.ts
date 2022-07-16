export type DriveFile = {
  id: string
}

export type SpreadSheetProperties = {
  title: string
}

export type Sheet = {
  properties: {
    index: number
    sheetId: string
    sheetType: string
    title: string
  }
}

export type SpreadSheet = {
  properties: SpreadSheetProperties
  sheets: Array<Sheet>
}

export type SpreadSheetValueRange = {
  majorDirection: string
  range: string
  values: Array<Array<string>>
}

export type SpreadSheetBatchGet = {
  spreadSheetId: string
  valueRanges: Array<SpreadSheetValueRange>
}
