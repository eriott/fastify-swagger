const fs = require('fs')
const fse = require('fs-extra')
const swaggerUiAssetPath = require('swagger-ui-dist').getAbsoluteFSPath()
const resolve = require('path').resolve

const writeStream = fs.createWriteStream('prepare.log')

writeStream.write('Start prepare-swagger-ui.js\n')

let staticDir = resolve('./static')
writeStream.write(`Create /static directory by path ${staticDir}\n`)
fse.emptyDirSync(staticDir)

writeStream.write(`Copy assets from dir ${swaggerUiAssetPath}...\n`)

// since the original swagger-ui-dist folder contains non UI files
const filesToCopy = ['favicon-16x16.png',
  'favicon-32x32.png',
  'index.html',
  'oauth2-redirect.html',
  'swagger-ui-bundle.js',
  'swagger-ui-bundle.js.map',
  'swagger-ui-standalone-preset.js',
  'swagger-ui-standalone-preset.js.map',
  'swagger-ui.css',
  'swagger-ui.css.map',
  'swagger-ui.js',
  'swagger-ui.js.map']
filesToCopy.forEach(filename => {
  fse.copySync(`${swaggerUiAssetPath}/${filename}`, resolve(`./static/${filename}`))
})

writeStream.write(`All assets copied.\n`)

const newIndex = fs.readFileSync(resolve('./static/index.html'), 'utf8')
  .replace('window.ui = ui', `window.ui = ui

  function resolveUrl (url) {
      const anchor = document.createElement('a')
      anchor.href = url
      return anchor.href
  }`)
  .replace(
    /url: "(.*)",/,
    `url: resolveUrl('./json').replace('static/json', 'json'),
    oauth2RedirectUrl: resolveUrl('./oauth2-redirect.html'),`
  )

fse.writeFileSync(resolve('./static/index.html'), newIndex)

writeStream.write('Finished prepare-swagger-ui.js\n')
writeStream.end()
