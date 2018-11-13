
var os = require('os')
var platform = os.platform()
module.exports = {
  POWERSHELL_COMMAND: platform == "linux" ? "pwsh" : "powershell"
}
