const path = require('path');

module.exports = {
  staging: path.join(__dirname, '..', 'staging'),
  bgs: path.join(__dirname, '..', 'backgrounds'),
  inputs: path.join(__dirname, '..', 'inputs'),
  outputs: path.join(__dirname, '..', 'outputs'),
  DELAY_BETWEEN_AUDIO: 500,
  MAX_LENGTH: 60000,
}