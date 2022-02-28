const gclef = ''
const bclef = ''
const whole_note = ''
const half_note = ''
const quarter_note = ''
const brace = ''

const zero_time = ''
const one_time = ''
const two_time = ''
const three_time = ''
const four_time = ''
const five_time = ''
const six_time = ''
const seven_time = ''
const eight_time = ''
const nine_time = ''
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
