const { promisify } = require('util');
const exec = promisify(require('child_process').exec);
const fs = require('fs/promises');
const { generateAudio, mixAudio } = require('./audio-synth');
const { generateSubtitles } = require('./subtitles');
const { generateVideo } = require('./video');
const { MAX_LENGTH, outputs } = require('./config');
const bgMetadata = require('../bg_metadata.json');
const { getInputs, videoExistsAlready } = require('./file-manager');
const path = require('path');



(async () => {
  const inputs = await getInputs();

  console.info('Going through all input files,')
  for (const input of inputs) {
    console.info(`Parsing ${input.title}`);
    const output = path.join(outputs, `${input.title}.mp4`);
    
    if(videoExistsAlready(output)) {
      console.info(`${input.title} found to exist, skipping`)
      continue;
    }

    const { linesWithMeta: audioData, metadata } = await generateAudio(input.text);

    if (metadata.totalDuration * 1000 > MAX_LENGTH) {
      console.info(`The video is estimated to be about ${metadata.totalDuration} seconds long. Stopping now`)
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
    });

  }

})();

