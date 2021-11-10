module.exports = {
    delay: delay = ms => new Promise(resolve => setTimeout(resolve, ms))
}