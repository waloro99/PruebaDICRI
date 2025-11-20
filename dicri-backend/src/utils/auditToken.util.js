const { v4: uuidv4 } = require('uuid');

function generateAuditToken() {
  return uuidv4();
}

module.exports = {
  generateAuditToken
};
