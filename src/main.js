const { promisify } = require('util');
const exec = promisify(require('child_process').exec);
const fs = require('fs/promises');
const { generateAudio, mixAudio } = require('./audio-synth');
const { generateSubtitles } = require('./subtitles');
const { generateVideo } = require('./video');
const { MAX_LENGTH } = require('./config');
const bgMetadata = require('../bg_metadata.json');



(async () => {
  const input = await fs.readFile('input.txt');

  const { linesWithMeta: audioData, metadata } = await generateAudio(input.toString());

  if(metadata.totalDuration*1000 > MAX_LENGTH) {
    console.info(`The video is estimated to be about ${metadata.totalDuration} seconds long. Stopping now`)
    return;
  }

  const subtitlePath = await generateSubtitles(audioData);

  const videoData = bgMetadata[0];

  const output = 'final.mp4'

  await generateVideo({
    audioData,
    output,
    subtitlePath,
    videoData,
    duration: metadata.totalDuration,
  });

})();

