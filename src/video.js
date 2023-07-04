const { DELAY_BETWEEN_AUDIO } = require("./config");

const makeComplexFilter = ({
  audioData,
  w,
  h,
  x,
  y,
  subtitlePath,
}) => {

  const filters = [
    `[0]crop=${[w, h, x, y].join(':')},subtitles=${subtitlePath}[vid]`,
    `[0:a]volume=0.0[mcsound]`,
    ...audioData.map(s => `[${s.idx+1}]adelay=${s.delay}|${s.delay}[aud${s.idx+1}]`),
    `${audioData.map(s => `[aud${s.idx+1}]`).join('')}amix=${audioData.length},apad[voices]`,
    `[mcsound][voices]amix=duration=first[muxed]`,
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
    `-ss ${start}`,
    `-t ${duration}`,
    `-i ${input}`,
    ...audioData.map(a => `-i ${a.mp3}`),
    `-filter_complex`,
    makeComplexFilter({
      audioData, h, w, x, y, subtitlePath
    }),
    `-map "[vid]:v" -map "[muxed]"`,
    `${output}`,
  ]

  return arguments
}

const generateVideo = ({ videoData, audioData, subtitlePath, output }) => {
  const lastAudioEl = audioData[audioData.length - 1];
  const duration = lastAudioEl.delay + lastAudioEl.duration*1000 + DELAY_BETWEEN_AUDIO;

  const ffmpegArgs = makeFfmpegVideoArgs({
    audioData,
    subtitlePath,
    input: videoData.input,
    output,
    start: videoData.start,
    duration: (duration/1000),
  })

  const ffmpegCmd = ['ffmpeg', ...ffmpegArgs].join(' \\\n  ')
  console.log(ffmpegCmd)
}

module.exports = {
  generateVideo,
}