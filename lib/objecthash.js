const crypto = require("crypto")


function objectHash(obj) {
  if (obj.constructor !== Buffer && obj.constructor !== String) {
    obj = JSON.stringify(obj)
  }

  return crypto.createHash("md5").update(obj).digest("hex")
}

module.exports = objectHash

