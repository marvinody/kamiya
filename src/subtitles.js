const { stringifySync } = require('subtitle')
const { DELAY_BETWEEN_AUDIO, staging } = require('../config')
const path = require('path');
const fs = require('fs/promises');
const logger = require('./util/logger');

const generateSubtitles = async (audioData) => {
  logger.debug(`Generating subtitles`);
  const { list } = audioData.reduce((acc, cur) => {
    const duration = cur.duration * 1000;
    const caption = {
      type: 'cue',
      data: {
        start: acc.runningTotal,
        end: acc.runningTotal + duration + DELAY_BETWEEN_AUDIO/2,
        text: `>${cur.text.slice(0, -1)}`,
      }
    };
    // mutating cur, not suggested
    cur.delay = acc.runningTotal;

    acc.list.push(caption);
    acc.runningTotal += duration + DELAY_BETWEEN_AUDIO;
    return acc;
  }, {
    list: [],
    runningTotal: 0,
  })

  const srtString = stringifySync(list, {
    format: 'SRT'
  });

  const subfile = path.join(staging, 'captions.srt');
  logger.debug(`Writing subtitle file`);
  await fs.writeFile(subfile, srtString);

  return subfile;
}

module.exports = {
  generateSubtitles,
}