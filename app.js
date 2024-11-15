const express = require('express');
const axios = require('axios');
const { join } = require("path");
require('dotenv').config();

const app = express();
const port = 3000;

const config = {
    client: {
        id: process.env.CLIENT_ID,
        secret: process.env.CLIENT_SECRET,
        redirect_url: process.env.REDIRECT_URL
    },
    auth: {
        tokenHost: process.env.AUTHGEAR_ENDPOINT,
        tokenPath: '/oauth2/token',
        authorizePath: '/oauth2/authorize',
        scope: 'openid offline_access'
    },
};

app.get("/", async (req, res) => {
    if (req.query.code != null) {
        const data = {
            client_id: config.client.id,
            client_secret: config.client.secret,
            code: req.query.code,
            grant_type: 'authorization_code',
            response_type: 'code',
            redirect_uri: config.client.redirect_url,
            scope: config.auth.scope
        };

        try {
            const tokenEndpoint = `${config.auth.tokenHost}${config.auth.tokenPath}`;
            const getToken = await axios.post(tokenEndpoint, data, {
                headers: { "Content-Type": "application/x-www-form-urlencoded" }
            });
            const accessToken = getToken.data.access_token;

            //get user profile info for current user
            const userInfoEndpoint = `${config.auth.tokenHost}/oauth2/userinfo`;
            const getUserInfo = await axios.get(userInfoEndpoint, {
                headers: { "Authorization": "Bearer " + accessToken }
            });
            const userInfo = getUserInfo.data;
            res.send(`
            <p>Welcome: ${accessToken}, </p>
            <pre>${JSON.stringify(userInfo, null, 2)}</pre>
            `);
        } catch (error) { 
            res.send("An error occoured! Login could not complete. Error data: " + error); 
        }
    }
    else {
        res.send(`
        <div style="max-width: 650px; margin: 16px auto; background-color: #EDEDED; padding: 16px;">
            <p>Hi there!</p>
            <p>This demo app shows you how to add user authentication to your Express app using Authgear</p>
            <p>Checkout <a href="https://docs.authgear.com">docs.authgear.com</a> to learn more about adding Authgear to your apps.</p>
            <a href="/login">Login</a>
        </div>
     `);
    }
});

app.get("/login", (req, res) => {
    const url = new URL(`${config.auth.tokenHost}${config.auth.authorizePath}`);
    url.searchParams.set('client_id', config.client.id);
    url.searchParams.set('redirect_uri', config.client.redirect_url);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', config.auth.scope);
  
    res.redirect(url);
  
  });

app.get("/spa", (req, res) => {
    res.sendFile(join(__dirname, "index.html"));
});

  app.listen(port, () => {
    console.log(`server started on port ${port}`);
  });
