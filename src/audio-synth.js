const { promisify } = require('util');
const exec = promisify(require('child_process').exec);
const { getAudioDurationInSeconds } = require('get-audio-duration');
const config = require('./config');
const path = require('path');

const splitTextIntoLines = (input) => {
  return input
    .split('\n')
    .filter(s => s.length > 0)
    .map(s => s[0] === '>' ? s.slice(1) : s)
    .map(s => s.substr(-1) === '.' ? s : s + '.')
    .map(s => s.replace(/"/g, "'"))
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
  console.info(`Generating audio`)
  const lines = splitTextIntoLines(input);
  const linesToSpeak = postTransform(lines)

  const linesWithMeta = [];

  let runningTotal = 0;
  for (const [idx, line] of lines.entries()) {
    const lineToSpeak = linesToSpeak[idx]
    // console.debug(`Generating audio for ${line}`)
    const file = await generateLineWithSay(lineToSpeak, idx);
    // console.debug(`\tDetermining audio duration`)
    const duration = await findDuration(file);

    linesWithMeta.push({
      text: line,
      spokenText: lineToSpeak,
      idx,
      mp3: file,
      duration,
    })

    runningTotal += duration + config.DELAY_BETWEEN_AUDIO/1000;
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