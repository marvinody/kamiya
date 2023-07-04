const { DELAY_BETWEEN_AUDIO, bgs, } = require("./config");
const path = require('path');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);

const makeComplexFilter = ({
  audioData,
  w,
  h,
  x,
  y,
  subtitlePath,
}) => {

  const L = audioData.length;

  const filters = [
    `[0]crop=${[w, h, x, y].join(':')},subtitles=${subtitlePath}[vid]`,
    `${audioData.map(s => `[${s.idx + 1}]`).join(`[${L + 1}]`)}concat=n=${L * 2 - 1}:v=0:a=1[voices]`,
    '[voices]speechnorm=p=0.3[finala]'
  ];

  return `"${filters.join(';\n  ')}"`
}

const makeFfmpegVideoArgs = ({
  start = 0,
  duration = 5,
  input,
  output,
  w = 608,
  h = 1080,
  x = 656,
  y = 0,
  audioData,
  subtitlePath,
}) => {
  const arguments = [
    `-y`, // allow overwriting, cause it'll hang the client otherwise
    `-ss ${start}`,
    `-t ${duration}`,
    `-i ${input}`,
    ...audioData.map(a => `-i ${a.mp3}`),
    `  -f lavfi -i anullsrc=channel_layout=mono:sample_rate=22050:duration=${DELAY_BETWEEN_AUDIO / 1000}`,
    `-filter_complex`,
    makeComplexFilter({
      audioData, h, w, x, y, subtitlePath
    }),
    `-map "[vid]:v" -map "[finala]"`,
    `${output}`,
  ]

  return arguments
}

const determineStartPoint = ({ videoData, duration }) => {
  const availableRange = videoData.end - videoData.start - duration;
  const start = Math.floor(Math.random()*availableRange);
  return start;
}

const generateVideo = async ({ videoData, audioData, subtitlePath, output, duration }) => {
  const start = determineStartPoint({videoData, duration})

  const ffmpegArgs = makeFfmpegVideoArgs({
    audioData,
    subtitlePath,
    input: path.join(bgs, videoData.filename),
    output,
    start,
    duration,
  })

  const ffmpegCmd = ['ffmpeg', ...ffmpegArgs].join(' \\\n  ');
  console.debug(`Starting video generation`)
  console.time('video-gen');
  try {
    const {stderr, stdout} = await exec(ffmpegCmd);
  
  } catch (err) {
    console.timeEnd('video-gen');
    console.error(err);
    throw err;
  }
  console.timeEnd('video-gen');

  console.debug(`Video generated at ${output}`)
}

module.exports = {
  generateVideo,
}