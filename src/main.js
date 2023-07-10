const { promisify } = require('util');
const exec = promisify(require('child_process').exec);
const fs = require('fs/promises');
const { generateAudio, mixAudio } = require('./audio-synth');
const { generateSubtitles } = require('./subtitles');
const { generateVideo } = require('./video');
const { MAX_LENGTH, outputs } = require('../config');
const bgMetadata = require('../bg_metadata.json');
const { getInputs, videoExistsAlready } = require('./util/file-manager');
const path = require('path');
const logger = require('./util/logger');


(async () => {
  const inputs = await getInputs();

  logger.info('Going through all input files,')
  for (const input of inputs) {
    logger.info(`Parsing ${input.title}`);
    const output = path.join(outputs, `${input.title}.mp4`);
    
    if(await videoExistsAlready(output)) {
      logger.info(`${input.title} found to exist, skipping`)
      continue;
    }

    const { linesWithMeta: audioData, metadata } = await generateAudio(input.text);

    if (metadata.totalDuration * 1000 > MAX_LENGTH) {
      logger.info(`The video is estimated to be about ${metadata.totalDuration} seconds long. Stopping now`)
      return;
    }

    const subtitlePath = await generateSubtitles(audioData);

    const videoData = bgMetadata[0];


    await generateVideo({
      audioData,
      output,
      subtitlePath,
      videoData,
      duration: metadata.totalDuration,
      title: input.title,
    });

  }

})();

