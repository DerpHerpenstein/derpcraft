const express = require('express')
const path = require('path')
const config = require('./webpack.config.js');
const webpack = require('webpack');
const compiler = webpack(config);
const PORT = process.env.PORT || 5000



async function pack(){
  await new Promise((resolve, reject) => {
    compiler.run((err, res) => {
      if (err) {
        return reject(err);
      }
      resolve(res);
    });
  });
}

pack();

express()
  .use(express.static(path.join(__dirname, 'public')))
  .use((req, res, next) => {
    if(process.env.NODE_ENV === 'production') {
      if (req.header('x-forwarded-proto') !== 'https')
        res.redirect(`https://${req.header('host')}${req.url}`)
      else
        next()
    }
    else
      next()
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
