/**
 * Copyright 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

//Lead Retrieval
const bizSdk = require('facebook-nodejs-business-sdk');

var bodyParser = require('body-parser');
var express = require('express');
var app = express();
var xhub = require('express-x-hub');

app.set('port', (process.env.PORT || 5000));
app.listen(app.get('port'));

app.use(xhub({ algorithm: 'sha1', secret: process.env.APP_SECRET }));
app.use(bodyParser.json());

var token = process.env.VERIFY_TOKEN || 'token';
var received_updates = [];

app.get('/', function(req, res) {
  console.log(req);
  res.send('<pre>' + JSON.stringify(received_updates, null, 2) + '</pre>');
});

app.get(['/facebook', '/instagram', '/threads'], function(req, res) {
  if (
    req.query['hub.mode'] == 'subscribe' &&
    req.query['hub.verify_token'] == token
  ) {
    res.send(req.query['hub.challenge']);
  } else {
    res.sendStatus(400);
  }
});

app.post('/facebook', function(req, res) {
  console.log('Facebook request body:', JSON.stringify(req.body));
  
  if (!req.isXHubValid()) {
    console.log('Warning - request header X-Hub-Signature not present or invalid');
    res.sendStatus(401);
    return;
  }

  console.log('request header X-Hub-Signature validated');
  // Process the Facebook updates here
  received_updates.unshift(req.body);
  const { entry, object } = req.body;
  console.log('Lead  ID:', entry[0].changes[0].value.leadgen_id);
  getLeadInfoFromId(entry[0].changes[0].value.leadgen_id);
  res.sendStatus(200);
});

// app.post('/instagram', function(req, res) {
//   console.log('Instagram request body:');
//   console.log(req.body);
//   // Process the Instagram updates here
//   received_updates.unshift(req.body);
//   res.sendStatus(200);
// });

// app.post('/threads', function(req, res) {
//   console.log('Threads request body:');
//   console.log(req.body);
//   // Process the Threads updates here
//   received_updates.unshift(req.body);
//   res.sendStatus(200);
// });

const logApiCallResult = (apiCallName, data) => {
  console.log(apiCallName);
  
  const showDebugingInfo = true;
  if (showDebugingInfo) {
    console.log('Data:' + JSON.stringify(data));
  }
  
};

//Lead Retrieval
const getLeadInfoFromId = async (leadgen_id) => {

  const Lead = bizSdk.Lead;

  const access_token = process.env.ACCESS_TOKEN;
  const app_secret = process.env.APP_SECRET;
  const app_id = process.env.APP_ID;
  const id = leadgen_id;
  const api = bizSdk.FacebookAdsApi.init(access_token);

  const showDebugingInfo = true; // Setting this to true shows more debugging info.
  if (showDebugingInfo) {
    api.setDebug(true);
  }

  let fields, params;
  fields = [
  ];
  params = {
  };
  
  const sample_code = await (new Lead(id)).get(
    fields,
    params
  );

  received_updates.unshift(sample_code);
  logApiCallResult('sample_code api call complete.', sample_code);

}


app.listen();
