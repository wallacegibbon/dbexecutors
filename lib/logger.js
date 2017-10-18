function currentTime(red) {
  return `${new Date().toISOString()}> `;
}

function red(str) {
  return '\033[31m' + str + '\033[0m';
}

function green(str) {
  return '\033[32m' + str + '\033[0m';
}

function yellow(str) {
  return '\033[33m' + str + '\033[0m';
}

function blue(str) {
  return '\033[34m' + str + '\033[0m';
}

function error() {
  console.error.bind(null, red(currentTime())).apply(console, arguments);
}

function warn() {
  console.log.bind(null, yellow(currentTime())).apply(console, arguments);
}

function info() {
  console.log.bind(null, green(currentTime())).apply(console, arguments);
}

function debug() {
  console.log.bind(null, blue(currentTime())).apply(console, arguments);
}

function trace() {
  console.log.bind(null, currentTime()).apply(console, arguments);
}


module.exports = {
  error,
  warn,
  info,
  debug,
  trace,
};
