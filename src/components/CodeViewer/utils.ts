import { filesize } from 'filesize'
import numeral from 'numeral' // @ts-ignore

export function roundToDynamicPrecision(num: number) {
  const validNum = Number(num)
  if (isNaN(validNum)) return 0
  if (validNum === 0) return 0

  const absNum = Math.abs(validNum)
  const scale = Math.floor(Math.log10(absNum))

  const numDecimals = (validNum.toString().split('.')[1] || '').length

  const basePrecision = scale >= 1 ? 0 : Math.max(0, -scale + 1)
  const finalPrecision = Math.min(
    3,
    Math.round((basePrecision + numDecimals) / 2)
  )
  return Number(validNum.toFixed(finalPrecision))
}

export function nonNullType(type: string) {
  type = type.trim()
  if (type.startsWith('Nullable(')) {
    return type.slice(9, -1)
  }
  return type
}

export function roundByScale(num: number) {
  const absNum = Math.abs(num) // incase -
  const scale = absNum === 0 ? 0 : Math.floor(Math.log10(absNum)) // ensures we round to a value appropriate for scale
  const precision = Math.max(0, -scale)
  return Number(num.toFixed(precision))
}

export function base64Decode(base64: string): string {
  // Convert URL-safe base64 back to regular base64
  const base64String = base64.replace(/-/g, '+').replace(/_/g, '/')
  // Add padding if necessary
  const paddedBase64String = base64String.padEnd(
    base64String.length + ((4 - (base64String.length % 4)) % 4),
    '='
  )
  const binaryString = atob(paddedBase64String)
  const utf8Bytes = Uint8Array.from(binaryString, (char) => char.charCodeAt(0))
  const decodedText = new TextDecoder().decode(utf8Bytes)
  return decodedText
}

export function formatReadableRows(rows: number): string {
  if (rows < 1000) return rows.toString() // Return as is if less than 1,000
  return numeral(rows).format('0.[0]a') // Converts to K, M, B with one decimal if needed
}

export function formatBytes(bytes: number): string {
  return filesize(bytes, { base: 2, standard: 'jedec', spacer: '' })
}
