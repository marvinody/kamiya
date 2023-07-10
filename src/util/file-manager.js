const fs = require('fs/promises');
const { inputs } = require('../../config');
const path = require('path')


const getInputs = async () => {
  const inputDirFiles = await fs.readdir(inputs)

  const mappedFiles = await Promise.all(inputDirFiles
  .filter(f => !f.startsWith('.'))
  .map(async f => ({
    title: path.basename(f, path.extname(f)),
    text: (await fs.readFile(path.join(inputs, f))).toString()
  })));

  return mappedFiles;
}

const videoExistsAlready = async (output) => {
  try {
    await fs.stat(output);
    return true;
  } catch (err) {
    return false;
  }
}

module.exports = {
  getInputs,
  videoExistsAlready,
}