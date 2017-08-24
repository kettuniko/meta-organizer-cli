const fs = require('fs')
const { promisify } = require('util')
const { ExifImage } = require('exif')
const mv = require('mv')
const { composeP, forEach, head, path, split } = require('ramda')

const readdir = promisify(fs.readdir)
const readExif = promisify(ExifImage)
const mvFile = promisify(mv)

const [, , targetDir] = process.argv

const readOriginalDate = composeP(
  split(':'),
  head,
  split(' '),
  path(['exif', 'DateTimeOriginal']),
  readExif
)

const moveToSubFolder = image =>
  readOriginalDate({ image: `${targetDir}/${image}` })
    .then(([year, month]) => mvFile(`${targetDir}/${image}`, `${targetDir}/${year}/${month}/${image}`, { mkdirp: true }))
    .catch(e => console.log(`Failed to read original date for ${image}, skipping`, e))

readdir(targetDir)
  .then(forEach(moveToSubFolder))
  .catch(console.log)

