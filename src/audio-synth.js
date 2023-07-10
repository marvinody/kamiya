const { promisify } = require('util');
const exec = promisify(require('child_process').exec);
const { getAudioDurationInSeconds } = require('get-audio-duration');
const config = require('../config');
const { TTS_SAY, TTS_WEIBYTE } = require('./constants')
const path = require('path');
const fs = require('fs/promises');
const { default: axios } = require('axios');
const logger = require('./util/logger');


const splitTextIntoLines = (input) => {
  return input
    .split('\n')
    .filter(s => s.length > 0)
    .map(s => s[0] === '>' ? s.slice(1) : s)
    .map(s => s.substr(-1) === '.' ? s : s + '.')
    .map(s => s.replace(/"/g, "'"))
    .map(s => s.trim())
    .map(s => s.replace(/\bclyde\b/i, "Anon"));
}

const postTransform = (lines) => {
  return lines
    .map(s => s.replace(/\bmfw\b/i, "my face when"))
}

const makeSayArgs = ({
  output,
  text,
  voice = "Daniel"
}) => {
  return [
    `"${text}"`,
    `-o ${output}`,
    `-v "${voice}"`,
  ]
}

const generateLineWithWeibyte = async (line, idx) => {
  const voice = 'en_us_001';

  const { data } = await axios.post(`https://tiktok-tts.weilnet.workers.dev/api/generation`, {
    text: line,
    voice,
  });

  if (data.success !== true) {
    throw new Error('Failed on weibyte generation')
  }

  const mp3 = path.join(config.staging, `idx-${idx.toString().padStart(3, '0')}.mp3`);
  await fs.writeFile(mp3, data.data, 'base64');

  return mp3;
}

const generateLineWithSay = async (line, idx) => {
  const aiff = path.join(config.staging, `idx-${idx.toString().padStart(3, '0')}.aiff`);
  const mp3 = path.join(config.staging, `idx-${idx.toString().padStart(3, '0')}.mp3`);

  const sayArgs = makeSayArgs({
    output: aiff,
    text: line,
  })
  const sayCmd = `say ${sayArgs.join(' ')}`;
  await exec(sayCmd);

  const lameCmd = `lame -m m ${aiff} ${mp3}`;
  await exec(lameCmd);

  return mp3;
};

const findDuration = async (file) => {
  const duration = await getAudioDurationInSeconds(file);
  return duration;
}

const generateAudio = async (input) => {
  logger.info(`Generating audio`)
  const lines = splitTextIntoLines(input);
  const linesToSpeak = postTransform(lines)

  const linesWithMeta = [];

  let runningTotal = 0;
  for (const [idx, line] of lines.entries()) {
    logger.debug(`Generating audio for ${line}`)
    const lineToSpeak = linesToSpeak[idx]
    let file;
    switch (config.TTS_GENERATION) {
      case TTS_WEIBYTE:
        file = await generateLineWithWeibyte(lineToSpeak, idx);
        break;
      case TTS_SAY:
        file = await generateLineWithSay(lineToSpeak, idx);
        break;
      default:
        throw new Error(`No TTS Generator found for ${config.TTS_GENERATION}`);
    }

    logger.debug(`\tDetermining audio duration`)
    const duration = await findDuration(file);

    linesWithMeta.push({
      text: line,
      spokenText: lineToSpeak,
      idx,
      mp3: file,
      duration,
    })

    runningTotal += duration + config.DELAY_BETWEEN_AUDIO / 1000;
  }

  return {
    linesWithMeta,
    metadata: {
      totalDuration: runningTotal,
    }
  };
}

module.exports = {
  generateAudio,
}