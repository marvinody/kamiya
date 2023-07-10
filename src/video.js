const { DELAY_BETWEEN_AUDIO, bgs, } = require("../config");
const path = require('path');
const { promisify } = require('util');
const logger = require("./util/logger");
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
    `[0]crop=${[w, h, x, y].join(':')},subtitles=${subtitlePath}:force_style='Alignment=10,OutlineColour=&H100000000'[vid]`,
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
    // `-y`, // allow overwriting, cause it'll hang the client otherwise
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

const suggestedName = (title) => {
  const tags = [
    'reddit',
    'minecraftshorts',
    'parkour'
  ].map(s => '#'+s).join(' ');
  const spaced = title.replace(/_/g, ' ');

  return `${spaced[0].toUpperCase()}${spaced.slice(1)} ${tags}`
}

const generateVideo = async ({ videoData, audioData, subtitlePath, output, duration, title }) => {
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
  logger.info(`Starting video generation`);
  console.time('video-gen');
  try {
    const {stderr, stdout} = await exec(ffmpegCmd, {
      timeout: 60*1000
    });
  
  } catch (err) {
    console.timeEnd('video-gen');
    logger.error(err);
    throw err;
  }
  console.timeEnd('video-gen');

  logger.info(`Video generated at ${output}`);
  logger.info(`Suggested name: "${suggestedName(title)}"`);
}

module.exports = {
  generateVideo,
}