const { promisify } = require('util');
const exec = promisify(require('child_process').exec);
const fs = require('fs/promises');
const { generateAudio, mixAudio } = require('./audio-synth');
const { generateSubtitles } = require('./subtitles');
const { generateVideo } = require('./video');




(async () => {
  const input = await fs.readFile('input.txt');
  
  const audioData = await generateAudio(input.toString());

  const subtitlePath = await generateSubtitles(audioData);

  const videoData = {
    input: 'minecraft_bg.webm',
    start: 60,
  }

  const output = 'final.mp4'

  await generateVideo({
    audioData,
    output,
    subtitlePath,
    videoData,
  });
  
})();



// ffmpeg -ss 300 -t 60 \
//   -i minecraft_bg.webm \
//   -i staging/idx-000.mp3 \
//   -i staging/idx-001.mp3 \
//   -i staging/idx-002.mp3 \
//  -filter_complex \
//  "[0]crop=608:1080:656:0,subtitles=staging/captions.srt[vid];
//   [0:a]volume=0.0[mcsound];
//   [1]adelay=0|0[aud1];
//   [2]adelay=1900|1900[aud2];
//   [3]adelay=5300|5300[aud3];
//   [aud1][aud2][aud3]amix=3,apad[voices];
//   [mcsound][voices]amix=duration=first[muxed]" \
//   -map "[vid]:v" -map "[muxed]" \
//    test.mp4


   
//    -c:v libx264 

// ffmpeg -y -i original1.mp4 -i music1.mp3 -i music2.mp3 -i music3.mp3
//        -filter_complex "[1]adelay=5000|5000[aud1];
//                         [2]adelay=10000|10000[aud2];
//                         [3]adelay=120000|120000[aud3];
//                         [aud1][aud2][aud3]amix=3,apad[a];
//                         [0:a][a]amerge[a]"
//        -map 0:v -map "[a]" -c:v copy -ac 2 originalMovie1.mp4


// ffmpeg \
//   -ss 60 \
//   -t 38310.1945 \
//   -i minecraft_bg.webm \
//   -i /Users/batmanuel/code/node/kamiya/staging/idx-000.mp3 \
//   -i /Users/batmanuel/code/node/kamiya/staging/idx-001.mp3 \
//   -i /Users/batmanuel/code/node/kamiya/staging/idx-002.mp3 \
//   -i /Users/batmanuel/code/node/kamiya/staging/idx-003.mp3 \
//   -i /Users/batmanuel/code/node/kamiya/staging/idx-004.mp3 \
//   -i /Users/batmanuel/code/node/kamiya/staging/idx-005.mp3 \
//   -i /Users/batmanuel/code/node/kamiya/staging/idx-006.mp3 \
//   -i /Users/batmanuel/code/node/kamiya/staging/idx-007.mp3 \
//   -i /Users/batmanuel/code/node/kamiya/staging/idx-008.mp3 \
//   -i /Users/batmanuel/code/node/kamiya/staging/idx-009.mp3 \
//   -i /Users/batmanuel/code/node/kamiya/staging/idx-010.mp3 \
//   -filter_complex \
//   "[0]crop=608:1080:656:0,subtitles=/Users/batmanuel/code/node/kamiya/staging/captions.srt[vid];
//   [0:a]volume=0.0[mcsound];
//   [0]adelay=0|0[aud0];
//   [1]adelay=1910.5|1910.5[aud1];
//   [2]adelay=5362.25|5362.25[aud2];
//   [3]adelay=9388.75|9388.75[aud3];
//   [4]adelay=13676.5|13676.5[aud4];
//   [5]adelay=18695.75|18695.75[aud5];
//   [6]adelay=22069.25|22069.25[aud6];
//   [7]adelay=27245.25|27245.25[aud7];
//   [8]adelay=30044|30044[aud8];
//   [9]adelay=34096.75|34096.75[aud9];
//   [10]adelay=38306.25|38306.25[aud10];
//   [aud0],[aud1],[aud2],[aud3],[aud4],[aud5],[aud6],[aud7],[aud8],[aud9],[aud10]amix=11,apad[voices];
//   [mcsound][voices]amix=duration=first[muxed]" \
//   -map "[vid]:v" -map "[muxed]" \
//   final.mp4