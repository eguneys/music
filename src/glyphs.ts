const gclef = '𝄞'
const bclef = '𝄢'
const half_note = '𝅘'
const whole_note = '𝅝'
const dbarline = '𝄁'
const brace = '𝄔'


const zero_time = '0'
const one_time = '1'
const two_time = '2'
const three_time = '3'
const four_time = '4'
const five_time = '5'
const six_time = '6'
const seven_time = '7'
const eight_time = '8'
const nine_time = '9'
const ten_time = one_time + zero_time
const twelve_time = one_time + two_time


export type GlyphMap = {
  [key: string]: string
}

export default {
  gclef,
  bclef,
  half_note,
  whole_note,
  dbarline,
  brace,
  zero_time,
  one_time,
  two_time,
  three_time,
  four_time,
  five_time,
  six_time,
  seven_time,
  eight_time,
  nine_time,
  ten_time,
  twelve_time,
} as GlyphMap
