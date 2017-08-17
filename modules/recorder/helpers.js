module.exports.blockExecution = function(ms) {
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      resolve()
    }, ms);
  });
}
