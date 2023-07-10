const path = require('path');
const { TTS_SAY, TTS_WEIBYTE } = require('./src/constants')

module.exports = {
  staging: path.join(__dirname, 'staging'),
  bgs: path.join(__dirname, 'backgrounds'),
  inputs: path.join(__dirname, 'inputs'),
  outputs: path.join(__dirname, 'outputs'),
  DELAY_BETWEEN_AUDIO: 500,
  MAX_LENGTH: 60000,
  ai: {
    OPENAI_KEY: process.env.OPENAI_KEY,
    model: 'gpt-3.5-turbo',
  },
  tiktok: {
    client_key: process.env.TIKTIK_PK,
    client_secret: process.env.TIKTIK_SK,
    port: 5000,
  },
  TTS_GENERATION: TTS_WEIBYTE,
}