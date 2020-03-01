const express = require('express');
const axios = require("axios");
const cookieParser = require('cookie-parser');

const gitHubUrl    = "https://api.github.com";
const authURL      = "https://github.com/login/oauth/access_token";
const clientID     = "7a3f63ef8ef5de99a305";
const clientSecret = "f802c7c697be1ccfbabda2eafe7e37f1719334b9";
const redirectUrl  = "http://127.0.0.1:4200";

const app = express();

app.use(cookieParser());

app.get('/', async (request, response) => {
    let code = request.url.slice(2);
    let token = '';

    try {
        let resp = await axios.post(
            `${authURL}?` +
            `client_id=${clientID}` +
            `&client_secret=${clientSecret}` +
            `&${code}` +
            `&redirect_uri=${redirectUrl}`,
        );
        token = resp.data.split('&')[0].split("=")[1];
    } catch (e) {
        console.log(e);
    }

    console.log(token);
    response.cookie('token', token);
    response.status(301).redirect('127.0.0.1:4200');
});

app.listen(4201, "127.0.0.1", (err) => {
    console.log("Auth server is started");
});
