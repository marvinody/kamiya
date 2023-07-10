const express = require('express');
const app = express();
// const fetch = require('node-fetch');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const config = require('../../config');
const tunnelmole = require('tunnelmole/cjs');

app.use(cookieParser());
app.use(cors());


const CLIENT_KEY = config.tiktok.client_key // this value can be found in app's developer portal
let SERVER_ENDPOINT_REDIRECT = 'your_redirect_uri'; // don't change this manually. auto-updated below

app.get('/', (req, res) => {
  res.send('<h1>Landing page, check console for more information</h1>');
})

app.get('/oauth', (req, res) => {
  const csrfState = Math.random().toString(36).substring(2);
  res.cookie('csrfState', csrfState, { maxAge: 60000 });

  let url = 'https://www.tiktok.com/v2/auth/authorize/';

  // the following params need to be in `application/x-www-form-urlencoded` format.
  url += `?client_key=${CLIENT_KEY}`;
  url += '&scope=user.info.basic';
  url += '&response_type=code';
  url += `&redirect_uri=${SERVER_ENDPOINT_REDIRECT}`;
  url += '&state=' + csrfState;

  res.redirect(url);
})


app.get('/redirect', (req, res) => {
  const displayText = Object.entries(req.query).map(([key, value]) => {
    return `<h2>${key}</h2><h3>${value}</h3>`;
  }).join('<hr>');

  res.send(displayText);

  console.log(`Access Token: ${req.query.code}`);
});

app.listen(config.tiktok.port, async () => {

  const origInfo = console.info;
  // we gotta do some hacky stuff to find the URL...
  console.info = (...args) => {
    const potentialStringMatch = args[0];

    const regexp = /https:\/\/(.*?) is forwarding to localhost/.exec(potentialStringMatch)

    if (!regexp) {
      return origInfo(...args);
    }

    const url = regexp[1];

    SERVER_ENDPOINT_REDIRECT = url;

    origInfo(...args);

    console.log(`Go to your Tiktok Dev page and add the "https://${url}/redirect" as a redirect URI`);
    console.log(`Make sure you've updated the client_key & client_secret in the config too`);
  }

  await tunnelmole({
    port: config.tiktok.port,
  });



})



