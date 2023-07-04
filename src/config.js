const path = require('path');

module.exports = {
  staging: path.join(__dirname, '..', 'staging'),
  bgs: path.join(__dirname, '..', 'backgrounds'),
  DELAY_BETWEEN_AUDIO: 500,
  MAX_LENGTH: 60000,
}